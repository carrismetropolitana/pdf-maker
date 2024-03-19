import React from 'react';
import { Facility } from './apitypes';
import Autocarro from '@/app/icons/Autocarro.tsx';
import Barco from '@/app/icons/Barco.tsx';
import Bicicleta from '@/app/icons/Bicicleta.tsx';
import CentroSaude from '@/app/icons/Centro Saúde.tsx';
import CircularInterRegional from '@/app/icons/Circular Inter Regional.tsx';
import CircularLonga20 from '@/app/icons/Circular Longa-20.tsx';
import CircularLonga23 from '@/app/icons/Circular Longa-23.tsx';
import CircularMar from '@/app/icons/Circular Mar.tsx';
import CircularPróxima from '@/app/icons/Circular Próxima.tsx';
import CircularRápida from '@/app/icons/Circular Rápida.tsx';
import Comboio from '@/app/icons/Comboio.tsx';
import Comercio from '@/app/icons/Comércio.tsx';
import Escola from '@/app/icons/Escola.tsx';
import Hospital from '@/app/icons/Hospital.tsx';
import LinhaInterRegional from '@/app/icons/Linha Inter Regional.tsx';
import LinhaLonga from '@/app/icons/Linha Longa.tsx';
import LinhaMar from '@/app/icons/Linha Mar.tsx';
import LinhaPróxima from '@/app/icons/Linha Próxima.tsx';
import LinhaRápida from '@/app/icons/Linha Rápida.tsx';
import LinhaTurística from '@/app/icons/Linha Turística.tsx';
import Metro from '@/app/icons/Metro.tsx';
import MobilidadeReduzida from '@/app/icons/Mobilidade Reduzida.tsx';
import Navegante from '@/app/icons/Navegante.tsx';
import NovaParagem from '@/app/icons/Nova Paragem.tsx';
import ParagensDesativadas from '@/app/icons/Paragens Desativadas.tsx';
import Trotinete from '@/app/icons/Trotinete.tsx';
import Universidade from '@/app/icons/Universidade.tsx';

export default function FacilityIcon({ facility, className }: { facility: Facility, className:string }) {
	let icon = Svg({ facility });
	if (!icon) return null;
	return (
		<svg className={'inline-block ' + className }>
			<Svg facility={facility} />
		</svg>
	);
}

function Svg({ facility }: {facility: Facility}) {
	switch (facility) {
	case Facility.NEAR_HEALTH_CLINIC:
		return <CentroSaude />;
	case Facility.NEAR_HOSPITAL:
		return <Hospital />;
	case Facility.NEAR_UNIVERSITY:
		return <Universidade />;
	case Facility.NEAR_SCHOOL:
		return <Escola />;
	case Facility.NEAR_SHOPPING:
		return <Comercio />;
	case Facility.NEAR_TRANSIT_OFFICE:
		return <Navegante />;
	case Facility.LIGHT_RAIL:
		return <Metro />;
	case Facility.SUBWAY:
		return <Metro />;
	case Facility.TRAIN:
		return <Comboio />;
	case Facility.BOAT:
		return <Barco />;
	case Facility.BIKE_SHARING:
		return <Bicicleta />;
	case Facility.BIKE_PARKING:
		return <Bicicleta />;
	// case Facility.AIRPORT:
	// 	return <Airport />;
	// case Facility.CAR_PARKING:
	// 	return <CarParking />;
	// case Facility.NEAR_POLICE_STATION:
	// 	return <PoliceStation />;
	// case Facility.NEAR_FIRE_STATION:
	// 	return <FireStation />;
	// case Facility.NEAR_HISTORIC_BUILDING:
	// 	return <HistoricBuilding />;
	default:
		return null;
	}
}