/**
 * Mock Search Console Client for testing
 */

import { vi } from 'vitest';

// Mock response for searchanalytics.query
export const mockSearchAnalyticsResponse = {
  rows: [
    {
      keys: ['how to use google analytics'],
      clicks: 150,
      impressions: 2500,
      ctr: 0.06,
      position: 4.2,
    },
    {
      keys: ['ga4 tutorial'],
      clicks: 120,
      impressions: 1800,
      ctr: 0.067,
      position: 3.5,
    },
    {
      keys: ['analytics dashboard'],
      clicks: 80,
      impressions: 1200,
      ctr: 0.067,
      position: 5.1,
    },
  ],
  responseAggregationType: 'byPage',
};

// Mock response for top pages query
export const mockTopPagesResponse = {
  rows: [
    {
      keys: ['https://example.com/blog/analytics-guide'],
      clicks: 500,
      impressions: 8000,
      ctr: 0.0625,
      position: 3.2,
    },
    {
      keys: ['https://example.com/'],
      clicks: 350,
      impressions: 5000,
      ctr: 0.07,
      position: 2.1,
    },
    {
      keys: ['https://example.com/pricing'],
      clicks: 200,
      impressions: 3000,
      ctr: 0.067,
      position: 4.5,
    },
  ],
  responseAggregationType: 'byPage',
};

// Mock response for device performance query
export const mockDevicePerformanceResponse = {
  rows: [
    {
      keys: ['MOBILE'],
      clicks: 600,
      impressions: 10000,
      ctr: 0.06,
      position: 4.5,
    },
    {
      keys: ['DESKTOP'],
      clicks: 400,
      impressions: 5000,
      ctr: 0.08,
      position: 3.2,
    },
    {
      keys: ['TABLET'],
      clicks: 50,
      impressions: 800,
      ctr: 0.0625,
      position: 5.0,
    },
  ],
  responseAggregationType: 'byProperty',
};

// Mock response for country performance query
export const mockCountryPerformanceResponse = {
  rows: [
    {
      keys: ['USA'],
      clicks: 800,
      impressions: 12000,
      ctr: 0.067,
      position: 3.5,
    },
    {
      keys: ['GBR'],
      clicks: 200,
      impressions: 3000,
      ctr: 0.067,
      position: 4.2,
    },
    {
      keys: ['CAN'],
      clicks: 100,
      impressions: 1500,
      ctr: 0.067,
      position: 4.8,
    },
  ],
  responseAggregationType: 'byProperty',
};

// Mock response for search appearance query
export const mockSearchAppearanceResponse = {
  rows: [
    {
      keys: ['RICH_RESULT'],
      clicks: 150,
      impressions: 2000,
      ctr: 0.075,
      position: 2.5,
    },
    {
      keys: ['AMP_ARTICLE'],
      clicks: 50,
      impressions: 800,
      ctr: 0.0625,
      position: 3.0,
    },
  ],
  responseAggregationType: 'byProperty',
};

// Create mock searchconsole client
export const createMockSearchConsoleClient = () => ({
  searchanalytics: {
    query: vi.fn().mockResolvedValue({ data: mockSearchAnalyticsResponse }),
  },
  sitemaps: {
    list: vi.fn().mockResolvedValue({ data: { sitemap: [] } }),
    get: vi.fn().mockResolvedValue({ data: {} }),
    submit: vi.fn().mockResolvedValue({ data: {} }),
  },
  sites: {
    list: vi.fn().mockResolvedValue({ data: { siteEntry: [] } }),
    get: vi.fn().mockResolvedValue({ data: {} }),
  },
});

// Mock searchconsole constructor
export const MockSearchConsole = vi.fn().mockImplementation(() => createMockSearchConsoleClient());
