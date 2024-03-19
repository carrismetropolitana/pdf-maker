import Puppeteer from 'puppeteer';

async function fetchTimetables() {
	let response = await fetch('http://localhost:5051/timetables');
	return response.json();
}

async function saveTimetableAsPDF(page, line_id, stop_id) {
	await page.goto(`http://localhost:3000/schedule/${line_id}/${stop_id}`, { waitUntil: 'networkidle2' });
	await page.pdf({ path: `pdfs/timetable-${line_id}-${stop_id}.pdf`, format: 'A4', printBackground: true });
}

async function processSegment(segment, page) {
	for (let [line_id, stop_id] of segment) {
		await saveTimetableAsPDF(page, line_id, stop_id);
	}
}

(async () => {
	const PARALLEL = 50;
	const timetableIndex = await fetchTimetables();

	const browser = await Puppeteer.launch();
	const pages = await Promise.all(Array.from({ length: PARALLEL }, () => browser.newPage()));

	const segments = [];
	const segmentSize = Math.ceil(timetableIndex.length / PARALLEL);
	for (let i = 0; i < PARALLEL; i++) {
		segments.push(timetableIndex.slice(i * segmentSize, (i + 1) * segmentSize));
	}

	await Promise.all(pages.map((page, index) => processSegment(segments[index], page)));

	await browser.close();
})();