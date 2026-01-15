/**
 * Mock GA4 Client for testing
 */

import { vi } from 'vitest';

// Mock response for runReport
export const mockRunReportResponse = {
  dimensionHeaders: [{ name: 'date' }, { name: 'country' }],
  metricHeaders: [{ name: 'activeUsers' }, { name: 'sessions' }],
  rows: [
    {
      dimensionValues: [{ value: '20240101' }, { value: 'United States' }],
      metricValues: [{ value: '1000' }, { value: '1500' }],
    },
    {
      dimensionValues: [{ value: '20240102' }, { value: 'Canada' }],
      metricValues: [{ value: '500' }, { value: '750' }],
    },
  ],
  rowCount: 2,
  metadata: {
    currencyCode: 'USD',
    timeZone: 'America/Los_Angeles',
  },
};

// Mock response for runRealtimeReport
export const mockRealtimeReportResponse = {
  dimensionHeaders: [{ name: 'unifiedScreenName' }],
  metricHeaders: [{ name: 'activeUsers' }],
  rows: [
    {
      dimensionValues: [{ value: '/home' }],
      metricValues: [{ value: '25' }],
    },
  ],
  rowCount: 1,
};

// Mock response for getMetadata
export const mockMetadataResponse = {
  name: 'properties/123456789/metadata',
  dimensions: [
    { apiName: 'date', uiName: 'Date', description: 'The date of the event.' },
    { apiName: 'country', uiName: 'Country', description: 'The country of the user.' },
  ],
  metrics: [
    { apiName: 'activeUsers', uiName: 'Active Users', description: 'The number of active users.' },
    { apiName: 'sessions', uiName: 'Sessions', description: 'The number of sessions.' },
  ],
};

// Mock response for bulk URL lookup
export const mockBulkUrlResponse = {
  dimensionHeaders: [{ name: 'pagePath' }, { name: 'pageTitle' }],
  metricHeaders: [
    { name: 'screenPageViews' },
    { name: 'activeUsers' },
    { name: 'averageSessionDuration' },
  ],
  rows: [
    {
      dimensionValues: [{ value: '/pricing' }, { value: 'Pricing' }],
      metricValues: [{ value: '500' }, { value: '250' }, { value: '120' }],
    },
    {
      dimensionValues: [{ value: '/about' }, { value: 'About Us' }],
      metricValues: [{ value: '300' }, { value: '180' }, { value: '90' }],
    },
  ],
  rowCount: 2,
  metadata: {
    currencyCode: 'USD',
    timeZone: 'America/Los_Angeles',
  },
};

// Create mock client class
export const createMockClient = () => ({
  runReport: vi.fn().mockResolvedValue([mockRunReportResponse]),
  runRealtimeReport: vi.fn().mockResolvedValue([mockRealtimeReportResponse]),
  getMetadata: vi.fn().mockResolvedValue([mockMetadataResponse]),
  batchRunReports: vi.fn().mockResolvedValue([{ reports: [mockRunReportResponse] }]),
});

// Mock BetaAnalyticsDataClient constructor
export const MockBetaAnalyticsDataClient = vi.fn().mockImplementation(() => createMockClient());
