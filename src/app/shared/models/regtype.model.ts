export interface RegType {
  id: number;
  name: string;
  count: number;
  dataType: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateRegTypeRequest {
  name: string;
  count: number;
  dataType: string;
}

export interface UpdateRegTypeRequest {
  id: number;
  name: string;
  count: number;
  dataType: string;
}
