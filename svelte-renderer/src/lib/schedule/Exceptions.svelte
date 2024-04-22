<script lang="ts">
  export let exceptions: {
    id: string;
    label: string;
    text: string;
  }[];
</script>

<div class="flex flex-col gap-0">
  {#each exceptions as exception, i (i)}
    <div class="flex flex-row gap-2">
      <p class="text-[8pt]">
        <span class="font-bold">{exception.label} </span>
        {exception.text}
      </p>
    </div>
  {/each}
</div>
