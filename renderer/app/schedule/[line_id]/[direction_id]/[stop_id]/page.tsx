import { Facility, Line, Pattern, Timetable } from './apitypes';
import QRCode from 'qrcode';
import Header from './Header';
import Spine from './Spine';
import Schedule from './Schedule';
import ScheduleInfo from './ScheduleInfo';
import Footer from './Footer';
import { Metadata } from 'next';

const API_URL = process.env.API_URL || 'http://localhost:5050';
const QR_URL = process.env.QR_URL || 'https://qr.carrismetropolitana.pt/horarios';

export async function generateMetadata({ params }:{params:{line_id:string, stop_id:string, direction_id:string}}): Promise<Metadata> {
	return {
		title: `Horário ${params.line_id} - #${params.stop_id}`,
		description: `Horário ${params.line_id}/${params.direction_id} - #${params.stop_id}`,
	};
}
/**
 * Fetch JSON from a list of URLs
 * @param urls List of URLs to fetch JSON from
 * @returns A promise that resolves to an array of JSON objects
 */
function urlsToJson<T extends readonly string[]>(urls: [...T]) {
	// Deluxe Typescript magic™ to make the return type an array of the same length as the input array
	return Promise.all(urls.map(url => fetch(url).then(res => res.json()))) as Promise<{ -readonly [P in keyof T]: any; }>;
}

export default async function Page({ params }:{params:{line_id:string, stop_id:string, direction_id:string}}) {
	// Start by fetching the timetable and line data
	const [timetable, line]:[Timetable, Line] = await urlsToJson([
		`${API_URL}/timetables/${params.line_id}/${params.direction_id}/${params.stop_id}`,
		`${API_URL}/lines/${params.line_id}`,
	]);

	// Should not happen, but just in case we check if our query went well and it has the adequate data
	if (!timetable) {
		console.error('timetable is undefined', timetable, params.line_id, params.direction_id, params.stop_id);
	}
	if (!timetable.secondaryPatterns) {
		console.error('timetable.secondaryPatterns is undefined', timetable);
		return;
	}

	// Fetch pattern for the spine
	const patternURL = `${API_URL}/patterns/${timetable.patternForDisplay}`;
	const pattern:Pattern = await fetch(patternURL).then(patternRes => patternRes.json());
	// Check if the pattern has more than one stop in its path
	if (!pattern.path || !pattern.path[1] || !pattern.path[1].stop) {
		console.error(patternURL, 'pattern.path[1].stop is undefined, pattern:', pattern);
		return;
	}

	// Headsign is the line name if the pattern is the main one, otherwise we fetch the variant line name
	const headsign:string = timetable.patternForDisplay.split('_')[1] === '0' ?
		line.long_name :
		await fetch(`${API_URL}/routes/${timetable.patternForDisplay.slice(0, -2)}`).then(res => res.json()).then(line => line.long_name);

	// Fetch info for the stop we are in
	const stopInfoURL = `${API_URL}/stops/${params.stop_id}`;
	const stopInfo = await fetch(stopInfoURL).then(res => res.json());

	if (!stopInfo) {
		console.error(stopInfoURL, 'stopInfo is undefined', stopInfo);
		return;
	}
	// Transform the pattern path into a list with our desired format, including a mocked delay
	const stops = pattern.path.map(stop => ({
		name: stop.stop.name,
		municipality: stop.stop.municipality_name,
		locality: stop.stop.locality,
		facilities: stop.stop.facilities,
		id: stop.stop.id,
		delay: 1,
	}));

	// date in dd.mm.yyyy
	const now = new Date;
	const today = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

	// Score stops based on facilities and municipality transition
	const scores = {
		current: 1000, // how many points to add to the stop for the schedule we are generating
		transition: 40, // how many points to add when transitioning municipalities
		facility: {
			'near_health_clinic': 29,
			'near_hospital': 30,
			'near_university': 20,
			'school': 5,
			'near_police_station': 5,
			'near_fire_station': 5,
			'shopping': 10,
			'near_historic_building': 3,
			'transit_office': 25,
			'light_rail': 50,
			'subway': 51,
			'train': 55,
			'boat': 55,
			'airport': 80,
			'bike_sharing': 10,
			'bike_parking': 10,
			'car_parking': 10,
		},
		facilityDefault: 1,
	} as const;

	// We already checked previously if the pattern has more than one stop, so we can safely assume the first and last stops exist
	const firstStop = stops[0];
	const lastStop = stops[stops.length - 1];
	const scoredStops:{
		index: number,
		stop: typeof stops[0],
		score: number,
		show: boolean,
	}[] = [];
	// Score stops based on facilities and municipality transition, not counting first or last as they are always shown
	for (let i = 1; i < stops.length - 1; i++) {
		const stop = stops[i];
		let score = 0;
		for (let facility of stop.facilities) {
			score += scores.facility[facility] || scores.facilityDefault;
		}
		// isTransition is true if the previous stop is in a different municipality
		const isTransition = stops[i - 1].municipality != stop.municipality;
		if (isTransition) {
			score += scores.transition;
		}
		// Add points if this is the stop we are currently at
		if (stop.id == params.stop_id) {
			score += scores.current;
		}
		scoredStops.push({ index: i - 1, stop, score, show: false });
	}
	// Number of stops to show
	const limit = 23;

	let shownStopsCount = 1;
	let sortedScoredStops = scoredStops.toSorted((a, b) => b.score - a.score);
	for (let i = 0; i < sortedScoredStops.length; i++) {
		const stop = sortedScoredStops[i];
		let toAdd = 0;
		/*
		If the stop before and after are not shown, showing this stop will take 2 extra slots.
		It will turn this:
			[+3 stops bundle (with ours)]
		into this:
			[+1 stop bundle]
			[+1 our_stop]
			[+1 stop bundle]

		If only one of the stops before or after is shown, showing this stop will take 1 extra slot.
		It will turn this:
			[+2 stops bundle (with ours)]
			[+1 other shown stop]
		into this:
			[+1 stop_bundle]
			[+1 our_stop]
			[+1 other shown stop]
		*/
		if (!scoredStops[stop.index - 1]?.show && !scoredStops[stop.index + 1]?.show) {
			toAdd = 2;
		} else if (!scoredStops[stop.index - 1]?.show || !scoredStops[stop.index + 1]?.show) {
			toAdd = 1;
		}
		if (toAdd + shownStopsCount <= limit) {
			shownStopsCount += toAdd;
			stop.show = true;
		}
	}

	// Generate which delays and spans to render (currently hidden)
	const delays = [];
	const renderedStops:({type:'skipped', count:number, municipality:string[], stops:(typeof stops[0])[]}|{type:'stop', stop:typeof stops[0]})[] = [];

	const MAX_DELAY_SPAN = 2;
	let accumulatedDelay = 0;
	let delaySpan = 0;
	let lastDelayIndex = 0;
	for (let i = 0; i < scoredStops.length; i++) {
		let stop = scoredStops[i];
		let accumulatedMunicipalities = [];
		let accumulatedStops = [];
		let skippedStops = 0;
		// while we havent finished building a delay span, we keep iterating
		while (i < scoredStops.length && !stop.show) {
			if (accumulatedMunicipalities.indexOf(stop.stop.municipality) == -1) {
				accumulatedMunicipalities.push(stop.stop.municipality);
				accumulatedStops.push(stop.stop);
			}
			accumulatedDelay += stop.stop.delay;
			i++;
			stop = scoredStops[i];
			skippedStops++;
		}
		if (skippedStops > 0) {
			renderedStops.push({ type: 'skipped', count: skippedStops, municipality: accumulatedMunicipalities, stops: accumulatedStops });
			delaySpan++;
		}
		if (stop) {
			renderedStops.push({ type: 'stop', stop: stop.stop });
			delaySpan++;
			accumulatedDelay += stop.stop.delay;
		}
		if (delaySpan >= MAX_DELAY_SPAN || i >= scoredStops.length - 1) {
			delays.push({ startAt: lastDelayIndex, delay: accumulatedDelay, span: delaySpan });
			lastDelayIndex = renderedStops.length;
			delaySpan = 0;
			accumulatedDelay = 0;
		}
	}
	if (delays.length > 0) {
		delays[delays.length - 1].span += 1;
		delays[delays.length - 1].delay += lastStop.delay;
	}

	for (let stopIndex in renderedStops) {
		const stop = renderedStops[stopIndex];
		if (stop.type == 'skipped' && stop.count == 1) {
			// console.log(stop.municipality);
			renderedStops[stopIndex] = { type: 'stop', stop: stop.stops[0] };
		}
	}

	// Generate a set of facilities to show in the footer, currently unused
	let facilitySet:Set<Facility> = new Set;
	for (let stop of renderedStops.concat({ type: 'stop', stop: firstStop }, { type: 'stop', stop: lastStop })) {
		if (stop.type == 'stop') {
			for (let facility of stop.stop.facilities) {
				facilitySet.add(facility);
			}
		}
	}

	// Generate QR code svg
	let dataurl = await QRCode.toString(`${QR_URL}/${params.line_id}/${params.direction_id}/${params.stop_id}`,
		{
			errorCorrectionLevel: 'H', margin: 0, type: 'svg', color: { dark: '#000000', light: '#ffffff' },
		});

	return (
		<div>
			<Header backgroundColor={pattern.color} color={pattern.text_color} lineId={params.line_id} headsign={headsign} dataurl={dataurl} />
			<div className='flex flex-row w-full p-4'>
				<Spine className='grow -translate-y-3.5' color={pattern.color} firstStop={firstStop} lastStop={lastStop} delays={delays} renderedStops={renderedStops} currentStopId={params.stop_id} />
				<div className='text-neutral-800 w-[430px] flex flex-col gap-4'>
					<ScheduleInfo name={stopInfo.name } stopId={params.stop_id} startDate={process.env.SCHEDULE_INFO_START_DATE || today}/>
					<Schedule className='justify-self-end' timetable={timetable} />
				</div>
			</div>
			<div className='fixed bottom-0 w-full'>
				<Footer line_id={params.line_id} direction_id={params.direction_id} stop_id={params.stop_id} user_url={QR_URL} facilities={Array.from(facilitySet)}/>
			</div>
		</div>
	);
}