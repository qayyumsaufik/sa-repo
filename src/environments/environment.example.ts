/**
 * Environment Configuration Example
 * 
 * Copy this file to create your environment files:
 * - environment.local.ts (for local development)
 * - environment.dev.ts (for development server)
 * - environment.prod.ts (for production)
 * 
 * DO NOT commit actual environment files with real credentials!
 */

export const environment = {
  production: false,
  environment: 'example',
  apiUrl: 'YOUR_API_URL_HERE', // e.g., 'https://localhost:7000/api/v1'
  auth0: {
    domain: 'YOUR_AUTH0_DOMAIN', // e.g., 'your-tenant.auth0.com'
    clientId: 'YOUR_AUTH0_CLIENT_ID', // Your Auth0 application client ID
    audience: 'YOUR_AUTH0_AUDIENCE', // Your Auth0 API audience
    redirectUri: 'YOUR_REDIRECT_URI' // e.g., window.location.origin for local
  },
  enableLogging: true, // Set to false in production
  enableDebugMode: true // Set to false in production
};
