<script lang="ts">
	import QRCode from "qrcode";
	import Phone from "./Phone.svelte";
	import type { Facility } from "$lib/apitypes";
	import FacilityIcon from "$lib/FacilityIcon.svelte";
	export let facilities: Facility[];
	export let qrcode: string;

	const facilityDescriptions: Record<Facility, string> = {
		airport: "Aeroporto",
		boat: "Barco",
		bike_parking: "Estacionamento de Bicicletas",
		bike_sharing: "Partilha de Bicicletas",
		car_parking: "Estacionamento",
		light_rail: "Metro de Superfície",
		near_fire_station: "Bombeiros",
		near_health_clinic: "Centro de Saúde",
		near_historic_building: "Edifício Histórico",
		near_hospital: "Hospital",
		near_police_station: "Esquadra de Polícia",
		school: "Escola",
		near_university: "Universidade",
		shopping: "Centro Comercial",
		subway: "Metro",
		train: "Comboio",
		transit_office: "Espaço navegante",
	};
</script>

<div class="w-full h-24 flex p-2 justify-between">
	<div
		class="w-full flex gap-4 text-[10pt] border border-l-0 items-start p-2 border-black"
	>
		{#each facilities.sort() as facility}
			<div class="flex gap-1 items-center flex-wrap">
				<FacilityIcon class="w-7 h-7" {facility} />
				<div>{facilityDescriptions[facility]}</div>
			</div>
		{/each}
	</div>
	<div class="w-full flex justify-end border-x-0 p-2 border-black border gap-2">
		<div class="h-16 w-16">{@html qrcode}</div>
		<Phone class="h-16 w-max" />
	</div>
</div>
