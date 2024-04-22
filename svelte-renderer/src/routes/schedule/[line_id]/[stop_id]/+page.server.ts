import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Pattern, Timetable } from "$lib/apitypes";
import QRCode from "qrcode";

export const load:PageServerLoad = async({params})=>{
	const API_URL = process.env.API_URL || 'http://localhost:5050';
	const QR_URL:string = process.env.QR_URL || 'https://qr.carrismetropolitana.pt';
	const dataurl = QRCode.toString(`${QR_URL}/${params.line_id}/${params.stop_id}`, {
		errorCorrectionLevel: "H",
		margin: 0,
		type: "svg",
	});
	const timetableRes = await fetch(`${API_URL}/timetables/${params.line_id}/${params.stop_id}`);
	const timetable: Timetable = await timetableRes.json();
	// console.log(JSON.stringify(timetable, null, 2));
	const patternURL = `${API_URL}/patterns/${timetable.patternForDisplay}`;
	const patternRes = await fetch(patternURL);
	const pattern: Pattern = await patternRes.json();
	if (!pattern.path || !pattern.path[1] || !pattern.path[1].stop) {
		console.error(patternURL, 'pattern.path[1].stop is undefined, pattern:', pattern);
		error(500, 'pattern.path[1].stop is undefined');
	}
	const stopInfoURL = `${API_URL}/stops/${pattern.path[1].stop.id}`;
	const stopInfoRes = await fetch(stopInfoURL);
	const stopInfo = await stopInfoRes.json();



	if (!stopInfo) {
		console.error(stopInfoURL, 'stopInfo is undefined', stopInfo);
		error(500, 'stopInfo is undefined');
	}
	const stops = pattern.path.map(stop => ({
		name: stop.stop.name,
		municipality: stop.stop.municipality_name,
		locality: stop.stop.locality,
		facilities: stop.stop.facilities,
		id: stop.stop.id,
		delay: 1,
	}));
	console.log("responding to ", params.line_id, params.stop_id, stops.length, "stops")
  return {
    stops,
    qrcode: await dataurl,
		timetable,
		line_id: params.line_id,
		stop_id: params.stop_id,
		pattern: {
			color: pattern.color,
			text_color: pattern.text_color,
			path: pattern.path
		},
		stopInfo,
  }
}