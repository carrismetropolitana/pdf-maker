/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TimetableEntry {
	exceptions: {
		id: string
	}[]
	time: string
}

export interface TimetablePeriod {
	period_id: string
	period_name: string
	saturdays: TimetableEntry[]
	sundays_holidays: TimetableEntry[]
	weekdays: TimetableEntry[]
}

export interface Timetable {
	exceptions: {
		id: string
		label: string
		text: string
	}[]
	patternForDisplay: string
	periods: TimetablePeriod[]
	secondaryPatterns: string[]
}

export interface Pattern {
	color: string
	direction: number
	facilities: any[]
	headsign: string
	id: string
	line_id: string
	localities: string[]
	municipalities: string[]
	path: Path[]
	route_id: string
	shape_id: string
	short_name: string
	text_color: string
	trips: Trip[]
	valid_on: string[]
};

export interface Path {
	allow_drop_off: boolean
	allow_pickup: boolean
	distance_delta: number
	stop: Stop
	stop_sequence: number
};

export interface Stop {
	district_id: string
	district_name: string
	facilities: Facility[]
	id: string
	lat: string
	lines: string[]
	locality: string
	lon: string
	municipality_id: string
	municipality_name: string
	name: string
	parish_id: null | string
	parish_name: null | string
	patterns: string[]
	region_id: string
	region_name: string
	routes: string[]
	short_name: any
	tts_name: string
	wheelchair_boarding: any
};

export interface Trip {
	calendar_description: string
	calendar_id: string
	dates: string[]
	id: string
	schedule: Schedule[]
};

export interface Schedule {
	arrival_time: string
	arrival_time_operation: string
	stop_id: string
	stop_sequence: number
	travel_time: string
};

export enum Facility {
	AIRPORT = 'airport',
	BIKE_PARKING = 'bike_parking',
	BIKE_SHARING = 'bike_sharing',
	BOAT = 'boat',
	CAR_PARKING = 'car_parking',
	LIGHT_RAIL = 'light_rail',
	NEAR_FIRE_STATION = 'near_fire_station',
	NEAR_HEALTH_CLINIC = 'near_health_clinic',
	NEAR_HISTORIC_BUILDING = 'near_historic_building',
	NEAR_HOSPITAL = 'near_hospital',
	NEAR_POLICE_STATION = 'near_police_station',
	NEAR_SCHOOL = 'school',
	NEAR_SHOPPING = 'shopping',
	NEAR_TRANSIT_OFFICE = 'transit_office',
	NEAR_UNIVERSITY = 'near_university',
	SUBWAY = 'subway',
	TRAIN = 'train',
}

export interface Line {
	color: string
	facilities: Facility[]
	id: string
	localities: string[]
	long_name: string
	municipalities: string[]
	patterns: string[]
	routes: string[]
	short_name: string
	text_color: string
}
