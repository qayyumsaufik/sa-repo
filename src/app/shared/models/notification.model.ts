export interface NotificationRule {
  id: number;
  name: string;
  triggerType: string;
  eventTypeId?: number;
  eventTypeName?: string;
  channel: string;
  recipientUserId: number;
  recipientUserName: string;
  isActive: boolean;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface CreateNotificationRuleRequest {
  name: string;
  triggerType: string;
  eventTypeId?: number;
  channel: string;
  recipientUserId: number;
  isActive?: boolean;
}

export interface UpdateNotificationRuleRequest {
  id: number;
  name: string;
  triggerType: string;
  eventTypeId?: number;
  channel: string;
  recipientUserId: number;
  isActive: boolean;
}
