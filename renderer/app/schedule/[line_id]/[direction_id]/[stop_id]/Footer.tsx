/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Facility } from './apitypes';
import FacilityIcon from './FacilityIcon';
import Logo from './logo';
export default async function Footer({ line_id, stop_id, user_url, facilities, direction_id }: { line_id: string, stop_id: string, direction_id:string, user_url:string, facilities:Facility[]}) {
	// let dataurl = await QRCode.toString(`${user_url}/${line_id}/${direction_id}/${stop_id}`, { errorCorrectionLevel: 'H', margin: 0, type: 'svg' });

	const facilityDescriptions:Record<Facility, string> = {
		airport: 'Aeroporto',
		boat: 'Barco',
		bike_parking: 'Estacionamento de Bicicletas',
		bike_sharing: 'Partilha de Bicicletas',
		car_parking: 'Estacionamento',
		light_rail: 'Metro de Superfície',
		near_fire_station: 'Bombeiros',
		near_health_clinic: 'Centro de Saúde',
		near_historic_building: 'Edifício Histórico',
		near_hospital: 'Hospital',
		near_police_station: 'Esquadra de Polícia',
		school: 'Escola',
		near_university: 'Universidade',
		shopping: 'Centro Comercial',
		subway: 'Metro',
		train: 'Comboio',
		transit_office: 'Espaço navegante',

	};
	const renderedIcons = [];
	for (let facility of facilities.sort()) {
		renderedIcons.push({ description: facilityDescriptions[facility], icon: <FacilityIcon className='w-5 h-5' facility={facility} /> });
	}

	return (
		<div>
			<div className='flex gap-3 px-8 font-semibold text-sm py-1'>
			</div>
			<div className='w-full h-20 flex p-2 justify-between'>
				{/* <div className='w-full flex gap-2 gap-x-4 text-[10pt] flex-wrap pl-6 items-center'>
					{renderedIcons.map((icon, i) => <div key={i} className='flex gap-1 items-center'>{icon.icon}<div>{icon.description}</div></div>)}
				</div> */}
				<div className=' flex justify-start p-1 gap-2'>
					<div className=' px-2 flex items-center'>
						<Logo className='w-[32mm]' />
					</div>
					<div className='border-l pl-2 border-neutral-200 flex flex-col justify-between h-full font-bold text-black leading-none px-2 scale-90 origin-left'>
						<div className='text-xs leading-none'>Linha de Apoio</div>
						<div className='text-xl leading-none'>210 410 400</div>
						<div className='text-[0.70rem]'>www.carrismetropolitana.pt</div>
					</div>

				</div>
			</div>
		</div>
	);
}