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
  Stop: Stop
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
  parish_id: any
  parish_name: any
  municipality_id: string
  municipality_name: string
  district_id: string
  district_name: string
  region_id: string
  region_name: string
  wheelchair_boarding: any
  facilities: string[]
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