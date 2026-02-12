/**
 * Default Environment (Local)
 * This file is used as a fallback and for local development
 * For specific environments, use:
 * - environment.local.ts (local development)
 * - environment.dev.ts (development server)
 * - environment.prod.ts (production)
 * 
 * NOTE: When running `ng serve`, make sure to use:
 * - `ng serve --configuration=development` (uses environment.local.ts)
 * - Or `ng serve --configuration=local` (uses environment.local.ts)
 */
export const environment = {
  production: false,
  environment: 'local',
  apiUrl: 'https://localhost:7000/api/v1',
  auth0: {
    // Using local development values as default
    // These will be replaced by environment.local.ts when using --configuration=development
    domain: 'site-shield.us.auth0.com',
    clientId: '2WvfIPxIVxRydjtorhJfaOP3gp2gpxmb',
    audience: 'https://api.siteshield.com',
    redirectUri: window.location.origin
  },
  enableLogging: true,
  enableDebugMode: true
};
