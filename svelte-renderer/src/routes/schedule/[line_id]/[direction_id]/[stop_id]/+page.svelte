<script lang="ts">
	import type { Facility, Pattern, Timetable } from "../../../../lib/apitypes";

	import type { PageData } from "./$types";
	import Header from "./Header.svelte";
	import Spine from "$lib/spine/Spine.svelte";
	import Schedule from "$lib/schedule/Schedule.svelte";
	import ScheduleInfo from "./ScheduleInfo.svelte";
	import Footer from "./Footer.svelte";

	export let data: PageData;
	const stops = data.stops;
	const pattern = data.pattern;

	// console.log(stops);

	// date in dd.mm.yyyy
	const today = new Date()
		.toISOString()
		.split("T")[0]
		.split("-")
		.reverse()
		.join(".");

	const scores = {
		current: 1000,
		transition: 40,
		facility: {
			near_health_clinic: 29,
			near_hospital: 30,
			near_university: 20,
			school: 5,
			near_police_station: 5,
			near_fire_station: 5,
			shopping: 10,
			near_historic_building: 3,
			transit_office: 25,
			light_rail: 50,
			subway: 51,
			train: 55,
			boat: 55,
			airport: 80,
			bike_sharing: 10,
			bike_parking: 10,
			car_parking: 10,
		},
		facilityDefault: 1,
	} as const;

	const firstStop = stops[0];
	const lastStop = stops[stops.length - 1];
	const scoredStops = [];
	for (let i = 1; i < stops.length - 1; i++) {
		const stop = stops[i];
		// if (stop.facilities.length > 0) console.log(stop.facilities);
		let score = 0;
		for (let facility of stop.facilities) {
			score += scores.facility[facility] || scores.facilityDefault;
		}
		const isTransition =
			i > 0 &&
			i < stops.length - 1 &&
			stops[i - 1].municipality != stop.municipality;
		if (isTransition) {
			score += scores.transition;
		}
		if (stop.id == data.stop_id) {
			score += scores.current;
		}
		scoredStops.push({ index: i - 1, stop, score, show: false });
	}
	const limit = 23;

	let shownStopsCount = 1;
	let sortedScoredStops = scoredStops.toSorted((a, b) => b.score - a.score);
	// console.log(sortedScoredStops.map(stop => stop.score));
	for (let i = 0; i < sortedScoredStops.length; i++) {
		const stop = sortedScoredStops[i];
		let toAdd = 0;
		if (
			!scoredStops[stop.index - 1]?.show &&
			!scoredStops[stop.index + 1]?.show
		) {
			toAdd = 2;
		} else if (
			!scoredStops[stop.index - 1]?.show ||
			!scoredStops[stop.index + 1]?.show
		) {
			toAdd = 1;
		}
		if (toAdd + shownStopsCount <= limit) {
			shownStopsCount += toAdd;
			stop.show = true;
		}
	}
	const delays: { delay: number; startAt: number; span: number }[] = [];
	const renderedStops: (
		| { type: "skipped"; count: number; municipality: string[] }
		| { type: "stop"; stop: (typeof stops)[0] }
	)[] = [];
	let accumulatedDelay = 0;
	let delaySpan = 0;
	let lastDelayIndex = 0;
	for (let i = 0; i < scoredStops.length; i++) {
		let stop = scoredStops[i];
		let accumulatedMunicipalities = [];
		let skippedStops = 0;
		while (i < scoredStops.length && !stop.show) {
			if (accumulatedMunicipalities.indexOf(stop.stop.municipality) == -1)
				accumulatedMunicipalities.push(stop.stop.municipality);
			accumulatedDelay += stop.stop.delay;
			i++;
			stop = scoredStops[i];
			skippedStops++;
		}
		if (skippedStops > 0) {
			renderedStops.push({
				type: "skipped",
				count: skippedStops,
				municipality: accumulatedMunicipalities,
			});
			delaySpan++;
		}
		if (stop) {
			renderedStops.push({ type: "stop", stop: stop.stop });
			delaySpan++;
			accumulatedDelay += stop.stop.delay;
		}
		if (delaySpan >= 2 || i >= scoredStops.length - 1) {
			delays.push({
				startAt: lastDelayIndex,
				delay: accumulatedDelay,
				span: delaySpan,
			});
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
	let facilitySet: Set<Facility> = new Set();
	for (let stop of renderedStops.concat(
		{ type: "stop", stop: firstStop },
		{ type: "stop", stop: lastStop },
	)) {
		if (stop.type == "stop") {
			for (let facility of stop.stop.facilities) {
				facilitySet.add(facility);
			}
		}
	}
</script>

<div>
	<Header
		backgroundColor={pattern.color}
		color={pattern.text_color}
		lineId={data.line_id}
		firstStop={pattern.path[0].stop.name}
		lastStop={pattern.path[pattern.path.length - 1].stop.name}
	/>
	<div class="flex flex-row w-full p-4">
		<Spine
			class="grow"
			color={pattern.color}
			{firstStop}
			{lastStop}
			{delays}
			{renderedStops}
			currentStopId={data.stop_id}
		/>
		<div class="text-neutral-800 w-[430px] flex flex-col gap-2">
			<ScheduleInfo
				name={data.stopInfo.name}
				stopId={data.stop_id}
				startDate={today}
			/>
			<Schedule class="justify-self-end" timetable={data.timetable} />
		</div>
	</div>
	<div class="fixed bottom-0 w-full">
		<Footer qrcode={data.qrcode} facilities={Array.from(facilitySet)} />
	</div>
</div>
