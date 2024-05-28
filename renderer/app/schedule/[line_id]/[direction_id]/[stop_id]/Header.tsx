export default function Header({ backgroundColor, color, lineId, headsign, dataurl }: {backgroundColor: string, color: string, lineId:string, headsign:string, dataurl:string}) {
	const lineTypes:Record<string, string> = {
		'#3D85C6': 'P',
		'#C61D23': 'L',
		'#FDB71A': 'R',
		'#0C807E': 'M',
		'#BB3E96': 'I',
	};
	// TODO: remove duplicates from GTFS

	// let lineType = lineTypes[backgroundColor] || '?';
	let fontSize = 20;
	if (headsign.length > 35) {
		fontSize = 18;
	}
	if (headsign.length > 50) {
		fontSize = 17;
	}
	return (
		<div className='p-[5mm] bg-black h-[30mm] text-white w-full flex items-center justify-between'>
			<div className='flex flex-row justify-start gap-[4mm] items-center'>
				<div className='text-center px-[10mm] py-2 font-bold rounded-full text-[40pt] leading-none flex items-center'
					style={{ backgroundColor, color }}>
					{lineId}
				</div>
				<div className='flex flex-row justify-start'>
					<div className='flex h-full flex-col justify-center leading-none gap-2 font-bold' style={{ fontSize: fontSize + 'pt' }}>
						<div className='flex items-center'>
							{headsign}
						</div>
					</div>
				</div>
			</div>
			<div className='flex gap-1 items-center'>
				<div className='w-20 text-[0.5rem] font-bold leading-tight self-end text-right pb-[0.15rem]'>
						Consulte aqui o horário atualizado desta paragem
				</div>
				<div className='h-16 w-16 p-1 bg-white rounded-sm' dangerouslySetInnerHTML={{ __html: dataurl }}/>
			</div>
		</div>
	);
}