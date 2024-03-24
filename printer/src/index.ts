import Puppeteer, { Page } from 'puppeteer';
import process from 'process';
import fs from 'fs';
type StopId = string;
type LineId = string;

let count = 0;
let start = process.hrtime();

async function fetchTimetables():Promise<[StopId, LineId][]> {
	console.log('Fetching timetables...');
	let response = await fetch('http://localhost:5051/timetables');
	console.log('Timetables fetched successfully');
	return response.json();
}

let prevStart = process.hrtime();
async function saveTimetableAsPDF(page: Page, line_id: string, stop_id: string) {
	let success = false;
	while (!success) {
		try {
			// console.log(`Generating PDF for line_id: ${line_id}, stop_id: ${stop_id}`);
			await page.goto(`http://localhost:3000/schedule/${line_id}/${stop_id}`, { waitUntil: 'load' });
			await page.pdf({ path: `pdfs/timetable-${line_id}-${stop_id}.pdf`, format: 'A4', printBackground: true });
			success = true;
			count++;
			if (count % 100 === 0) {
				const [seconds, nanoseconds] = process.hrtime(prevStart);
				const totalTimeInSeconds = seconds + nanoseconds / 1e9;
				const pdfsPerSecond = 100 / totalTimeInSeconds;
				console.log(`Generated ${count} PDFs, Rate: ${pdfsPerSecond.toFixed(2)} PDFs/second`);
				prevStart = process.hrtime();
			}
		} catch (e) {
			console.error(`Error saving timetable as PDF: ${e.message}`);
		}
	}
}

async function processSegment(segment: [string, string][], page: Page) {
	for (let [line_id, stop_id] of segment) {
		await saveTimetableAsPDF(page, line_id, stop_id);
	}
}

async function parallelGen(PARALLEL: number, timetableIndex: [string, string][]) {
	console.log('Starting parallel generation...');
	const browser = await Puppeteer.launch();
	const pages = await Promise.all(Array.from({ length: PARALLEL }, () => browser.newPage()));

	for (let page of pages) {
		page.setJavaScriptEnabled(false);
	}
	start = process.hrtime();
	await saveTimetableAsPDF(pages[0], '2711', '060011'); // Warm up the browser
	const segments: [string, string][][] = [];
	const segmentSize = Math.ceil(timetableIndex.length / PARALLEL);
	for (let i = 0; i < PARALLEL; i++) {
		segments.push(timetableIndex.slice(i * segmentSize, (i + 1) * segmentSize));
	}

	await Promise.all(pages.map((page, index) => processSegment(segments[index], page)));

	const [seconds, nanoseconds] = process.hrtime(start);
	const totalTimeInSeconds = seconds + nanoseconds / 1e9;
	const pdfsPerSecond = count / totalTimeInSeconds;
	console.log(`Parallelism: ${PARALLEL}, PDFs generated: ${count}, Total time: ${totalTimeInSeconds.toFixed(2)} seconds, Rate: ${pdfsPerSecond.toFixed(2)} PDFs/second`);

	count = 0; // Reset count for the next iteration
	await browser.close();
}

async function main() {
	console.log('Starting main function...');
	const timetableIndex = (await fetchTimetables()).slice(0, 1000);

	const PARALLEL = 40;
	await parallelGen(PARALLEL, timetableIndex);
	console.log('Main function completed');
}

main();