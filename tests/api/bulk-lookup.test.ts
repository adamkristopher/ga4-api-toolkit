/**
 * Bulk URL Lookup Tests
 *
 * TDD: RED phase - these tests should fail initially
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { MockBetaAnalyticsDataClient, createMockClient, mockBulkUrlResponse } from '../mocks/ga4-client.js';

// Mock the GA4 client module
vi.mock('@google-analytics/data', () => ({
  BetaAnalyticsDataClient: MockBetaAnalyticsDataClient,
}));

const testResultsDir = join(process.cwd(), 'results-test-bulk-lookup');

describe('Bulk URL Lookup', () => {
  beforeEach(() => {
    vi.resetModules();

    // Set test environment variables
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
    process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

    // Create test results directory
    if (!existsSync(testResultsDir)) {
      mkdirSync(testResultsDir, { recursive: true });
    }

    // Mock settings
    vi.doMock('../../src/config/settings.js', () => ({
      getSettings: () => ({
        propertyId: '123456789',
        clientEmail: 'test@project.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        defaultDateRange: '30d',
        resultsDir: testResultsDir,
        siteUrl: 'https://example.com',
      }),
      validateSettings: () => ({ valid: true, errors: [] }),
    }));

    // Mock client with bulk response
    const mockClient = createMockClient();
    mockClient.runReport.mockResolvedValue([mockBulkUrlResponse]);

    vi.doMock('../../src/core/client.js', () => ({
      getClient: () => mockClient,
      getPropertyId: () => 'properties/123456789',
      resetClient: vi.fn(),
    }));
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testResultsDir)) {
      rmSync(testResultsDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('normalizeUrls', () => {
    it('should add leading slash to URLs without one', async () => {
      // Arrange
      const urls = ['pricing', 'about', 'products'];

      // Act
      const { normalizeUrls } = await import('../../src/api/bulk-lookup.js');
      const result = normalizeUrls(urls);

      // Assert
      expect(result).toEqual(['/pricing', '/about', '/products']);
    });

    it('should trim whitespace from URLs', async () => {
      // Arrange
      const urls = [' /pricing ', '  /about  ', '/products '];

      // Act
      const { normalizeUrls } = await import('../../src/api/bulk-lookup.js');
      const result = normalizeUrls(urls);

      // Assert
      expect(result).toEqual(['/pricing', '/about', '/products']);
    });

    it('should preserve trailing slashes', async () => {
      // Arrange
      const urls = ['/blog/', '/docs/api/'];

      // Act
      const { normalizeUrls } = await import('../../src/api/bulk-lookup.js');
      const result = normalizeUrls(urls);

      // Assert
      expect(result).toEqual(['/blog/', '/docs/api/']);
    });

    it('should handle mixed URL formats', async () => {
      // Arrange
      const urls = ['pricing', ' /about ', '/products/'];

      // Act
      const { normalizeUrls } = await import('../../src/api/bulk-lookup.js');
      const result = normalizeUrls(urls);

      // Assert
      expect(result).toEqual(['/pricing', '/about', '/products/']);
    });

    it('should return empty array for empty input', async () => {
      // Arrange
      const urls: string[] = [];

      // Act
      const { normalizeUrls } = await import('../../src/api/bulk-lookup.js');
      const result = normalizeUrls(urls);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('buildUrlFilter', () => {
    it('should build filter for single URL', async () => {
      // Arrange
      const urls = ['/pricing'];

      // Act
      const { buildUrlFilter } = await import('../../src/api/bulk-lookup.js');
      const result = buildUrlFilter(urls);

      // Assert
      expect(result).toEqual({
        filter: {
          fieldName: 'pagePath',
          inListFilter: {
            values: ['/pricing'],
            caseSensitive: false,
          },
        },
      });
    });

    it('should build filter for multiple URLs', async () => {
      // Arrange
      const urls = ['/pricing', '/products', '/about'];

      // Act
      const { buildUrlFilter } = await import('../../src/api/bulk-lookup.js');
      const result = buildUrlFilter(urls);

      // Assert
      expect(result).toEqual({
        filter: {
          fieldName: 'pagePath',
          inListFilter: {
            values: ['/pricing', '/products', '/about'],
            caseSensitive: false,
          },
        },
      });
    });

    it('should return null for empty URL array', async () => {
      // Arrange
      const urls: string[] = [];

      // Act
      const { buildUrlFilter } = await import('../../src/api/bulk-lookup.js');
      const result = buildUrlFilter(urls);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getMetricsForUrls', () => {
    it('should return empty result for empty URL array', async () => {
      // Arrange
      const urls: string[] = [];

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      const result = await getMetricsForUrls(urls);

      // Assert
      expect(result).toEqual({
        rows: [],
        rowCount: 0,
      });
    });

    it('should call GA4 API with correct filter structure', async () => {
      // Arrange
      const urls = ['/blog', '/docs'];
      const mockClient = createMockClient();
      mockClient.runReport.mockResolvedValue([mockBulkUrlResponse]);

      vi.doMock('../../src/core/client.js', () => ({
        getClient: () => mockClient,
        getPropertyId: () => 'properties/123456789',
        resetClient: vi.fn(),
      }));

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls, { dateRange: '30d' });

      // Assert
      expect(mockClient.runReport).toHaveBeenCalledWith(
        expect.objectContaining({
          property: 'properties/123456789',
          dimensionFilter: {
            filter: {
              fieldName: 'pagePath',
              inListFilter: {
                values: ['/blog', '/docs'],
                caseSensitive: false,
              },
            },
          },
        })
      );
    });

    it('should return page metrics for matched URLs', async () => {
      // Arrange
      const urls = ['/pricing', '/about'];

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      const result = await getMetricsForUrls(urls);

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.rows!.length).toBeGreaterThan(0);
      expect(result.dimensionHeaders).toContainEqual({ name: 'pagePath' });
      expect(result.metricHeaders).toContainEqual({ name: 'screenPageViews' });
    });

    it('should save results to reports directory by default', async () => {
      // Arrange
      const urls = ['/pricing', '/about'];

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls);

      // Assert
      const reportsDir = join(testResultsDir, 'reports');
      expect(existsSync(reportsDir)).toBe(true);
      const files = readdirSync(reportsDir);
      expect(files.some(f => f.includes('bulk_url_lookup'))).toBe(true);
    });

    it('should not save results when save=false', async () => {
      // Arrange
      const urls = ['/pricing', '/about'];

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls, { save: false });

      // Assert
      const reportsDir = join(testResultsDir, 'reports');
      if (existsSync(reportsDir)) {
        const files = readdirSync(reportsDir);
        expect(files.some(f => f.includes('bulk_url_lookup'))).toBe(false);
      }
    });

    it('should use default metrics when not specified', async () => {
      // Arrange
      const urls = ['/pricing'];
      const mockClient = createMockClient();
      mockClient.runReport.mockResolvedValue([mockBulkUrlResponse]);

      vi.doMock('../../src/core/client.js', () => ({
        getClient: () => mockClient,
        getPropertyId: () => 'properties/123456789',
        resetClient: vi.fn(),
      }));

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls);

      // Assert
      expect(mockClient.runReport).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: expect.arrayContaining([
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
          ]),
        })
      );
    });

    it('should allow custom metrics', async () => {
      // Arrange
      const urls = ['/pricing'];
      const customMetrics = ['sessions', 'bounceRate'];
      const mockClient = createMockClient();
      mockClient.runReport.mockResolvedValue([mockBulkUrlResponse]);

      vi.doMock('../../src/core/client.js', () => ({
        getClient: () => mockClient,
        getPropertyId: () => 'properties/123456789',
        resetClient: vi.fn(),
      }));

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls, { metrics: customMetrics });

      // Assert
      expect(mockClient.runReport).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
        })
      );
    });

    it('should normalize URLs before making API call', async () => {
      // Arrange
      const urls = ['pricing', ' /about '];
      const mockClient = createMockClient();
      mockClient.runReport.mockResolvedValue([mockBulkUrlResponse]);

      vi.doMock('../../src/core/client.js', () => ({
        getClient: () => mockClient,
        getPropertyId: () => 'properties/123456789',
        resetClient: vi.fn(),
      }));

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls);

      // Assert
      expect(mockClient.runReport).toHaveBeenCalledWith(
        expect.objectContaining({
          dimensionFilter: {
            filter: {
              fieldName: 'pagePath',
              inListFilter: {
                values: ['/pricing', '/about'],
                caseSensitive: false,
              },
            },
          },
        })
      );
    });

    it('should support date range option', async () => {
      // Arrange
      const urls = ['/pricing'];
      const mockClient = createMockClient();
      mockClient.runReport.mockResolvedValue([mockBulkUrlResponse]);

      vi.doMock('../../src/core/client.js', () => ({
        getClient: () => mockClient,
        getPropertyId: () => 'properties/123456789',
        resetClient: vi.fn(),
      }));

      // Act
      const { getMetricsForUrls } = await import('../../src/api/bulk-lookup.js');
      await getMetricsForUrls(urls, { dateRange: '7d' });

      // Assert
      expect(mockClient.runReport).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        })
      );
    });
  });
});
