export type TimetableEntry = {
  time: string;
  exceptions: {
    id: string;
  }[];
};

export type TimetablePeriod = {
  period_id: string;
  period_name: string;
  weekdays: TimetableEntry[];
  saturdays: TimetableEntry[];
  sundays_holidays: TimetableEntry[];
};

export type Timetable = {
  periods: TimetablePeriod[],
  exceptions: {
    id: string;
    label: string;
    text: string;
  }[];
  patternForDisplay: string;
  secondaryPatterns: string[];
};

export type Pattern = {
  id: string
  line_id: string
  route_id: string
  short_name: string
  direction: number
  headsign: string
  color: string
  text_color: string
  valid_on: string[]
  municipalities: string[]
  localities: string[]
  facilities: any[]
  shape_id: string
  path: Path[]
  trips: Trip[]
}

export type Path = {
  stop: Stop
  stop_sequence: number
  allow_pickup: boolean
  allow_drop_off: boolean
  distance_delta: number
}

export type Stop = {
  id: string
  name: string
  short_name: any
  tts_name: string
  lat: string
  lon: string
  locality: string
  parish_id: string|null
  parish_name: string|null
  municipality_id: string
  municipality_name: string
  district_id: string
  district_name: string
  region_id: string
  region_name: string
  wheelchair_boarding: any
  facilities: Facility[]
  lines: string[]
  routes: string[]
  patterns: string[]
}

export type Trip = {
  id: string
  calendar_id: string
  calendar_description: string
  dates: string[]
  schedule: Schedule[]
}

export type Schedule = {
  stop_id: string
  stop_sequence: number
  arrival_time: string
  arrival_time_operation: string
  travel_time: string
}

export enum Facility {
	NEAR_HEALTH_CLINIC = 'near_health_clinic',
	NEAR_HOSPITAL = 'near_hospital',
	NEAR_UNIVERSITY = 'near_university',
	NEAR_SCHOOL = 'school',
	NEAR_POLICE_STATION = 'near_police_station',
	NEAR_FIRE_STATION = 'near_fire_station',
	NEAR_SHOPPING = 'shopping',
	NEAR_HISTORIC_BUILDING = 'near_historic_building',
	NEAR_TRANSIT_OFFICE = 'transit_office',
	LIGHT_RAIL = 'light_rail',
	SUBWAY = 'subway',
	TRAIN = 'train',
	BOAT = 'boat',
	AIRPORT = 'airport',
	BIKE_SHARING = 'bike_sharing',
	BIKE_PARKING = 'bike_parking',
	CAR_PARKING = 'car_parking',
}

export type Line = {
  id: string
  short_name: string
  long_name: string
  color: string
  text_color: string
  routes: string[]
  patterns: string[]
  municipalities: string[]
  localities: string[]
  facilities: Facility[]
}