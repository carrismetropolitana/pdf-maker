import Logo from './logo';

export default function Header({ backgroundColor, color, lineId, firstStop, lastStop }: {backgroundColor: string, color: string, lineId:string, firstStop:string, lastStop:string}) {
	return (

		<div className='p-[5mm] bg-black h-[30mm] text-white w-full flex items-center'>
			<div className='flex flex-row justify-between w-full'>
				<div className='flex flex-row justify-start gap-[10mm]'>
					<div>
						<Logo className='w-[45.6mm]' />
					</div>
					<div className='flex flex-row gap-[2.5mm] justify-start'>
						<div className='flex h-full w-[4mm] rounded-[5mm] flex-col justify-between' style={{ backgroundColor }}>
							<div className='flex bg-white rounded-[5mm] h-[4mm] w-[4mm] text-black flex-row items-center justify-center'>
								<svg
									stroke='black'
									className='w-[12mm] h-[12mm]'
									viewBox='0 0 24 24'
									strokeWidth='3'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M6 9l6 6l6 -6' />
								</svg>
							</div>
							<div className='flex bg-black rounded-[5mm] text-white h-[4mm] w-[4mm] text-[3mm] font-bold flex-row items-center justify-center'>
								<p>B</p>
							</div>
							<div className='flex bg-white rounded-[5mm] h-[4mm] w-[4mm] text-black flex-row items-center justify-center'>
								<svg
									stroke='black'
									className='w-[12mm] h-[12mm]'
									viewBox='0 0 24 24'
									strokeWidth='3'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path stroke='none' d='M0 0h24v24H0z' fill='none' />
									<path d='M18 6l-12 12' />
									<path d='M6 6l12 12' />
								</svg>
							</div>
						</div>
						<div className='flex h-full flex-col justify-between font-base'>
							<p>{firstStop}</p>
							<p>{lastStop}</p>
						</div>
					</div>
				</div>
				<div className='text-center px-[10mm] py-[2mm] font-bold rounded-full text-[16mm] leading-none '
					style={{ backgroundColor, color }}>
					<p>{lineId}</p>
				</div>
			</div>
		</div>
	);
}