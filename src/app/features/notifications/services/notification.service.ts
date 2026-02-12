import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import {
  NotificationRule,
  CreateNotificationRuleRequest,
  UpdateNotificationRuleRequest
} from '../../../shared/models/notification.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseCachedService<NotificationRule> {
  private readonly endpoint = 'NotificationRule';

  getNotificationRules(params: {
    nameSearch?: string;
    triggerType?: string;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  } = {}): Observable<PagedResult<NotificationRule>> {
    const { nameSearch, triggerType, isActive, pageNumber, pageSize } = params;
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (nameSearch != null && nameSearch !== '') queryParams['nameSearch'] = nameSearch;
    if (triggerType != null && triggerType !== '') queryParams['triggerType'] = triggerType;
    if (isActive != null) queryParams['isActive'] = isActive;
    return this.getCached(this.endpoint, queryParams, pageNumber, pageSize);
  }

  getNotificationRuleById(id: number): Observable<NotificationRule> {
    return this.getById(this.endpoint, id);
  }

  createNotificationRule(request: CreateNotificationRuleRequest): Observable<NotificationRule> {
    return this.create(this.endpoint, {
      ...request,
      isActive: request.isActive ?? true
    });
  }

  updateNotificationRule(request: UpdateNotificationRuleRequest): Observable<NotificationRule> {
    return this.update(this.endpoint, request.id, request);
  }

  deleteNotificationRule(id: number): Observable<void> {
    return this.delete(this.endpoint, id);
  }
}
