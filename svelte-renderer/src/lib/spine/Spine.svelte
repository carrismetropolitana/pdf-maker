<script lang="ts">
	import TablerClock from "./TablerClock.svelte";
	import StopLabel from "./StopLabel.svelte";
	import { Facility } from "$lib/apitypes";
	type Stop = {
		name: string;
		municipality: string;
		locality: string;
		facilities: Facility[];
		id: string;
		delay: number;
	};
	let className: string = "";
	export { className as class };
	export let color: string;
	export let firstStop: Stop;
	export let lastStop: Stop;
	export let delays: { startAt: number; delay: number; span: number }[];
	export let renderedStops: (
		| { type: "skipped"; count: number; municipality: string[] }
		| { type: "stop"; stop: Stop }
	)[];
	export let currentStopId: string;

	function isStop(stop: any): stop is { type: "stop"; stop: Stop } {
		return stop.type === "stop";
	}
</script>

<div class={className + " grid grid-cols-[5mm_4mm_1fr] items-start h-full"}>
	<div class="col-start-1 relative" style:grid-row-start={1}>
		<div class="absolute top-[16pt]">
			<div class="flex items-center justify-end">
				<TablerClock class="w-full h-5 -mb-1 -mr-px" />
			</div>
			<div class="text-[7pt] text-center">Min.</div>
		</div>
	</div>
	{#each delays as delay, i}
		{#if delay}
			<div
				class={"w-full self-center col-start-1 h-full border-y-black -mt-[0.5pt] flex items-center" +
					(i != 0 ? " border-t-[0.25pt]" : "") +
					(i == delays.length - 1 ? " border-b-[0.25pt]" : "")}
				style:grid-row-start={delay.startAt + 2}
				style:grid-row-end={delay.startAt + delay.span + 2}
			>
				<div class="text-xs text-center w-full text-neutral-700">
					{delay.delay}
				</div>
			</div>
		{/if}
	{/each}

	<div
		class="w-[4mm] self-stretch col-start-2"
		style:background-color={color}
		style:grid-row-start={2}
		style:grid-row-end={100}
	></div>
	<div
		class="relative h-[4mm] self-end"
		style:grid-row-start={1}
		style:grid-row-end={1}
	>
		<div
			class="w-[4mm] h-[4mm] rounded-full bg-black absolute top-1/2 flex items-center justify-center"
		>
			<svg
				stroke="white"
				class="w-[3.5mm] h-[3.5mm] fill-transparent"
				viewBox="0 0 24 24"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M6 9l6 6l6 -6" />
			</svg>
		</div>
	</div>

	<div
		class="gap-1 h-8 col-start-3 self-center relative top-px"
		style:grid-row-start={1}
	>
		<div class="flex items-center gap-2 h-8 absolute top-1/2">
			<div class="bg-black h-px mt-px w-2"></div>
			<StopLabel stop={firstStop} isBold={true} />
		</div>
	</div>
	{#each renderedStops as stop, i}
		<div class="gap-1 h-8 col-start-3 relative" style:grid-row-start={i + 2}>
			<div class="absolute top-1/2 flex items-center gap-2 h-8">
				{#if isStop(stop)}
					{#if stop.stop.id === currentStopId}
						<div class="relative -mr-2">
							<div class="absolute top-0 bottom-0 flex items-center right-0">
								<div
									class="h-[4mm] w-[4mm] rounded-full flex items-center justify-center bg-black"
								>
									<div class="h-[2mm] w-[2mm] rounded-full bg-white"></div>
								</div>
							</div>
						</div>
					{/if}
					<div class="bg-black h-px w-[2mm]"></div>
					<StopLabel stop={stop.stop} isBold={stop.stop.id === currentStopId} />
				{:else}
					<div class="h-16 flex flex-col justify-evenly">
						{#each [...Array(stop.count)] as _, i}
							<div class="bg-neutral-400 h-[0.5pt] w-[2mm]"></div>
						{/each}
					</div>
					<div class="flex items-stretch gap-1 text-[7pt] text-neutral-400">
						+{stop.count} paragens em {stop.municipality}
					</div>
				{/if}
			</div>
		</div>
	{/each}
	<div
		class="relative h-[4mm] self-end"
		style:grid-row-start={renderedStops.length + 2}
		style:grid-row-end={renderedStops.length + 2}
		style:grid-column={2}
	>
		<div
			class="w-[4mm] h-[4mm] rounded-full bg-black absolute top-1/2 flex items-center justify-center"
		>
			<svg
				stroke="white"
				class="w-[3mm] h-[3mm]"
				viewBox="0 0 24 24"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M18 6l-12 12" />
				<path d="M6 6l12 12" />
			</svg>
		</div>
	</div>
	<div
		class="gap-2 h-8 col-start-3 relative"
		style:grid-row-start={renderedStops.length + 2}
	>
		<div class="absolute top-1/2 flex items-center gap-1 h-8">
			<div class="bg-black h-[1px] w-2"></div>
			<StopLabel stop={lastStop} isBold={true} />
		</div>
	</div>
</div>
