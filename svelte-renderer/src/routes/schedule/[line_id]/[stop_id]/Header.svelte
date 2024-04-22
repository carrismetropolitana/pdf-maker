<script lang="ts">
	import Logo from "./logo.svelte";
	export let backgroundColor: string;
	export let color: string;
	export let lineId: string;
	export let firstStop: string;
	export let lastStop: string;
	const lineTypes: Record<string, string> = {
		"#3D85C6": "P",
		"#C61D23": "L",
		"#FDB71A": "R",
		"#0C807E": "M",
		"#BB3E96": "I",
	};
	let lineType = lineTypes[backgroundColor] || "?";
</script>

<div class="p-[5mm] bg-black h-[30mm] text-white w-full flex items-center">
	<div class="flex flex-row justify-between w-full">
		<div class="flex flex-row justify-start gap-[10mm]">
			<div>
				<Logo class="w-[45.6mm]" />
			</div>
			<div class="flex flex-row gap-[2.5mm] justify-start">
				<div class="">
					<div
						class="flex h-full w-[4mm] rounded-[5mm] flex-col justify-between"
						style:background-color={backgroundColor}
					>
						<div
							class="flex bg-white rounded-[5mm] h-[4mm] w-[4mm] text-black flex-row items-center justify-center"
						>
							<svg
								stroke="black"
								class="w-[12mm] h-[12mm] fill-transparent"
								viewBox="0 0 24 24"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M6 9l6 6l6 -6" />
							</svg>
						</div>
						<div
							class="flex bg-black rounded-[5mm] text-white h-[4mm] w-[4mm] text-[3mm] font-bold flex-row items-center justify-center"
						>
							<p>{lineType}</p>
						</div>
						<div
							class="flex bg-white rounded-[5mm] h-[4mm] w-[4mm] text-black flex-row items-center justify-center"
						>
							<svg
								stroke="black"
								class="w-[12mm] h-[12mm]"
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
				</div>
				<div
					class="flex h-full flex-col justify-between text-[11pt] leading-none"
				>
					<p>{firstStop}</p>
					<p>{lastStop}</p>
				</div>
			</div>
		</div>
		<div
			class="text-center px-[10mm] py-[2mm] font-bold rounded-full text-[16mm] leading-none"
			style:background-color={backgroundColor}
			style:color
		>
			<p>{lineId}</p>
		</div>
	</div>
</div>
