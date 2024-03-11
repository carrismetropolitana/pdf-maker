import { CSSProperties } from 'react';
import { Timetable, TimetableEntry, TimetablePeriod } from './apitypes';

export default function Schedule({ className, style, timetable }: {className?: string, style?: CSSProperties, timetable:Timetable}) {
	return (
		<div className={className + ' flex flex-col gap-10'} style={style}>
			{timetable.periods.map((period, i) => <PeriodTable key={i} period={period} />)}
			<Exceptions exceptions={timetable.exceptions}/>
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
	let timesByHour:{minute:number, exception:string}[][] = Array.from<number[], {minute:number, exception:string}[]>({ length: 25 }, () => []);
	for (let entry of times) {
		const [hour, minute, _] = entry.time.split(':').map(s => parseInt(s, 10));
		const exception = entry.exceptions.map(e => e.id).join(',');
		let span = timesByHour[hour];
		if (span && !span.find(elem => elem.minute == minute)) span.push({ minute, exception });
	}
	// sort each span
	for (let span of timesByHour) {
		span.sort((a, b) => a.minute - b.minute);
	}
	// console.log(times);
	return <div className=''>
		<div className='bg-black h-px w-full'></div>
		<h3>{title}</h3>
		<div className='flex text-[3mm]'>
			<div className='flex flex-col '>
				<div className='bg-black text-white text-center rounded-l-full pl-2 -ml-2 font-semibold text-[8pt] h-[4mm]'>Hora</div>
				<div className='text-center text-[7.5pt]'>Min.</div>
			</div>
			{timesByHour.map((minutes, hour) => <div key={hour} className='flex flex-col items-stretch w-4 text-[7mm]'>
				<div className={'bg-black text-white text-center font-semibold  text-[8pt] h-[4mm]' + (hour == timesByHour.length - 1 ? ' pr-2 -mr-1 rounded-r-full' : '')}>{hour}</div>
				{minutes.map((entry, i) => <div key={i} className={'text-[7.5pt] text-center'}>{entry.minute}{entry.exception ? <span className='align-super text-[5pt]'>{entry.exception}</span> : null}</div>)}
			</div>)
			}
		</div>
	</div>;
}

function Exceptions({ exceptions }:{exceptions:{
    id: string;
    label: string;
    text: string;
  }[]}) {
	return (
		<div className='flex flex-col gap-2'>
			{exceptions.map((entry, i) => <div key={i} className='flex flex-row gap-4'>
				<p className='text-[8pt]'>
					<span className='font-bold'>{entry.label} </span>
					{entry.text}
				</p>
			</div>)}
		</div>);
}