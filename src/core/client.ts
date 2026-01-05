/**
 * GA4 API Client - Singleton wrapper for BetaAnalyticsDataClient
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getSettings, validateSettings } from '../config/settings.js';

// Singleton client instance
let clientInstance: BetaAnalyticsDataClient | null = null;

/**
 * Get the GA4 Analytics Data API client (singleton)
 *
 * @returns The BetaAnalyticsDataClient instance
 * @throws Error if credentials are invalid
 */
export function getClient(): BetaAnalyticsDataClient {
  if (clientInstance) {
    return clientInstance;
  }

  const validation = validateSettings();
  if (!validation.valid) {
    throw new Error(`Invalid GA4 credentials: ${validation.errors.join(', ')}`);
  }

  const settings = getSettings();

  clientInstance = new BetaAnalyticsDataClient({
    credentials: {
      client_email: settings.clientEmail,
      private_key: settings.privateKey,
    },
  });

  return clientInstance;
}

/**
 * Get the GA4 property ID formatted for API calls
 *
 * @returns Property ID with "properties/" prefix
 */
export function getPropertyId(): string {
  const settings = getSettings();
  return `properties/${settings.propertyId}`;
}

/**
 * Reset the client singleton (useful for testing)
 */
export function resetClient(): void {
  clientInstance = null;
}
