<script lang="ts">
  import type { Facility } from "$lib/apitypes";
  type Stop = {
    name: string;
    municipality: string;
    locality: string;
    facilities: Facility[];
    id: string;
    delay: number;
  };
  import FacilityIcon from "$lib/FacilityIcon.svelte";
  export let stop: Stop;
  export let isBold: boolean;
</script>

<div class="flex flex-col">
  <div
    class={`flex justify-start items-center leading-3 max-w-[60mm] ${isBold ? "font-medium text-[10pt]" : "font-normal text-[8pt]"}`}
  >
    <div class="overflow-ellipsis whitespace-nowrap">{stop.name}</div>
    {#each stop.facilities as facility, i (i)}
      <FacilityIcon {facility} class="w-[6mm] h-[5mm] -my-6" />
    {/each}
  </div>
  <div class="text-[7pt] font-light leading-none">
    {stop.locality && `${stop.locality}, `}{stop.municipality}
  </div>
</div>
