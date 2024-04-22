import 'dotenv/config';
import Puppeteer, { Page } from 'puppeteer';
import process from 'process';

const API_URL = process.env.API_URL || 'http://localhost:5050';
const RENDER_URL = process.env.RENDER_URL || 'http://localhost:3000/schedule';
const PROCESSES_NUMBER = parseInt(process.env.PROCESSES) || 1;
const PROCESS_NUMBER = parseInt(process.env.PROCESS_NUMBER) || 1;
const PARALLEL = parseInt(process.env.TABS) || 12;
const PRINT_INTERVAL = 100;
console.log(`API_URL: ${API_URL}`);
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

async function fetchTimetables():Promise<{updated_at:string, pairs:string[]}> {
	console.log('Fetching timetables...');
	let response = await fetch(`${API_URL}/timetables`);
	console.log('Timetables fetched successfully');
	let r:{updated_at:string, pairs:string[]} = await response.json();
	// split the timetables.pairs into PROCESSES_NUMBER parts and return the one corresponding to PROCESS_NUMBER
	const pairs = r.pairs;
	const chunkSize = Math.ceil(pairs.length / PROCESSES_NUMBER);
	const start = (PROCESS_NUMBER - 1) * chunkSize;
	const end = start + chunkSize;
	r.pairs = pairs.slice(start, end);
	return r;
}

let prevStart = process.hrtime();
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
			if (count % PRINT_INTERVAL === 0) {
				const [seconds, nanoseconds] = process.hrtime(prevStart);
				const totalTimeInSeconds = seconds + nanoseconds / 1e9;
				const pdfsPerSecond = PRINT_INTERVAL / totalTimeInSeconds;
				console.log(`${count}/${total} @ ${pdfsPerSecond.toFixed(2)}/s`);
				prevStart = process.hrtime();
			}
		} catch (e) {
			console.error(`Error saving timetable as PDF: ${e.message}`);
		}
	}
}

async function processSegment(paths: string[], page: Page) {
	for (let path of paths) {
		await saveTimetableAsPDF(page, path);
	}
}

async function parallelGen(PARALLEL: number, timetablePaths: string[]) {
	let browserOpenStart = process.hrtime();
	const browser = await Puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']	});
	const pages = await Promise.all(Array.from({ length: PARALLEL }, () => browser.newPage()));
	let browserOpenEnd = process.hrtime(browserOpenStart);
	browserOpenTime += browserOpenEnd[0] + browserOpenEnd[1] / 1e9;

	for (let page of pages) {
		await page.setJavaScriptEnabled(false);
	}
	start = process.hrtime();
	const segments: string[][] = [];
	const segmentSize = Math.ceil(timetablePaths.length / PARALLEL);
	for (let i = 0; i < PARALLEL; i++) {
		segments.push(timetablePaths.slice(i * segmentSize, (i + 1) * segmentSize));
	}

	await Promise.all(pages.map((page, index) => processSegment(segments[index], page)));

	const [seconds, nanoseconds] = process.hrtime(start);
	const totalTimeInSeconds = seconds + nanoseconds / 1e9;
	const pdfsPerSecond = count / totalTimeInSeconds;
	console.log(`Rendered ${count} PDFs in ${secondsToHms(totalTimeInSeconds)} at ${pdfsPerSecond.toFixed(2)} PDFs/second`);
	console.log(`Page.goto time: ${pageGotoTime.toFixed(2)} seconds, PDF render time: ${pdfRenderTime.toFixed(2)} seconds, Browser open time: ${browserOpenTime.toFixed(2)} seconds`);

	count = 0; // Reset count for the next iteration
	await browser.close();
}

let updatedAt = '';
async function main() {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const timetableIndex = await fetchTimetables();
		if (timetableIndex.updated_at === updatedAt) {
			console.log('No new timetables found');
			// Sleep for 5 mins
			await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 5));
			return;
		}
		updatedAt = timetableIndex.updated_at;
		const timeTables = timetableIndex.pairs;
		total = timeTables.length;
		console.log(`Generating ${total} schedules with ${PARALLEL} workers...`);
		await parallelGen(PARALLEL, timeTables);
	}
}

main();