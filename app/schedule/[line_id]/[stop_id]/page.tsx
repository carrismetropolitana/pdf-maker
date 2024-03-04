import Logo from './logo';
import { Pattern, Timetable } from './apitypes';
import Header from './Header';

export default async function Page() {
	const timetableRes = await fetch('https://alpha.api.carrismetropolitana.pt/timetables/124/124');
	const timetable: Timetable = await timetableRes.json();
	const patternRes = await fetch('https://alpha.api.carrismetropolitana.pt/patterns/' + timetable.patternForDisplay);
	const pattern: Pattern = await patternRes.json();
	console.log(timetable);

	return (
		<div>
			<Header backgroundColor={pattern.color} color={pattern.text_color} />

		</div>
	);
}