import { CSSProperties } from 'react';
import { Timetable, TimetableEntry, TimetablePeriod } from './apitypes';
import hash from 'object-hash';

export default function Schedule({ className, style, timetable }: {className?: string, style?: CSSProperties, timetable:Timetable}) {
	//
	let hashed = new Map<string, [string[], TimetablePeriod]>;
	for (let period of timetable.periods) {
		let h = hash([period.weekdays, period.saturdays, period.sundays_holidays], { respectType: false, unorderedArrays: true });
		let prev = hashed.get(h);
		if (prev === undefined) {
			hashed.set(h, [[period.period_name], period]);
		} else {
			prev[0].push(period.period_name);
		}
	}
	let toRender = Array.from(hashed.values()).map(v => {
		// Build title string, using ' e ' for the last element, unless it already has it,
		// as is the case with Domingos e Feriados
		let [titles, period] = v;
		let str = '';
		if (titles.length == 1) str = titles[0];
		else {
			for (let i = 0; i < titles.length; i++) {
				let t = titles[i];
				if (i == titles.length - 1 && i > 0) str += ' e ' + t;
				else if (i > 0) str += ', ' + t;
				else str += t;
			}
		}
		const newPeriod = { ...period, period_name: str, period_names: titles };
		return newPeriod as TimetablePeriod & { period_names: string[] };
	}).sort((a, b) => {
		// Sort the names so that we always get strings starting with Dias Úteis first, and Domingos last
		if (a.period_name.startsWith('Período Escolar')) return -1;
		if (b.period_name.startsWith('Período Escolar')) return 1;
		if (a.period_name.startsWith('Período de Verão')) return 1;
		if (b.period_name.startsWith('Período de Verão')) return -1;
		return 0;
	});
	return (
		<div className={className + ' flex flex-col gap-5'} style={style}>
			{toRender.map((period, i) => <PeriodTable key={i} period={period} />)}
			<Exceptions exceptions={timetable.exceptions}/>
		</div>
	);
}
function PeriodTable({ period }:{period:TimetablePeriod & { period_names: string[] }}) {
	// Merge timetables which are the same, and their names
	let possibilities = [['weekdays', 'Dias Úteis'], ['saturdays', 'Sábados'], ['sundays_holidays', 'Domingos e Feriados']] as const;
	let hashed = new Map<string, [string[], TimetableEntry[]]>;
	for (let p of possibilities) {
		let times = period[p[0]];
		let h = hash(times, { respectType: false, unorderedArrays: true });
		let prev = hashed.get(h);
		if (prev === undefined) {
			hashed.set(h, [[p[1]], times]);
		} else {
			prev[0].push(p[1]);
		}
	}
	let toRender = Array.from(hashed.values()).map(v => {
		// Build title string, using ' e ' for the last element, unless it already has it,
		// as is the case with Domingos e Feriados
		let [titles, times] = v;
		let str = '';
		for (let i = 0; i < titles.length; i++) {
			let t = titles[i];
			if (i == titles.length - 1 && !t.includes(' e ') && i > 0) str += ' e ' + t;
			else if (i > 0) str += ', ' + t;
			else str += t;
		}
		return [str, times] as [string, TimetableEntry[]];
	}).sort((a, b) => {
		// Sort the names so that we always get strings starting with Dias Úteis first, and Domingos last
		if (a[0].startsWith('Dias Úteis')) return -1;
		if (b[0].startsWith('Dias Úteis')) return 1;
		if (a[0].startsWith('Domingos')) return 1;
		if (b[0].startsWith('Domingos')) return -1;
		return 0;
	});
	return (
		<div>
			<div className='flex flex-wrap gap-1 border-b border-b-black pb-1 mb-2'>
				{period.period_names.map((name, i) => <>
					{i != 0 && <div className='text-slate-400 leading-none'>|</div>}
					<div key={i} className='text-base font-semibold leading-none'>{name}</div>
				</>)}
			</div>
			{/* <h2 className='text-base font-semibold'>{period.period_names.join('|')}</h2> */}
			<div className='flex flex-col gap-1'>
				{(toRender.length > 0 ?
					toRender.map(([title, times], i) => <SubTable key={i} title={title} times={times}/>) :
					<div className='font-semibold text-[8pt]'>Não há horários de passagem neste período</div>)}
			</div>
		</div>
	);
}

function SubTable({ title, times }:{title:string, times:TimetableEntry[]}) {
	let timesByHour = Array.from<number[], {minute:number, exceptions:string[]}[]>({ length: 25 }, () => []);
	for (let entry of times) {
		const [hour, minute, _] = entry.time.split(':').map(s => parseInt(s, 10));
		const exception = entry.exceptions.map(e => e.id);
		let span = timesByHour[hour];
		if (span && !span.find(elem => elem.minute == minute)) span.push({ minute, exceptions: exception });
	}
	// sort each span
	for (let span of timesByHour) {
		span.sort((a, b) => a.minute - b.minute);
	}
	// console.log(times);
	return <div className=''>
		<h3 className='text-sm font-medium mb-0.5'>{title}</h3>
		<div className='flex text-[3mm]'>
			<div className='flex flex-col '>
				<div className='bg-black text-white text-center rounded-l-full pl-2 -ml-2 font-semibold text-[8pt] h-[4mm] leading-none flex items-center'>Hora</div>
				{times.length != 0 && <div className='text-center text-[7.5pt]'>Min.</div>}
			</div>
			{timesByHour.map((minutes, hour) => <div key={hour} className='flex flex-col items-stretch w-4 text-[7mm]'>
				<div className={'bg-black text-white text-center font-semibold text-[8pt] h-[4mm] leading-none flex items-center justify-center relative ' + (hour == timesByHour.length - 1 ? ' pr-1 -mr-1 rounded-r-full' : '')}>{hour}</div>
				{minutes.map((entry, i) => <div key={i} className={'text-[7.5pt] text-center relative self-center'}>
					{entry.minute.toString().padStart(2, '0')}
					{entry.exceptions && <div className='absolute top-[1pt] left-full font-semibold text-[4pt] flex flex-col leading-none'>
						{entry.exceptions.map((exception, i) => <div key={i} className='-mb-[0.2mm]'>{exception}</div>)}
					</div>}</div>)}
			</div>)
			}
		</div>
		{times.length == 0 && <div className='text-[8pt]'> Não há horários de passagem</div>}
	</div>;
}

function Exceptions({ exceptions }:{exceptions:{
    id: string;
    label: string;
    text: string;
  }[]}) {
	return (
		<div className='flex flex-col gap-0'>
			{exceptions.map((entry, i) => <div key={i} className='flex flex-row gap-2'>
				<p className='text-[8pt]'>
					<span className='font-bold'>{entry.label} </span>
					{entry.text}
				</p>
			</div>)}
		</div>);
}