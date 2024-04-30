import 'dotenv/config';
import puppeteer, { Page, Browser } from 'puppeteer';
import process from 'process';

const QUEUE_URL = process.env.QUEUE_URL || 'http://localhost:5052';
const RENDER_URL = process.env.RENDER_URL || 'http://localhost:3000/schedule';
const PARALLEL = parseInt(process.env.TABS) || 12;
const CACHE_SIZE = PARALLEL * 2;
const REFRESH_AFTER = parseInt(process.env.REFRESH_AFTER) || 100;
console.log(`QUEUE_URL: ${QUEUE_URL}`);
console.log(`RENDER_URL: ${RENDER_URL}`);
console.log(`PARALLEL: ${PARALLEL}`);

let count = 0;
let total = 0;
let start = process.hrtime();

let pageGotoTime = 0;
let pdfRenderTime = 0;
let browserOpenTime = 0;

function secondsToHms(d: number) {
	d = Number(d);
	let h = Math.floor(d / 3600);
	let m = Math.floor(d % 3600 / 60);
	let s = Math.floor(d % 3600 % 60);

	let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
	let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
	let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
	return hDisplay + mDisplay + sDisplay;
}

async function saveTimetableAsPDF(page: Page, path: string) {
	let success = false;
	while (!success) {
		try {
			let gotoStart = process.hrtime();
			await page.goto(`${RENDER_URL}/${path}`, { waitUntil: 'load' });
			let gotoEnd = process.hrtime(gotoStart);
			pageGotoTime += gotoEnd[0] + gotoEnd[1] / 1e9;

			let renderStart = process.hrtime();
			await page.pdf({ path: `pdfs/timetable-${path.replace(/\//g, '-')}.pdf`, format: 'A4', printBackground: true });
			let renderEnd = process.hrtime(renderStart);
			pdfRenderTime += renderEnd[0] + renderEnd[1] / 1e9;

			success = true;
			count++;
		} catch (e) {
			console.error(`Error saving timetable as PDF: ${e.message}`);
		}
	}
}

async function processSegment(paths: AsyncGenerator<string>, browser: Browser) {
	let i = 0;
	let page = await browser.newPage();
	await page.setJavaScriptEnabled(false);

	for await (let path of paths) {
		i++;
		await saveTimetableAsPDF(page, path);
		if (i % REFRESH_AFTER === 0) {
			await page.close();
			page = await browser.newPage();
			await page.setJavaScriptEnabled(false);
		}
	}
}

async function parallelGen(PARALLEL: number, timetablePaths: AsyncGenerator<string, void, unknown>) {
	const browser = await puppeteer.launch({ headless: true, devtools: false, args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-zygote'] });

	start = process.hrtime();

	let promises = [];
	for (let pageN = 0; pageN < PARALLEL; pageN++) {
		promises.push((async () => {
			await processSegment(timetablePaths, browser);
		})());
	}
	await Promise.all(promises);

	const [seconds, nanoseconds] = process.hrtime(start);
	const totalTimeInSeconds = seconds + nanoseconds / 1e9;
	const pdfsPerSecond = count / totalTimeInSeconds;
	console.log(`Rendered ${count} PDFs in ${secondsToHms(totalTimeInSeconds)} at ${pdfsPerSecond.toFixed(2)} PDFs/second`);
	console.log(`Page.goto time: ${pageGotoTime.toFixed(2)} seconds, PDF render time: ${pdfRenderTime.toFixed(2)} seconds, Browser open time: ${browserOpenTime.toFixed(2)} seconds`);

	count = 0; // Reset count for the next iteration
	await browser.close();
}

let queue: string[] = [];
let finished = false;

// Helper function to fetch items and replenish the queue
async function replenishQueue() {
	while (!finished && queue.length < CACHE_SIZE) {
		if (finished || queue.length >= CACHE_SIZE) {
			break;
		}

		try {
			let response = await fetch(`${QUEUE_URL}/nextitem`);
			let maybeItem: { finished: boolean, item: string | null } = await response.json();

			if (maybeItem.finished) {
				finished = true;
			} else if (maybeItem.item) {
				queue.push(maybeItem.item);
				// console.log(`Item added: ${maybeItem.item}`);
			}
		} catch (error) {
			console.error('Failed to fetch item:', error);
		}
	}
	// console.log(`Replenished queue with ${queue.length} items`);
}

// Asynchronous generator function to manage the queue and yield items
async function* itemGenerator() {
	while (!finished || queue.length > 0) {
		// console.log(`Queue length: ${queue.length}, finished: ${finished}`);
		if (!finished && queue.length === 0) {
			await replenishQueue(); // Call replenishQueue without awaiting it
			console.log('Had to wait for replenishQueue');
		} else if (queue.length < CACHE_SIZE && !finished) {
			replenishQueue(); // Call replenishQueue without awaiting it
		}

		const item = queue.shift(); // Remove the item from the front of the queue
		yield item; // Yield the current item
	}
}

parallelGen(PARALLEL, itemGenerator());