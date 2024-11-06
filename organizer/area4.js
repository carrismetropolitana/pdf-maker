import fs from 'fs';

const WANTED_LINES = [
	'4512',
	'4600',
	'4701',
	'4702',
	'4704',
	'4705',
	'4706',
	'4707',
	'4710',
	'4711',
	'4715',
	'4720',
	'4725',
];

(async () => {
	const allStopsRes = await fetch('https://api.carrismetropolitana.pt/v2/stops');
	const allStopsData = await allStopsRes.json();

	const selectedStops = new Set();

	for (const stopData of allStopsData) {
		for (const wantedLine of WANTED_LINES) {
			if (stopData.lines.includes(wantedLine)) {
				selectedStops.add(stopData.id);
			}
		}
	}

	// From a given directory, move all folders that are named the same as each element in selectedStops to a new directory
	const stopsDir = process.cwd() + '/all_pdfs';
	const newDir = process.cwd() + '/selected_pdfs';

	const allFiles = fs.readdirSync(stopsDir);

	for (const file of allFiles) {
		if (selectedStops.has(file)) {
			fs.renameSync(stopsDir + '/' + file, newDir + '/' + file);
			console.log('DONE: ', file);
		}
	}
})();
