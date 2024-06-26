import React from 'react';
import { Facility } from './apitypes';
import Autocarro from '@/app/icons/Autocarro';
import Barco from '@/app/icons/Barco';
import Bicicleta from '@/app/icons/Bicicleta';
import CentroSaude from '@/app/icons/Centro Saúde';
import Comboio from '@/app/icons/Comboio';
import Comercio from '@/app/icons/Comércio';
import Escola from '@/app/icons/Escola';
import Hospital from '@/app/icons/Hospital';
import Metro from '@/app/icons/Metro';
import MobilidadeReduzida from '@/app/icons/Mobilidade Reduzida';
import Navegante from '@/app/icons/Navegante';
import NovaParagem from '@/app/icons/Nova Paragem';
import ParagensDesativadas from '@/app/icons/Paragens Desativadas';
import Trotinete from '@/app/icons/Trotinete';
import Universidade from '@/app/icons/Universidade';
import CircularInterRegional from '@/app/icons/Circular Inter Regional';
import CircularLonga20 from '@/app/icons/Circular Longa-20';
import CircularLonga23 from '@/app/icons/Circular Longa-23';
import CircularMar from '@/app/icons/Circular Mar';
import CircularPróxima from '@/app/icons/Circular Próxima';
import CircularRápida from '@/app/icons/Circular Rápida';
import LinhaInterRegional from '@/app/icons/Linha Inter Regional';
import LinhaLonga from '@/app/icons/Linha Longa';
import LinhaMar from '@/app/icons/Linha Mar';
import LinhaPróxima from '@/app/icons/Linha Próxima';
import LinhaRápida from '@/app/icons/Linha Rápida';
import LinhaTurística from '@/app/icons/Linha Turística';

export default function FacilityIcon({ facility, className }: { facility: Facility, className?:string }) {
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