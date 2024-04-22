<script lang="ts">
	import type { Timetable } from "$lib/apitypes";
	import PeriodTable from "./PeriodTable.svelte";
	import Exceptions from "./Exceptions.svelte";

	let className: string;
	export { className as class };
	export let timetable: Timetable;
</script>

<div class={className + " flex flex-col gap-5"}>
	{#each timetable.periods as period, i}
		<PeriodTable {period} />
	{/each}
	<Exceptions exceptions={timetable.exceptions} />
</div>
