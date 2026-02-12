export interface Zone {
  id: number;
  name: string;
  description?: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateZoneRequest {
  name: string;
  description?: string;
}

export interface UpdateZoneRequest {
  id: number;
  name: string;
  description?: string;
}
