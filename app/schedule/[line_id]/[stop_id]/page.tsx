import { Pattern, Timetable } from './apitypes';
import Header from './Header';
import Spine from './Spine';
import Schedule from './Schedule';

export default async function Page() {
	const timetableRes = await fetch('https://alpha.api.carrismetropolitana.pt/timetables/124/124');
	const timetable: Timetable = await timetableRes.json();
	const patternRes = await fetch('https://alpha.api.carrismetropolitana.pt/patterns/' + timetable.patternForDisplay);
	const pattern: Pattern = await patternRes.json();
	const stops = pattern.path.map(stop => ({
		name: stop.Stop.name,
		municipality: stop.Stop.municipality_name,
		facilities: stop.Stop.facilities,
	}));
	return (
		<div>
			<Header backgroundColor={pattern.color} color={pattern.text_color} />
			<div className='flex flex-row justify-end w-full'>
				{/* <Spine className='grow' stops={stops} /> */}
				<Schedule className='justify-self-end' timetable={timetable} />
			</div>
		</div>
	);
}