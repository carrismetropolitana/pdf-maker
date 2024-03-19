import React, { CSSProperties, Fragment } from 'react';
import TablerClock from './TablerClock';
import FacilityIcon from './FacilityIcon';
import { Facility } from './apitypes';
export default function Spine({ className, style, stops, color, currentStopId }: {className?: string, style?:CSSProperties, color:string, currentStopId:string, stops:{
  name: string;
  municipality: string;
  facilities: Facility[];
	id: string;
	delay: number;
}[]}) {
	function isStop(stop: any): stop is { type: 'stop', stop: { name: string; municipality: string; facilities: string[]; id: string; delay: number; }; } {
		return stop.type === 'stop';
	}

	const scores: { transition: number, facilityDefault: number, facility: Record<Facility, number> } = {
		transition: 40,
		facility: {
			'near_health_clinic': 29,
			'near_hospital': 30,
			'near_university': 20,
			'near_school': 5,
			'near_police_station': 5,
			'near_fire_station': 5,
			'near_shopping': 10,
			'near_historic_building': 3,
			'near_transit_office': 25,
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
	};

	const firstStop = stops[0];
	const lastStop = stops[stops.length - 1];
	const scoredStops = [];
	for (let i = 1; i < stops.length - 1; i++) {
		const stop = stops[i];
		if (stop.facilities.length > 0) console.log(stop.facilities);
		let score = 0;
		for (let facility of stop.facilities) {
			score += scores.facility[facility] || scores.facilityDefault;
		}
		const isTransition = i > 0 && i < stops.length - 1 && stops[i - 1].municipality != stop.municipality;
		if (isTransition) {
			score += scores.transition;
			console.log('transition', stop.name);
		}
		scoredStops.push({ index: i - 1, stop, score, show: false });
	}
	const limit = 22;

	let shownStopsCount = 1;
	let sortedScoredStops = scoredStops.toSorted((a, b) => b.score - a.score);
	console.log(sortedScoredStops.map(stop => stop.score));
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
	const renderedStops:({type:'skipped', count:number, municipality:string[]}|{type:'stop', stop:typeof stops[0]})[] = [];
	let accumulatedDelay = 0;
	let delaySpan = 0;
	let lastDelayIndex = 0;
	for (let i = 0; i < scoredStops.length; i++) {
		let stop = scoredStops[i];
		let accumulatedMunicipalities = [];
		let skippedStops = 0;
		while (i < scoredStops.length && !stop.show) {
			if (accumulatedMunicipalities.indexOf(stop.stop.municipality) == -1) accumulatedMunicipalities.push(stop.stop.municipality);
			accumulatedDelay += stop.stop.delay;
			i++;
			stop = scoredStops[i];
			skippedStops++;
		}
		if (skippedStops > 0) {
			renderedStops.push({ type: 'skipped', count: skippedStops, municipality: accumulatedMunicipalities });
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
	delays[delays.length - 1].span += 1;
	delays[delays.length - 1].delay += lastStop.delay;
	// const totalSpan = delays.reduce((acc, delay) => acc + (delay?.span || 0), 0);
	// console.log(totalSpan, renderedStops.length);
	// console.log(stops.map(stop => stop.name));
	// console.log(delays.map(delay => [delay.startAt, delay.span]));

	return (
		<div className={className + ' grid grid-cols-[5mm_4mm_1fr] items-start h-full'} style={style}>
			<div className='col-start-1 relative' style={{ gridRowStart: 1 }}>
				<div className='absolute top-[16pt]'>

					<div className='flex items-center justify-end'>
						<TablerClock className='w-full h-5 -mb-1 -mr-px'/>
					</div>
					<div className='text-[7pt] text-center'>Min.</div>
				</div>
			</div>
			{delays.map((delay, i) => delay != null ?
				<div key={i} className={'w-full self-center col-start-1 h-full border-y-black -mt-[0.5pt] flex items-center' + (i != 0 ? ' border-t-[0.25pt]' : '') + (i == delays.length - 1 ? ' border-b-[0.25pt]' : '') } style={{ gridRowStart: delay.startAt + 2, gridRowEnd: delay.startAt + delay.span + 2 }}>{
					<div className='text-xs text-center w-full text-neutral-700'>
						{delay.delay}
					</div>
				}</div> : null)}

			<div className='w-[4mm] self-stretch col-start-2' style={{ background: color, gridRowStart: 2, gridRowEnd: 100 }}></div>
			<div className='relative h-[4mm] self-end ' style={{ gridRowStart: 1, gridRowEnd: 1 }}>
				<div className='w-[4mm] h-[4mm] rounded-full bg-black absolute top-1/2 flex items-center justify-center' >

					<svg
						stroke='white'
						className='w-[3.5mm] h-[3.5mm] fill-transparent'
						viewBox='0 0 24 24'
						strokeWidth='3'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M6 9l6 6l6 -6' />
					</svg>
				</div>
			</div>

			<div className='gap-1 h-8 col-start-3 self-center relative top-px' style={{ gridRowStart: 1 }}>
				<div className='flex items-center gap-2 h-8 absolute top-1/2'>
					<div className='bg-black h-px mt-px w-2' >
					</div>
					<StopLabel stop={firstStop} isBold={true}/>
				</div>
			</div>
			{renderedStops.map((stop, i) => <div key={i} className='gap-1 h-8 col-start-3 relative' style={{ gridRowStart: i + 2 }}>
				<div className='absolute top-1/2 flex items-center gap-2 h-8'>
					{isStop(stop) ?
						<Fragment>
							<div className='bg-black h-px w-[2mm]' >
							</div>
							<StopLabel stop={stop.stop} isBold={false}/>
						</Fragment> :
						<Fragment>
							<div className='h-16 flex flex-col justify-evenly'>
								{[...Array(stop.count)].map((_, i) => <div key={i} className='bg-neutral-400 h-[0.5pt] w-[2mm]' ></div>)}
							</div>
							<div className='flex items-stretch gap-1 text-[7pt] text-neutral-400'>+{stop.count} paragens em {stop.municipality}</div>
						</Fragment>}
				</div>
			</div>)}
			<div className='relative h-[4mm] self-end' style={{ gridRowStart: renderedStops.length + 2, gridRowEnd: renderedStops.length + 2, gridColumn: 2 }}>
				<div className='w-[4mm] h-[4mm] rounded-full bg-black absolute top-1/2 flex items-center justify-center' >
					<svg
						stroke='white'
						className='w-[3mm] h-[3mm]'
						viewBox='0 0 24 24'
						strokeWidth='3'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path stroke='none' d='M0 0h24v24H0z' fill='none' />
						<path d='M18 6l-12 12' />
						<path d='M6 6l12 12' />
					</svg>
				</div>
			</div>
			<div className='gap-2 h-8 col-start-3 relative ' style={{ gridRowStart: renderedStops.length + 2 }}>
				<div className='absolute top-1/2 flex items-center gap-1 h-8'>
					<div className='bg-black h-[1px] w-2' >
					</div>
					<StopLabel stop={lastStop} isBold={true}/>
				</div>
			</div>
		</div>);
}

function StopLabel({ stop, isBold }: {stop:{ name: string; municipality: string; facilities: Facility[]; id: string; delay: number; }, isBold:boolean}) {
	return <div className='flex flex-col'>
		<div className={'flex justify-start items-center leading-3 max-w-[60mm] gap-2 ' + (isBold ? 'font-medium text-[10pt]' : 'font-normal text-[8pt]')}>
			<div className='truncate '>{stop.name}</div>
			{stop.facilities.map((facility, i) => <FacilityIcon key={i} facility={facility} className='w-[8mm] h-[6mm] -my-6' />)}
		</div>
		<div className='text-[7pt] font-light leading-none'>
			{stop.municipality}
		</div>
	</div>;
}