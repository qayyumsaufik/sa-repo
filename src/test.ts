import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: true }
  }
);

import './app/app.component.spec';
import './app/core/guards/auth.guard.spec';
import './app/core/interceptors/auth.interceptor.spec';
import './app/core/interceptors/retry.interceptor.spec';
import './app/core/interceptors/tenant.interceptor.spec';
import './app/core/services/api.service.spec';
import './app/core/services/auth.service.spec';
import './app/core/services/error.service.spec';
import './app/core/services/loading.service.spec';
import './app/core/services/logger.service.spec';
import './app/core/services/permission.service.spec';
import './app/features/auth/components/login/login.component.spec';
import './app/features/clients/components/client-list/client-list.component.spec';
import './app/features/clients/services/client.service.spec';
import './app/features/dashboard/components/amps-chart/amps-chart.component.spec';
import './app/features/dashboard/components/category-breakdown-chart/category-breakdown-chart.component.spec';
import './app/features/dashboard/components/dashboard/dashboard.component.spec';
import './app/features/dashboard/components/events-chart/events-chart.component.spec';
import './app/features/dashboard/components/level-chart/level-chart.component.spec';
import './app/features/dashboard/components/site-detail/site-detail.component.spec';
import './app/features/dashboard/components/state-transition-chart/state-transition-chart.component.spec';
import './app/features/dashboard/services/dashboard.service.spec';
import './app/features/devices/components/device-list/device-list.component.spec';
import './app/features/devices/services/device.service.spec';
import './app/features/events/components/event-list/event-list.component.spec';
import './app/features/events/services/event.service.spec';
import './app/features/eventtypes/components/eventtype-list/eventtype-list.component.spec';
import './app/features/eventtypes/services/eventtype.service.spec';
import './app/features/maintenance/components/maintenance-list/maintenance-list.component.spec';
import './app/features/maintenance/services/maintenance.service.spec';
import './app/features/notifications/components/notification-list/notification-list.component.spec';
import './app/features/readings/components/reading-list/reading-list.component.spec';
import './app/features/readings/services/reading.service.spec';
import './app/features/regtypes/components/regtype-list/regtype-list.component.spec';
import './app/features/regtypes/services/regtype.service.spec';
import './app/features/sensors/components/sensor-list/sensor-list.component.spec';
import './app/features/sensors/services/sensor.service.spec';
import './app/features/settings/components/settings-page/settings-page.component.spec';
import './app/features/sites/components/site-list/site-list.component.spec';
import './app/features/sites/services/site.service.spec';
import './app/features/support/components/support-page/support-page.component.spec';
import './app/features/user/components/user-profile/user-profile.component.spec';
import './app/features/user/services/user-profile.service.spec';
import './app/features/users/components/user-list/user-list.component.spec';
import './app/features/zones/components/zone-list/zone-list.component.spec';
import './app/features/zones/services/zone.service.spec';
import './app/layout/header/header.component.spec';
import './app/layout/layout.component.spec';
import './app/layout/services/sidebar.service.spec';
import './app/layout/sidebar/sidebar.component.spec';
import './app/shared/components/chart/chart.component.spec';
import './app/shared/components/data-table/data-table.component.spec';
import './app/shared/components/error-message/error-message.component.spec';
import './app/shared/components/loading-spinner/loading-spinner.component.spec';
import './app/shared/components/modal/modal.component.spec';
import './app/shared/directives/click-outside.directive.spec';
import './app/shared/services/validation.service.spec';
