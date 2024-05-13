export default function Header({ backgroundColor, color, lineId, headsigns, dataurl }: {backgroundColor: string, color: string, lineId:string, headsigns:string[], dataurl:string}) {
	const lineTypes:Record<string, string> = {
		'#3D85C6': 'P',
		'#C61D23': 'L',
		'#FDB71A': 'R',
		'#0C807E': 'M',
		'#BB3E96': 'I',
	};
	// TODO: remove duplicates from GTFS
	headsigns = Array.from(new Set(headsigns));

	let lineType = lineTypes[backgroundColor] || '?';
	let fontSizes:Record<number, number> = {
		1: 17,
		2: 15,
		3: 12,
		4: 12,
		5: 10,
	};
	let fontSize = fontSizes[headsigns.length] || 10;
	return (

		<div className='p-[5mm] bg-black h-[30mm] text-white w-full flex items-center justify-between'>
			<div className='flex flex-row justify-start gap-[2mm] items-center'>
				<div className='text-center px-[10mm] py-2 font-bold rounded-full text-[40pt] leading-none flex items-center'
					style={{ backgroundColor, color }}>
					{lineId}
				</div>
				<div className='flex flex-row justify-start'>
					<div className='flex h-full flex-col justify-center leading-none gap-2 font-bold' style={{ fontSize: fontSize + 'pt' }}>
						{headsigns.map((headsign, index) => <div className='flex items-center' key={index}>
							<div className='flex items-center justify-center rounded-full mr-2'>
								<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M5 12l14 0' /><path d='M13 18l6 -6' /><path d='M13 6l6 6' /></svg>
							</div>
							<div>
								{headsign}
							</div>
						</div>)}
					</div>
				</div>
			</div>
			<div className='flex gap-1 items-center'>
				{/* <Logo className='w-[45.6mm]' /> */}
				<div className='w-20 text-[0.5rem] font-bold leading-tight self-end text-right pb-[0.15rem]'>
						Consulte aqui o horário atualizado desta paragem
				</div>
				<div className='h-16 w-16 p-1 bg-white rounded-sm' dangerouslySetInnerHTML={{ __html: dataurl }}/>
			</div>
		</div>
	);
}