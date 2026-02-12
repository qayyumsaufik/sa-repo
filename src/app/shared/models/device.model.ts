export interface Device {
  id: number;
  name: string;
  ip?: string;
  siteId: number;
  siteName: string;
  zoneName: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateDeviceRequest {
  name: string;
  ip?: string;
  siteId: number;
}

export interface UpdateDeviceRequest {
  id: number;
  name: string;
  ip?: string;
  siteId: number;
}
