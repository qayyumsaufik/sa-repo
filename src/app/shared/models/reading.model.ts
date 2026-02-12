export interface Reading {
  id: number;
  sensorId: number;
  sensorName: string;
  timestamp: string;
  values: ReadingValue[];
  createdDate: string;
  lastModifiedDate?: string;
}

export interface ReadingValue {
  id: number;
  readingId: number;
  valueIndex: number;
  value: string;
  valueType?: string;
}

export interface GetReadingsQueryParams {
  [key: string]: string | number | boolean | Date | null | undefined;
  sensorId: number;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}
