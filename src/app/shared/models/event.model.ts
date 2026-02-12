export interface Event {
  id: number;
  sensorId: number;
  sensorName: string;
  deviceId: number;
  deviceName: string;
  siteId: number;
  siteName: string;
  zoneName: string;
  timeRaised: string;
  message: string;
  eventTypeId: number;
  eventTypeName: string;
  eventTypeSeverity: string;
  resolved: boolean;
  resolvedBy?: number;
  resolvedByName?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface ResolveEventRequest {
  resolutionNotes?: string;
}

export interface GetEventsQueryParams {
  [key: string]: string | number | boolean | Date | null | undefined;
  sensorId?: number;
  eventTypeId?: number;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}
