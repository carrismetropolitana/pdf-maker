import { Pattern, Timetable } from './apitypes';
import Header from './Header';
import Spine from './Spine';
import Schedule from './Schedule';
import ScheduleInfo from './ScheduleInfo';

export default async function Page({ params }:{params:{line_id:string, stop_id:string}}) {
	const timetableRes = await fetch(`https://alpha.api.carrismetropolitana.pt/timetables/${params.line_id}/${params.stop_id}`);
	const timetable: Timetable = await timetableRes.json();
	const patternRes = await fetch('https://alpha.api.carrismetropolitana.pt/patterns/' + timetable.patternForDisplay);
	const pattern: Pattern = await patternRes.json();
	// const stopInfoRes = await fetch('https://alpha.api.carrismetropolitana.pt/stops/' + pattern.path[1].Stop.id);
	const stopInfo = {
		'id': '010136',
		'name': 'ALCOCHETE (AV EURO 2004) FREEPORT',
		'short_name': null,
		'tts_name': 'Alcochete ( Avenida Euro 2004 ) Freeport',
		'lat': '38.751395',
		'lon': '-8.942829',
		'locality': 'Alcochete',
		'parish_id': null,
		'parish_name': null,
		'municipality_id': '1502',
		'municipality_name': 'Alcochete',
		'district_id': '15',
		'district_name': 'Setúbal',
		'region_id': 'PT170',
		'region_name': 'AML',
		'wheelchair_boarding': null,
		'facilities': [],
		'lines': [
			'4510',
			'4511',
			'4512',
			'4513',
			'4600',
			'4702',
			'4703',
			'4704',
		],
		'routes': [
			'4510_0',
			'4511_0',
			'4512_0',
			'4512_1',
			'4513_0',
			'4600_0',
			'4702_0',
			'4703_0',
			'4704_0',
		],
		'patterns': [
			'4510_0_1',
			'4511_0_1',
			'4512_0_1',
			'4512_1_1',
			'4513_0_1',
			'4600_0_1',
			'4600_0_2',
			'4702_0_1',
			'4703_0_1',
			'4704_0_2',
		],
	};
	// console.log('Hello', await stopInfo.json());
	// const stops = pattern.path.map(stop => ({
	// 	name: stop.Stop.name,
	// 	municipality: stop.Stop.municipality_name,
	// 	facilities: stop.Stop.facilities,
	// }));
	// console.log(stops);

	// date in dd.mm.yyyy
	const today = (new Date).toISOString().split('T')[0].split('-').reverse().join('.');

	return (
		<div>
			<Header backgroundColor={pattern.color} color={pattern.text_color} />
			<div className='flex flex-row justify-end w-full p-4'>
				{/* <Spine className='grow' stops={stops} /> */}
				<div className='text-neutral-800 w-[430px] flex flex-col gap-8'>
					<ScheduleInfo name={stopInfo.name + ` (${params.stop_id})`} startDate={today}/>
					<Schedule className='justify-self-end' timetable={timetable} />
				</div>
			</div>
		</div>
	);
}