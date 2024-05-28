import React, { CSSProperties, Fragment } from 'react';
import TablerClock from './TablerClock';
import FacilityIcon from './FacilityIcon';
import { Facility } from './apitypes';
type Stop = {
	name: string;
	municipality: string;
	locality: string;
	facilities: Facility[];
	id: string;
	delay: number;
};
export default function Spine(
	{ className, style, color, firstStop, lastStop, delays, renderedStops, currentStopId }:
	{
		className?: string, style?:CSSProperties, color:string,
		firstStop:Stop, lastStop:Stop, currentStopId:string,
		delays:{
			startAt:number, delay:number, span:number}[],
			renderedStops:(
				{type:'skipped', count:number, municipality:string[]}|
				{type:'stop', stop:Stop}
			)[]
	},
) {
	function isStop(stop: any): stop is { type: 'stop', stop:Stop; } {
		return stop.type === 'stop';
	}

	return (
		<div className={className + ' grid grid-cols-[5mm_4mm_1fr] items-start h-full -translate-x-4'} style={style}>
			<div className='col-start-1 relative' style={{ gridRowStart: 1 }}>
				<div className='absolute top-[16pt]'>

					<div className='flex items-center justify-end'>
						<TablerClock className='w-full h-5 -mb-1 -mr-px hidden'/>
					</div>
					<div className='text-[7pt] text-center hidden'>Min.</div>
				</div>
			</div>
			{/* {delays.map((delay, i) => delay != null ?
				<div key={i} className={'w-full self-center col-start-1 h-full border-y-black -mt-[0.5pt] flex items-center' + (i != 0 ? ' border-t-[0.25pt]' : '') + (i == delays.length - 1 ? ' border-b-[0.25pt]' : '') } style={{ gridRowStart: delay.startAt + 2, gridRowEnd: delay.startAt + delay.span + 2 }}>{
					<div className='text-xs text-center w-full text-neutral-700'>
						{delay.delay}
					</div>
				}</div> : null)} */}
			{delays.map((delay, i) => delay != null ?
				<div key={i} className={'w-full self-center col-start-1 h-full border-y-black -mt-[0.5pt] hidden items-center' + (i != 0 ? ' border-t-[0.25pt]' : '') + (i == delays.length - 1 ? ' border-b-[0.25pt]' : '') } style={{ gridRowStart: delay.startAt + 2, gridRowEnd: delay.startAt + delay.span + 2 }}>{
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

			<div className='h-9 col-start-3 relative' style={{ gridRowStart: 1 }}>
				<div className='flex items-center gap-2 h-9 absolute top-1/2'>
					<div className='bg-black h-px w-[2mm]'></div>
					<StopLabel stop={firstStop} isBold={true}/>
				</div>
			</div>
			{renderedStops.map((stop, i) => <div key={i} className='h-9 col-start-3 relative' style={{ gridRowStart: i + 2 }}>
				<div className='absolute top-1/2 flex items-center gap-2 h-9'>
					{isStop(stop) ?
						<Fragment>
							{stop.stop.id === currentStopId ?
								<div className='relative -mr-2'>
									<div className='absolute top-0 bottom-0 flex items-center right-0'>
										<div className='
										border-y-[6px] border-y-transparent
										border-l-[10px] border-l-black
										'></div>
										<div className='h-[4mm] w-[4mm] rounded-full flex items-center justify-center bg-black'>
											<div className='h-[2mm] w-[2mm] rounded-full bg-white'></div>
										</div></div>
								</div> : ''}
							<div className='bg-black h-px w-[2mm]' ></div>
							<StopLabel stop={stop.stop} isBold={stop.stop.id === currentStopId}/>
						</Fragment> :
						<Fragment>
							<div className='h-[4.5rem] flex flex-col justify-evenly'>
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
			<div className='h-9 col-start-3 relative ' style={{ gridRowStart: renderedStops.length + 2 }}>
				<div className='flex items-center gap-2 h-9 absolute top-1/2'>
					<div className='bg-black h-px w-[2mm]'></div>
					<StopLabel stop={lastStop} isBold={true}/>
				</div>
			</div>
		</div>);
}

function StopLabel({ stop, isBold }: {stop:Stop, isBold:boolean}) {
	// [&::-webkit-scrollbar]:hidden my beloved
	return <div className='flex flex-col'>
		<div className={'flex justify-start items-center leading-3 max-w-[73mm] ' + (isBold ? 'font-medium text-[10pt]' : 'font-normal text-[8pt]')}>
			<div className='overflow-ellipsis whitespace-nowrap overflow-x-clip [&::-webkit-scrollbar]:hidden'>{stop.name}</div>
			{stop.facilities.map((facility, i) => <FacilityIcon key={i} facility={facility} className='w-[6mm] h-[5mm] -my-6 shrink-0' />)}
		</div>
		<div className='text-[7pt] font-light leading-none pt-[0.8mm]'>
			{stop.locality && stop.locality !== stop.municipality && stop.locality + ', '}{stop.municipality}
		</div>
	</div>;
}