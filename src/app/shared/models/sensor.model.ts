export interface Sensor {
  id: number;
  name: string;
  address?: string;
  threshold?: number;
  clearThreshold?: number;
  deviceId: number;
  deviceName: string;
  siteId: number;
  siteName: string;
  zoneName: string;
  regTypeId: number;
  regTypeName: string;
  regTypeCount: number;
  regTypeDataType: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateSensorRequest {
  name: string;
  address?: string;
  threshold?: number;
  clearThreshold?: number;
  deviceId: number;
  regTypeId: number;
}

export interface UpdateSensorRequest {
  id: number;
  name: string;
  address?: string;
  threshold?: number;
  clearThreshold?: number;
  deviceId: number;
  regTypeId: number;
}
