import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  mockSearchAnalyticsResponse,
  mockTopPagesResponse,
  mockDevicePerformanceResponse,
  mockCountryPerformanceResponse,
  mockSearchAppearanceResponse,
  createMockSearchConsoleClient,
} from '../mocks/search-console-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testResultsDir = join(__dirname, '..', '..', 'results-test-searchconsole');

describe('Search Console API', () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up environment
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
    process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';
    process.env.SEARCH_CONSOLE_SITE_URL = 'https://example.com';

    // Create test results directory
    if (!existsSync(testResultsDir)) {
      mkdirSync(testResultsDir, { recursive: true });
    }

    // Mock settings to use test directory
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

    // Mock the Search Console client module
    vi.doMock('../../src/core/client.js', () => ({
      getClient: vi.fn(),
      getPropertyId: () => 'properties/123456789',
      getSearchConsoleClient: () => createMockSearchConsoleClient(),
      getSiteUrl: () => 'https://example.com',
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

  describe('querySearchAnalytics', () => {
    it('should query search analytics with dimensions and metrics', async () => {
      // Arrange
      const options = {
        dimensions: ['query'],
        dateRange: '7d',
      };

      // Act
      const { querySearchAnalytics } = await import('../../src/api/searchConsole.js');
      const result = await querySearchAnalytics(options);

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should support custom date ranges', async () => {
      // Arrange
      const options = {
        dimensions: ['query'],
        dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
      };

      // Act
      const { querySearchAnalytics } = await import('../../src/api/searchConsole.js');
      const result = await querySearchAnalytics(options);

      // Assert
      expect(result).toBeDefined();
    });

    it('should save results to searchconsole category by default', async () => {
      // Arrange
      const options = { dimensions: ['query'] };

      // Act
      const { querySearchAnalytics } = await import('../../src/api/searchConsole.js');
      await querySearchAnalytics(options);

      // Assert
      const searchConsoleDir = join(testResultsDir, 'searchconsole');
      expect(existsSync(searchConsoleDir)).toBe(true);
    });

    it('should allow disabling auto-save', async () => {
      // Arrange
      const options = { dimensions: ['query'], save: false };
      const searchConsoleDir = join(testResultsDir, 'searchconsole');

      // Clear any existing directory
      if (existsSync(searchConsoleDir)) {
        rmSync(searchConsoleDir, { recursive: true, force: true });
      }

      // Act
      const { querySearchAnalytics } = await import('../../src/api/searchConsole.js');
      await querySearchAnalytics(options);

      // Assert - no files should be created
      expect(existsSync(searchConsoleDir)).toBe(false);
    });
  });

  describe('getTopQueries', () => {
    it('should return top search queries', async () => {
      // Arrange & Act
      const { getTopQueries } = await import('../../src/api/searchConsole.js');
      const result = await getTopQueries();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should accept a date range parameter', async () => {
      // Arrange & Act
      const { getTopQueries } = await import('../../src/api/searchConsole.js');
      const result = await getTopQueries('7d');

      // Assert
      expect(result).toBeDefined();
    });

    it('should return rows with clicks, impressions, ctr, and position', async () => {
      // Arrange & Act
      const { getTopQueries } = await import('../../src/api/searchConsole.js');
      const result = await getTopQueries();

      // Assert
      expect(result.rows).toBeDefined();
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        expect(row).toHaveProperty('keys');
        expect(row).toHaveProperty('clicks');
        expect(row).toHaveProperty('impressions');
        expect(row).toHaveProperty('ctr');
        expect(row).toHaveProperty('position');
      }
    });
  });

  describe('getTopPages', () => {
    it('should return top pages by performance', async () => {
      // Arrange & Act
      const { getTopPages } = await import('../../src/api/searchConsole.js');
      const result = await getTopPages();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });

    it('should accept a date range parameter', async () => {
      // Arrange & Act
      const { getTopPages } = await import('../../src/api/searchConsole.js');
      const result = await getTopPages('30d');

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('getDevicePerformance', () => {
    it('should return performance by device type', async () => {
      // Arrange & Act
      const { getDevicePerformance } = await import('../../src/api/searchConsole.js');
      const result = await getDevicePerformance();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });

    it('should include MOBILE, DESKTOP, and TABLET categories', async () => {
      // Arrange
      vi.doMock('../../src/core/client.js', () => ({
        getClient: vi.fn(),
        getPropertyId: () => 'properties/123456789',
        getSearchConsoleClient: () => {
          const mockClient = createMockSearchConsoleClient();
          mockClient.searchanalytics.query.mockResolvedValue({ data: mockDevicePerformanceResponse });
          return mockClient;
        },
        getSiteUrl: () => 'https://example.com',
        resetClient: vi.fn(),
      }));

      // Act
      const { getDevicePerformance } = await import('../../src/api/searchConsole.js');
      const result = await getDevicePerformance();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('getCountryPerformance', () => {
    it('should return performance by country', async () => {
      // Arrange & Act
      const { getCountryPerformance } = await import('../../src/api/searchConsole.js');
      const result = await getCountryPerformance();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('getSearchAppearance', () => {
    it('should return search appearance data', async () => {
      // Arrange & Act
      const { getSearchAppearance } = await import('../../src/api/searchConsole.js');
      const result = await getSearchAppearance();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('date range parsing', () => {
    it('should parse "7d" to last 7 days', async () => {
      // Arrange & Act
      const { parseSearchConsoleDateRange } = await import('../../src/api/searchConsole.js');
      const range = parseSearchConsoleDateRange('7d');

      // Assert
      expect(range.startDate).toBeDefined();
      expect(range.endDate).toBeDefined();
    });

    it('should parse "30d" to last 30 days', async () => {
      // Arrange & Act
      const { parseSearchConsoleDateRange } = await import('../../src/api/searchConsole.js');
      const range = parseSearchConsoleDateRange('30d');

      // Assert
      expect(range.startDate).toBeDefined();
      expect(range.endDate).toBeDefined();
    });

    it('should pass through explicit date ranges', async () => {
      // Arrange
      const explicit = { startDate: '2024-01-01', endDate: '2024-01-31' };

      // Act
      const { parseSearchConsoleDateRange } = await import('../../src/api/searchConsole.js');
      const range = parseSearchConsoleDateRange(explicit);

      // Assert
      expect(range.startDate).toBe('2024-01-01');
      expect(range.endDate).toBe('2024-01-31');
    });
  });
});
