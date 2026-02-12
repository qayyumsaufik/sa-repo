export interface DashboardSummary {
  totalSites: number;
  totalDevices: number;
  totalSensors: number;
  activeEvents: number;
  greenSites: number;
  yellowSites: number;
  redSites: number;
}

export interface LevelChartDataPoint {
  timestamp: string;
  value: number | null;
  sensorName: string;
  sensorId: number;
}

export interface AmpsChartDataPoint {
  timestamp: string;
  value: number | null;
  sensorName: string;
  sensorId: number;
}

export interface StateTransitionDataPoint {
  timestamp: string;
  status: string;
  siteName: string;
  siteId: number;
}

export interface EventsChartDataPoint {
  timeRaised: string;
  eventTypeName: string;
  sensorName: string;
  siteName: string;
  resolved: boolean;
  eventId: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  severity: string;
}

export interface SiteOverview {
  siteId: number;
  siteName: string;
  level: string | null;
  status: string;
  region: string;
  zoneName: string;
}

export interface CurrentReading {
  sensorId: number;
  sensorName: string;
  currentValue: string | null;
  lastReadingTime: string | null;
}

export interface DashboardData {
  summary: DashboardSummary;
  siteOverview: SiteOverview[];
  levelChartData: LevelChartDataPoint[];
  ampsChartData: AmpsChartDataPoint[];
  currentLevelReadings: CurrentReading[];
  currentAmpsReadings: CurrentReading[];
  stateTransitions: StateTransitionDataPoint[];
  eventsChartData: EventsChartDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface GetDashboardDataParams {
  siteId?: number;
  startDate?: string;
  endDate?: string;
}
