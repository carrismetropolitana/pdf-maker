<script lang="ts">
	export let name: string;
	export let startDate: string;
	export let stopId: string;
</script>

<p class="text-[3mm]">
	<span class="font-semibold"> Horário da paragem</span>: {name}.
	<span class="font-semibold"> Código de paragem:</span> #{stopId}
	<span class="font-semibold"> Horário atualizado em:</span>
	{startDate}
</p>
