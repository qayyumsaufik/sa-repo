export interface Tenant {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateTenantRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTenantRequest {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}
