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
function urlsToJson<T extends readonly string[]>(urls: [...T]) {
	// Deluxe Typescript magic™ to make the return type an array of the same length as the input array
	return Promise.all(urls.map(url => fetch(url).then(res => res.json()))) as Promise<{ -readonly [P in keyof T]: any; }>;
}

export default async function Page({ params }:{params:{line_id:string, stop_id:string, direction_id:string}}) {
	const [timetable, line]:[Timetable, Line] = await urlsToJson([
		`${API_URL}/timetables/${params.line_id}/${params.direction_id}/${params.stop_id}`,
		`${API_URL}/lines/${params.line_id}`,
	]);
	// console.log(JSON.stringify(timetable, null, 2));
	const patternURL = `${API_URL}/patterns/${timetable.patternForDisplay}`;
	const patternRes = fetch(patternURL).then(patternRes => patternRes.json());
	if (!timetable.secondaryPatterns) {
		console.error('timetable.secondaryPatterns is undefined', timetable);
		return;
	}
	// const secondaryPatternsPromise = urlsToJson(timetable.secondaryPatterns
	// 	.map(patternId => `${API_URL}/patterns/${patternId}`));

	// const [pattern, secondaryPatterns]:[ Pattern, Pattern[] ] = await Promise.all([patternRes, secondaryPatternsPromise]);
	const pattern:Pattern = await patternRes;
	if (!pattern.path || !pattern.path[1] || !pattern.path[1].stop) {
		console.error(patternURL, 'pattern.path[1].stop is undefined, pattern:', pattern);
		return;
	}
	// console.log(line);
	const stopInfoURL = `${API_URL}/stops/${params.stop_id}`;
	const stopInfoRes = await fetch(stopInfoURL);
	const stopInfo = await stopInfoRes.json();

	if (!stopInfo) {
		console.error(stopInfoURL, 'stopInfo is undefined', stopInfo);
		return;
	}
	const stops = pattern.path.map(stop => ({
		name: stop.stop.name,
		municipality: stop.stop.municipality_name,
		locality: stop.stop.locality,
		facilities: stop.stop.facilities,
		id: stop.stop.id,
		delay: 1,
	}));
	// console.log(stops);

	// date in dd.mm.yyyy
	const today = (new Date).toISOString().split('T')[0].split('-').reverse().join('.');

	const scores = {
		current: 1000,
		transition: 40,
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

	const firstStop = stops[0];
	const lastStop = stops[stops.length - 1];
	const scoredStops = [];
	for (let i = 1; i < stops.length - 1; i++) {
		const stop = stops[i];
		// if (stop.facilities.length > 0) console.log(stop.facilities);
		let score = 0;
		for (let facility of stop.facilities) {
			score += scores.facility[facility] || scores.facilityDefault;
		}
		const isTransition = i > 0 && i < stops.length - 1 && stops[i - 1].municipality != stop.municipality;
		if (isTransition) {
			score += scores.transition;
		}
		if (stop.id == params.stop_id) {
			score += scores.current;
		}
		scoredStops.push({ index: i - 1, stop, score, show: false });
	}
	const limit = 23;

	let shownStopsCount = 1;
	let sortedScoredStops = scoredStops.toSorted((a, b) => b.score - a.score);
	// console.log(sortedScoredStops.map(stop => stop.score));
	for (let i = 0; i < sortedScoredStops.length; i++) {
		const stop = sortedScoredStops[i];
		let toAdd = 0;
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
	const delays = [];
	const renderedStops:({type:'skipped', count:number, municipality:string[], stops:(typeof stops[0])[]}|{type:'stop', stop:typeof stops[0]})[] = [];
	let accumulatedDelay = 0;
	let delaySpan = 0;
	let lastDelayIndex = 0;
	for (let i = 0; i < scoredStops.length; i++) {
		let stop = scoredStops[i];
		let accumulatedMunicipalities = [];
		let accumulatedStops = [];
		let skippedStops = 0;
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
		if (delaySpan >= 2 || i >= scoredStops.length - 1) {
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
	// const totalSpan = delays.reduce((acc, delay) => acc + (delay?.span || 0), 0);
	// console.log(totalSpan, renderedStops.length);
	// console.log(stops.map(stop => stop.name));
	// console.log(delays.map(delay => [delay.startAt, delay.span]));
	let facilitySet:Set<Facility> = new Set;
	for (let stop of renderedStops.concat({ type: 'stop', stop: firstStop }, { type: 'stop', stop: lastStop })) {
		if (stop.type == 'stop') {
			for (let facility of stop.stop.facilities) {
				facilitySet.add(facility);
			}
		}
	}

	let dataurl = await QRCode.toString(`${QR_URL}/${params.line_id}/${params.direction_id}/${params.stop_id}`, { errorCorrectionLevel: 'H', margin: 0, type: 'svg', color: { dark: '#000000', light: '#ffffff' } });

	return (
		<div>
			<Header backgroundColor={pattern.color} color={pattern.text_color} lineId={params.line_id} headsign={line.long_name} dataurl={dataurl} />
			<div className='flex flex-row w-full p-4'>
				<Spine className='grow -translate-y-3.5' color={pattern.color} firstStop={firstStop} lastStop={lastStop} delays={delays} renderedStops={renderedStops} currentStopId={params.stop_id} />
				<div className='text-neutral-800 w-[430px] flex flex-col gap-4'>
					<ScheduleInfo name={stopInfo.name } stopId={params.stop_id} startDate={today}/>
					<Schedule className='justify-self-end' timetable={timetable} />
				</div>
			</div>
			<div className='fixed bottom-0 w-full'><Footer line_id={params.line_id} direction_id={params.direction_id} stop_id={params.stop_id} user_url={QR_URL} facilities={Array.from(facilitySet)}/></div>
		</div>
	);
}