import { CSSProperties } from 'react';
import { Timetable, TimetableEntry, TimetablePeriod } from './apitypes';

export default function Schedule({ className, style, timetable }: {className?: string, style?: CSSProperties, timetable:Timetable}) {
	return (
		<div className={className + ' flex flex-col gap-10 pr-4 text-neutral-800'} style={style}>
			{timetable.periods.map((period, i) => <PeriodTable key={i} period={period} />)}
		</div>
	);
}
function PeriodTable({ period }:{period:TimetablePeriod}) {
	return (
		<div>
			<h2 className='text-xl'>{period.period_name}</h2>
			<div className='flex flex-col gap-4'>
				<SubTable title={'Dias Úteis'} times={period.weekdays}/>
				<SubTable title={'Sábados'} times={period.saturdays}/>
				<SubTable title={'Domingos e Feriados'} times={period.sundays_holidays}/>
			</div>
		</div>
	);
}

function SubTable({ title, times }:{title:string, times:TimetableEntry[]}) {
	let timesByHour:number[][] = Array.from<number[], number[]>({ length: 25 }, () => []);
	for (let entry of times) {
		const [hour, minute, _] = entry.time.split(':').map(s => parseInt(s, 10));
		let span = timesByHour[hour];
		if (span && !span.includes(minute)) span.push(minute);
		console.log(span);
	}
	// sort each span
	for (let span of timesByHour) {
		span.sort((a, b) => a - b);
	}
	// console.log(times);
	return <div className=''>
		<div className='bg-black h-px w-full'></div>
		<h3>{title}</h3>
		<div className='flex text-[3mm]'>
			<div className='flex flex-col '>
				<div className='bg-black text-white text-center  rounded-l-full pl-2 -ml-2'>Hora</div>
				<div className='text-center  '>Min.</div>
			</div>
			{timesByHour.map((minutes, hour) => <div key={hour} className='flex flex-col items-stretch w-4 text-[3mm]'>
				<div className={'bg-black text-white text-center' + (hour == timesByHour.length - 1 ? ' pr-2 -mr-2 rounded-r-full' : '')}>{hour}</div>
				{minutes.map((minute, i) => <div key={i} className={'text-[3mm] text-center'}>{minute}</div>)}
			</div>)
			}
		</div>
	</div>;
}