import getRedisClient from '@/app/services/redis';
import { Metadata } from 'next';
import QRCode from 'qrcode';

import Footer from './Footer';
import Header from './Header';
import Schedule from './Schedule';
import ScheduleInfo from './ScheduleInfo';
import Spine from './Spine';
import { Facility, Line, Pattern, Timetable } from './apitypes';

const VALID_FROM = process.env.VALID_FROM_DATE || (() => {
	const now = new Date();
	return `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
})();

const QR_URL = process.env.QR_URL || 'https://qr.carrismetropolitana.pt/horarios';
const REDIS = await getRedisClient();

export async function generateMetadata({ params }: { params: { direction_id: string, line_id: string, stop_id: string } }): Promise<Metadata> {
	return {
		description: `Horário ${params.line_id}/${params.direction_id} - #${params.stop_id}`,
		title: `Horário ${params.line_id} - #${params.stop_id}`,
	};
}
/**
 * Fetch JSON from a list of URLs
 * @param urls List of URLs to fetch JSON from
 * @returns A promise that resolves to an array of JSON objects
 */
function urlsToJson<T extends readonly string[]>(urls: [...T]) {
	// Deluxe Typescript magic™ to make the return type an array of the same length as the input array
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return Promise.all(urls.map(url => fetch(url).then(res => res.json()))) as Promise<{ -readonly [P in keyof T]: any; }>;
}

function keysToJson<T extends readonly string[]>(keys: [...T]) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return Promise.all(keys.map(key => REDIS.get(key).then(res => res ? JSON.parse(res) : null))) as Promise<{ -readonly [P in keyof T]: any; }>;
}

export default async function Page({ params }: { params: { direction_id: string, line_id: string, stop_id: string } }) {
	// Start by fetching the timetable and line data

	const [timetable, line]: [Timetable, Line] = await keysToJson([
		`timetables:${params.line_id}/${params.direction_id}/${params.stop_id}`,
		`lines:${params.line_id}`,
	]);

	// Should not happen, but just in case we check if our query went well and it has the adequate data
	if (!timetable) {
		console.error('timetable is undefined');
	}
	if (!timetable.secondaryPatterns) {
		console.error('timetable.secondaryPatterns is undefined', timetable);
		throw new Error('timetable.secondaryPatterns is undefined');
	}

	// Fetch pattern for the spine
	const patternText = await REDIS.get(`patterns:${timetable.patternForDisplay}`);
	if (!patternText) {
		console.error('patternText is undefined', timetable.patternForDisplay);
		throw new Error('patternText is undefined');
	}
	let pattern: Pattern;
	try	{
		pattern = JSON.parse(patternText);
	}
	catch (e) {
		console.error('Error parsing pattern', patternText);
		throw e;
	}

	if (!pattern) {
		console.error('pattern is undefined', pattern);
		throw new Error('pattern is undefined');
	}
	// Check if the pattern has more than one stop in its path
	if (!pattern.path || !pattern.path[1] || !pattern.path[1].stop) {
		console.error('pattern.path[1].stop is undefined, pattern:', pattern);
		throw new Error('pattern.path[1].stop is undefined');
	}

	// Headsign is the line name if the pattern is the main one, otherwise we fetch the variant line name
	const headsign: string = timetable.patternForDisplay.split('_')[1] === '0'
		? line.long_name
		: await REDIS.get(`routes:${timetable.patternForDisplay.slice(0, -2)}`).then(res => res ? JSON.parse(res).long_name : null);
	if (!headsign) {
		console.error('headsign is undefined', headsign);
		throw new Error('headsign is undefined');
	}

	// Fetch info for the stop we are in
	// const stopInfoURL = `${API_URL}/stops/${params.stop_id}`;
	// const stopInfo = await fetch(stopInfoURL).then(res => res.json());
	const stopInfo = await REDIS.get(`stops:${params.stop_id}`).then(res => res ? JSON.parse(res) : null);

	if (!stopInfo) {
		console.error('stopInfo is undefined', params.stop_id, stopInfo);
		throw new Error('stopInfo is undefined');
	}
	// Transform the pattern path into a list with our desired format, including a mocked delay
	const stops = pattern.path.map(stop => ({
		delay: 1,
		facilities: stop.stop.facilities,
		id: stop.stop.id,
		locality: stop.stop.locality,
		municipality: stop.stop.municipality_name,
		name: stop.stop.name,
	}));

	// Score stops based on facilities and municipality transition
	const scores = {
		current: 1000, // how many points to add to the stop for the schedule we are generating
		facility: {
			airport: 80,
			bike_parking: 10,
			bike_sharing: 10,
			boat: 55,
			car_parking: 10,
			light_rail: 50,
			near_fire_station: 5,
			near_health_clinic: 29,
			near_historic_building: 3,
			near_hospital: 30,
			near_police_station: 5,
			near_university: 20,
			school: 5,
			shopping: 10,
			subway: 51,
			train: 55,
			transit_office: 25,
		},
		facilityDefault: 1,
		transition: 40, // how many points to add when transitioning municipalities
	} as const;

	// We already checked previously if the pattern has more than one stop, so we can safely assume the first and last stops exist
	const firstStop = stops[0];
	const lastStop = stops[stops.length - 1];
	const scoredStops: {
		index: number
		score: number
		show: boolean
		stop: typeof stops[0]
	}[] = [];
	// Score stops based on facilities and municipality transition, not counting first or last as they are always shown
	for (let i = 1; i < stops.length - 1; i++) {
		const stop = stops[i];
		let score = 0;
		for (const facility of stop.facilities) {
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
		scoredStops.push({ index: i - 1, score, show: false, stop });
	}
	// Number of stops to show
	const limit = 23;

	let shownStopsCount = 1;
	const sortedScoredStops = scoredStops.toSorted((a, b) => b.score - a.score);
	for (const stop of sortedScoredStops) {
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
		}
		else if (!scoredStops[stop.index - 1]?.show || !scoredStops[stop.index + 1]?.show) {
			toAdd = 1;
		}
		if (toAdd + shownStopsCount <= limit) {
			shownStopsCount += toAdd;
			stop.show = true;
		}
	}

	// Generate which delays and spans to render (currently hidden)
	const delays = [];
	const renderedStops: ({ count: number, municipality: string[], stops: (typeof stops[0])[], type: 'skipped' } | { stop: typeof stops[0], type: 'stop' })[] = [];

	const MAX_DELAY_SPAN = 2;
	let accumulatedDelay = 0;
	let delaySpan = 0;
	let lastDelayIndex = 0;
	for (let i = 0; i < scoredStops.length; i++) {
		let stop = scoredStops[i];
		const accumulatedMunicipalities = [];
		const accumulatedStops = [];
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
			renderedStops.push({ count: skippedStops, municipality: accumulatedMunicipalities, stops: accumulatedStops, type: 'skipped' });
			delaySpan++;
		}
		if (stop) {
			renderedStops.push({ stop: stop.stop, type: 'stop' });
			delaySpan++;
			accumulatedDelay += stop.stop.delay;
		}
		if (delaySpan >= MAX_DELAY_SPAN || i >= scoredStops.length - 1) {
			delays.push({ delay: accumulatedDelay, span: delaySpan, startAt: lastDelayIndex });
			lastDelayIndex = renderedStops.length;
			delaySpan = 0;
			accumulatedDelay = 0;
		}
	}
	if (delays.length > 0) {
		delays[delays.length - 1].span += 1;
		delays[delays.length - 1].delay += lastStop.delay;
	}

	for (const stopIndex in renderedStops) {
		const stop = renderedStops[stopIndex];
		if (stop.type == 'skipped' && stop.count == 1) {
			// console.log(stop.municipality);
			renderedStops[stopIndex] = { stop: stop.stops[0], type: 'stop' };
		}
	}

	// Generate a set of facilities to show in the footer, currently unused
	const facilitySet = new Set<Facility>();
	for (const stop of renderedStops.concat({ stop: firstStop, type: 'stop' }, { stop: lastStop, type: 'stop' })) {
		if (stop.type == 'stop') {
			for (const facility of stop.stop.facilities) {
				facilitySet.add(facility);
			}
		}
	}

	// Generate QR code svg
	const dataurl = await QRCode.toString(`${QR_URL}/${params.line_id}/${params.direction_id}/${params.stop_id}`,
		{
			color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'H', margin: 0, type: 'svg',
		});

	return (
		<div>
			<Header backgroundColor={pattern.color} color={pattern.text_color} dataurl={dataurl} headsign={headsign} lineId={params.line_id} />
			<div className="flex flex-row w-full p-4">
				<Spine className="grow -translate-y-3.5" color={pattern.color} currentStopId={params.stop_id} delays={delays} firstStop={firstStop} lastStop={lastStop} renderedStops={renderedStops} />
				<div className="text-neutral-800 w-[430px] flex flex-col gap-4">
					<ScheduleInfo name={stopInfo.name} startDate={VALID_FROM} stopId={params.stop_id} />
					<Schedule className="justify-self-end" timetable={timetable} />
				</div>
			</div>
			<div className="fixed bottom-0 w-full">
				<Footer direction_id={params.direction_id} facilities={Array.from(facilitySet)} line_id={params.line_id} stop_id={params.stop_id} user_url={QR_URL} />
			</div>
		</div>
	);
}
