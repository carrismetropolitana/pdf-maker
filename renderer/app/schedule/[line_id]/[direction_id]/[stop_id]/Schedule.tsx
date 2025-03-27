import hash from 'object-hash';
import { CSSProperties, Fragment } from 'react';

import { Timetable, TimetableEntry, TimetablePeriod } from './apitypes';

export default function Schedule({ className, style, timetable }: { className?: string, style?: CSSProperties, timetable: Timetable }) {
	//
	const hashed = new Map<string, { period: TimetablePeriod, titles: string[] }>();
	for (const period of timetable.periods) {
		const h = hash([period.weekdays, period.saturdays, period.sundays_holidays], { respectType: false, unorderedArrays: true });
		const prev = hashed.get(h);
		if (prev === undefined) {
			hashed.set(h, { period: period, titles: [period.period_name] });
		}
		else {
			prev.titles.push(period.period_name);
		}
	}
	const toRender = Array.from(hashed.values()).map((v) => {
		// Build title string, using ' e ' for the last element, unless it already has it,
		// as is the case with Domingos e Feriados
		const { period, titles } = v;
		let str = '';
		if (titles.length == 1) str = titles[0];
		else {
			for (let i = 0; i < titles.length; i++) {
				const t = titles[i];
				if (i == titles.length - 1 && i > 0) str += ' e ' + t;
				else if (i > 0) str += ', ' + t;
				else str += t;
			}
		}
		const newPeriod = { ...period, period_name: str, period_names: titles };
		return newPeriod as { period_names: string[] } & TimetablePeriod;
	}).sort((a, b) => {
		// Sort the names so that we always get strings starting with Dias Úteis first, and Domingos last
		if (a.period_name.startsWith('Período Escolar')) return -1;
		if (b.period_name.startsWith('Período Escolar')) return 1;
		if (a.period_name.startsWith('Período de Verão')) return 1;
		if (b.period_name.startsWith('Período de Verão')) return -1;
		return 0;
	});
	return (
		<div className={className + ' flex flex-col gap-2'} style={style}>
			{toRender.map((period, i) => <PeriodTable key={i} period={period} />)}
			<Exceptions exceptions={timetable.exceptions} />
		</div>
	);
}
function PeriodTable({ period }: { period: { period_names: string[] } & TimetablePeriod }) {
	// Merge timetables which are the same, and their names
	const possibilities = [['weekdays', 'Dias Úteis'], ['saturdays', 'Sábados'], ['sundays_holidays', 'Domingos e Feriados']] as const;
	const hashed = new Map<string, { timetables: TimetableEntry[], titles: string[] }>();
	for (const [weekDayId, weekDayText] of possibilities) {
		const times = period[weekDayId];
		const h = hash(times, { respectType: false, unorderedArrays: true });
		const prev = hashed.get(h);
		if (prev === undefined) {
			hashed.set(h, { timetables: times, titles: [weekDayText] });
		}
		else {
			prev.titles.push(weekDayText);
		}
	}
	const toRender = Array.from(hashed.values()).map((v) => {
		// Build title string, using ' e ' for the last element, unless it already has it,
		// as is the case with Domingos e Feriados
		const { timetables, titles } = v;
		let finalTitle = '';
		for (let i = 0; i < titles.length; i++) {
			const title = titles[i];
			if (i == titles.length - 1 && !title.includes(' e ') && i > 0) {
				finalTitle += ' e ' + title;
			}
			else if (i > 0) {
				finalTitle += ', ' + title;
			}
			else {
				finalTitle += title;
			}
		}
		return [finalTitle, timetables] as [string, TimetableEntry[]];
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
			<div className="flex flex-wrap gap-1 border-b border-b-black pb-1 mb-2">
				{period.period_names.map((name, i) => (
					<Fragment key={i}>
						{i != 0 && <div className="text-slate-400 leading-none">|</div>}
						<div key={i} className="text-base font-semibold leading-none">{name}</div>
					</Fragment>
				))}
			</div>
			{/* <h2 className='text-base font-semibold'>{period.period_names.join('|')}</h2> */}
			<div className="flex flex-col gap-1">
				{(toRender.length > 0
					? toRender.map(([title, times], i) => <SubTable key={i} times={times} title={title} />)
					: <div className="font-semibold text-[8pt]">Não há horários de passagem neste período</div>)}
			</div>
		</div>
	);
}

function SubTable({ times, title }: { times: TimetableEntry[], title: string }) {
	let timesByHour = Array.from<number[], { hour: number, times: { exceptions: string[], minute: number }[] }>({ length: 24 }, (_, index) => ({ hour: index, times: [] }));
	for (const entry of times) {
		const [hour, minute] = entry.time.split(':').map(s => parseInt(s, 10));
		const exception = entry.exceptions.map(e => e.id);
		// Handle the case where the hour is < 4 and >= 24
		const span = timesByHour.find(elem => elem.hour === hour % 24);
		if (!span) console.error(`Could not fit hour ${hour} in schedule`);
		if (span && !span.times.find(elem => elem.minute == minute)) span.times.push({ exceptions: exception, minute });
	}
	timesByHour = [...timesByHour.slice(4), ...timesByHour.slice(0, 4)];
	// sort each span
	for (const span of timesByHour) {
		span.times.sort((a, b) => a.minute - b.minute);
	}
	// console.log(times);
	return (
		<div className="">
			<h3 className="text-sm font-medium mb-0.5">{title}</h3>
			<div className="flex text-[3mm]">
				<div className="flex flex-col">
					<div className="bg-black text-white text-center rounded-l-full pl-2 -ml-2 font-semibold text-[8pt] h-[4mm] leading-none flex items-center">Hora</div>
					{times.length != 0 && <div className="text-center text-[7.5pt]">Min.</div>}
				</div>
				{timesByHour.map(minutes => (
					<div key={minutes.hour} className="flex flex-col items-stretch w-4 text-[7mm]">
						<div className={'bg-black text-white text-center font-semibold text-[8pt] h-[4mm] leading-none flex items-center justify-center relative ' + (minutes.hour == timesByHour.length - 1 ? ' pr-1 -mr-1 rounded-r-full' : '')}>{minutes.hour}</div>
						{minutes.times.map((entry, i) => (
							<div key={i} className="text-[7.5pt] text-center relative self-center">
								{entry.minute.toString().padStart(2, '0')}
								{entry.exceptions && (
									<div className="absolute top-[1pt] left-full font-semibold text-[4pt] flex flex-col leading-none">
										{entry.exceptions.map((exception, i) => <div key={i} className="-mb-[0.2mm]">{exception}</div>)}
									</div>
								)}
							</div>
						))}
					</div>
				))}
			</div>
			{times.length == 0 && <div className="text-[8pt]"> Não há horários de passagem</div>}
		</div>
	);
}

function Exceptions({ exceptions }: { exceptions: {
	id: string
	label: string
	text: string
}[] }) {
	return (
		<div className="flex flex-col gap-0">
			{exceptions.map((entry, i) => (
				<div key={i} className="flex flex-row gap-2">
					<p className="text-[8pt]">
						<span className="font-bold">{entry.label} </span>
						{entry.text}
					</p>
				</div>
			))}
		</div>
	);
}
