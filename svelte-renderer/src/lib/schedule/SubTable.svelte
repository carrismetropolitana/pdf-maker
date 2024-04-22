<script lang="ts">
	import type { TimetableEntry } from "$lib/apitypes";

	export let title: string;
	export let times: TimetableEntry[];
	let timesByHour: { minute: number; exception: string }[][] = Array.from<
		number[],
		{ minute: number; exception: string }[]
	>({ length: 25 }, () => []);
	for (let entry of times) {
		const [hour, minute, _] = entry.time.split(":").map((s) => parseInt(s, 10));
		const exception = entry.exceptions.map((e) => e.id).join(",");
		let span = timesByHour[hour];
		if (span && !span.find((elem) => elem.minute == minute))
			span.push({ minute, exception });
	}
	// sort each span
	for (let span of timesByHour) {
		span.sort((a, b) => a.minute - b.minute);
	}
	// console.log(times);
</script>

<div class="">
	<div class="bg-black h-px w-full"></div>
	<h3>{title}</h3>
	<div class="flex text-[3mm]">
		<div class="flex flex-col">
			<div
				class="bg-black text-white text-center rounded-l-full pl-2 -ml-2 font-semibold text-[8pt] h-[4mm] leading-none flex items-center"
			>
				Hora
			</div>
			<div class="text-center text-[7.5pt]">Min.</div>
		</div>
		{#each timesByHour as minutes, hour}
			<div class="flex flex-col items-stretch w-4 text-[7mm]">
				<div
					class={"bg-black text-white text-center font-semibold text-[8pt] h-[4mm] leading-none flex items-center justify-center relative " +
						(hour == timesByHour.length - 1
							? " pr-1 -mr-1 rounded-r-full"
							: "")}
				>
					{hour}
				</div>
				{#each minutes as entry, i}
					<div class={"text-[7.5pt] text-center relative self-center"}>
						{entry.minute.toString().padStart(2, "0")}
						{#if entry.exception}
							<div
								class="absolute top-[0pt] left-full font-semibold text-[4pt]"
							>
								{entry.exception}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
