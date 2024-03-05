import { CSSProperties } from 'react';
export default function Spine({ className, style, stops }: {className?: string, style?:CSSProperties, stops:{
  name: string;
  municipality: string;
  facilities: string[];
}[]}) {
	return (
		<div className={className} style={style}>
			<div className='bg-white p-4 font-sans text-black'>
				<div className='grid grid-cols-3 items-start gap-4'>
					<div className='col-span-1 flex flex-col items-center'>
						<div className='min-h-screen flex flex-col items-center justify-between'>
							<div className='w-1 bg-red-600 flex-grow'></div>
							<div className='bg-black rounded-full h-4 w-4 mb-4'></div>
						</div>
					</div>

					<div className='col-span-1'></div>

					<div className='col-span-1'>
						<div className='mb-4'>
							<h2 className='font-bold'>Alcochete (Av Barris) Centro Saúde</h2>
							<p>Alcochete, Alcochete</p>
						</div>
						<div className='mb-4'>
						</div>
					</div>
				</div>
			</div>

		</div>
	);
}