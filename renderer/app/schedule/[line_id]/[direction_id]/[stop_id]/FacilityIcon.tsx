import Barco from '@/app/icons/Barco';
import Bicicleta from '@/app/icons/Bicicleta';
import CentroSaude from '@/app/icons/Centro Saúde';
import Comboio from '@/app/icons/Comboio';
import Comercio from '@/app/icons/Comércio';
import Escola from '@/app/icons/Escola';
import Hospital from '@/app/icons/Hospital';
import Metro from '@/app/icons/Metro';
import Navegante from '@/app/icons/Navegante';
import Universidade from '@/app/icons/Universidade';

import { Facility } from './apitypes';

export default function FacilityIcon({ className, facility }: { className?: string, facility: Facility }) {
	const icon = Svg({ facility });
	if (!icon) return null;
	return (
		<svg className={'inline-block ' + className}>
			<Svg facility={facility} />
		</svg>
	);
}

function Svg({ facility }: { facility: Facility }) {
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
