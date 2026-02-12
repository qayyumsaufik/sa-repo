export interface EventType {
  id: number;
  name: string;
  description?: string;
  category?: string;
  severity: string;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateEventTypeRequest {
  name: string;
  description?: string;
  category?: string;
  severity?: string;
}

export interface UpdateEventTypeRequest {
  id: number;
  name: string;
  description?: string;
  category?: string;
  severity?: string;
}
