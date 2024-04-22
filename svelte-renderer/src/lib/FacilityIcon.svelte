<script lang="ts">
	import { Facility } from "./apitypes";
	import Autocarro from "$lib/icons/Autocarro.svelte";
	import Barco from "$lib/icons/Barco.svelte";
	import Bicicleta from "$lib/icons/Bicicleta.svelte";
	import CentroSaude from "$lib/icons/Centro Saúde.svelte";
	import Comboio from "$lib/icons/Comboio.svelte";
	import Comercio from "$lib/icons/Comércio.svelte";
	import Escola from "$lib/icons/Escola.svelte";
	import Hospital from "$lib/icons/Hospital.svelte";
	import Metro from "$lib/icons/Metro.svelte";
	import MobilidadeReduzida from "$lib/icons/Mobilidade Reduzida.svelte";
	import Navegante from "$lib/icons/Navegante.svelte";
	import NovaParagem from "$lib/icons/Nova Paragem.svelte";
	import ParagensDesativadas from "$lib/icons/Paragens Desativadas.svelte";
	import Trotinete from "$lib/icons/Trotinete.svelte";
	import Universidade from "$lib/icons/Universidade.svelte";
	import CircularInterRegional from "$lib/icons/Circular Inter Regional.svelte";
	import CircularLonga20 from "$lib/icons/Circular Longa-20.svelte";
	import CircularLonga23 from "$lib/icons/Circular Longa-23.svelte";
	import CircularMar from "$lib/icons/Circular Mar.svelte";
	import CircularPróxima from "$lib/icons/Circular Próxima.svelte";
	import CircularRápida from "$lib/icons/Circular Rápida.svelte";
	import LinhaInterRegional from "$lib/icons/Linha Inter Regional.svelte";
	import LinhaLonga from "$lib/icons/Linha Longa.svelte";
	import LinhaMar from "$lib/icons/Linha Mar.svelte";
	import LinhaPróxima from "$lib/icons/Linha Próxima.svelte";
	import LinhaRápida from "$lib/icons/Linha Rápida.svelte";
	import LinhaTurística from "$lib/icons/Linha Turística.svelte";
	import type { SvelteComponent } from "svelte";

	export let facility: Facility;
	let className: string = "";
	export { className as class };

	// The SVG component dynamically determined by the facility
	let SvgComponent = selectSvgComponent(facility);

	function selectSvgComponent(
		facility: Facility,
	): typeof SvelteComponent<{}> | null {
		switch (facility) {
			case Facility.NEAR_HEALTH_CLINIC:
				return CentroSaude;
			case Facility.NEAR_HOSPITAL:
				return Hospital;
			case Facility.NEAR_UNIVERSITY:
				return Universidade;
			case Facility.NEAR_SCHOOL:
				return Escola;
			case Facility.NEAR_SHOPPING:
				return Comercio;
			case Facility.NEAR_TRANSIT_OFFICE:
				return Navegante;
			case Facility.LIGHT_RAIL:
				return Metro;
			case Facility.SUBWAY:
				return Metro;
			case Facility.TRAIN:
				return Comboio;
			case Facility.BOAT:
				return Barco;
			case Facility.BIKE_SHARING:
			case Facility.BIKE_PARKING:
				return Bicicleta;
			default:
				return null;
		}
	}
</script>

{#if SvgComponent}
	<div class="inline-block {className}">
		<svelte:component this={SvgComponent} />
	</div>
{/if}
