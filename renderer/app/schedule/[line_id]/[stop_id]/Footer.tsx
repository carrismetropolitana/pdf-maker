/* eslint-disable @next/next/no-img-element */
import QRCode from 'qrcode';
import React from 'react';
import Phone from './Phone';
import { Facility } from './apitypes';
import FacilityIcon from './FacilityIcon';
export default async function Footer({ line_id, stop_id, base_url, facilities }: { line_id: string, stop_id: string, base_url:string, facilities:Facility[]}) {
	let dataurl = await QRCode.toString(`${base_url}/${line_id}/${stop_id}`, { errorCorrectionLevel: 'H', margin: 0, type: 'svg' });

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
		renderedIcons.push({ description: facilityDescriptions[facility], icon: <FacilityIcon className='w-7 h-7' facility={facility} /> });
	}

	return (
		<div className='w-full h-24 flex p-2 justify-between'>
			<div className='w-full flex gap-4 text-[10pt] border border-l-0 items-start p-2 border-black'>
				{renderedIcons.map((icon, i) => <div key={i} className='flex gap-1 items-center flex-wrap'>{icon.icon}<div>{icon.description}</div></div>)}
			</div>
			<div className='w-full flex justify-end border-x-0 p-2 border-black border gap-2'>
				<div className='h-16 w-16' dangerouslySetInnerHTML={{ __html: dataurl }}/>
				<Phone className='h-16 w-max'/>
			</div>
		</div>
	);
}