export interface SiteStatus {
  id: number;
  siteId: number;
  currentStatus: 'Green' | 'Yellow' | 'Red';
  message?: string;
  lastUpdated: string;
}

export interface Site {
  id: number;
  name: string;
  zoneId: number;
  zoneName: string;
  latitude?: number;
  longitude?: number;
  siteStatus?: SiteStatus;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateSiteRequest {
  name: string;
  zoneId: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateSiteRequest {
  id: number;
  name: string;
  zoneId: number;
  latitude?: number;
  longitude?: number;
}
