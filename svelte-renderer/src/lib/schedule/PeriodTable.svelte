<script lang="ts">
	import type { TimetablePeriod, TimetableEntry } from "$lib/apitypes";
	import hash from "object-hash";
	import SubTable from "./SubTable.svelte";
	export let period: TimetablePeriod;
	// Merge timetables which are the same, and their names
	let possibilities = [
		["weekdays", "Dias Úteis"],
		["saturdays", "Sábados"],
		["sundays_holidays", "Domingos e Feriados"],
	] as const;
	let hashed = new Map<string, [string[], TimetableEntry[]]>();
	for (let p of possibilities) {
		let times = period[p[0]];
		if (times.length == 0) continue;
		let h = hash(times, { respectType: false });
		let prev = hashed.get(h);
		if (prev === undefined) {
			hashed.set(h, [[p[1]], times]);
		} else {
			prev[0].push(p[1]);
		}
	}
	let toRender = Array.from(hashed.values())
		.map((v) => {
			// Build title string, using ' e ' for the last element, unless it already has it,
			// as is the case with Domingos e Feriados
			let [titles, times] = v;
			let str = "";
			for (let i = 0; i < titles.length; i++) {
				let t = titles[i];
				if (i == titles.length - 1 && !t.includes(" e ") && i > 0)
					str += " e " + t;
				else if (i > 0) str += ", " + t;
				else str += t;
			}
			return [str, times] as [string, TimetableEntry[]];
		})
		.sort((a, b) => {
			// Sort the names so that we always get strings starting with Dias Úteis first, and Domingos last
			if (a[0].startsWith("Dias Úteis")) return -1;
			if (b[0].startsWith("Dias Úteis")) return 1;
			if (a[0].startsWith("Domingos")) return 1;
			if (b[0].startsWith("Domingos")) return -1;
			return 0;
		});
</script>

<div>
	<h2 class="text-xl">{period.period_name}</h2>
	<div class="flex flex-col gap-2">
		{#if toRender.length > 0}
			{#each toRender as [title, times], i}
				<SubTable {title} {times} />
			{/each}
		{:else}<div class="font-semibold text-[8pt]">
				Não há horários de passagem neste período
			</div>
		{/if}
	</div>
</div>
