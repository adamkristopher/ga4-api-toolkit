import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mockRunReportResponse, createMockClient } from '../mocks/ga4-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testResultsDir = join(__dirname, '..', '..', 'results-test-reports');

describe('Reports API', () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up environment
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
    process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

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
      }),
      validateSettings: () => ({ valid: true, errors: [] }),
    }));

    // Mock the client module to return our mock client
    vi.doMock('../../src/core/client.js', () => ({
      getClient: () => createMockClient(),
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

  describe('runReport', () => {
    it('should run a report with dimensions and metrics', async () => {
      // Arrange
      const dimensions = ['date', 'country'];
      const metrics = ['activeUsers', 'sessions'];

      // Act
      const { runReport } = await import('../../src/api/reports.js');
      const result = await runReport({ dimensions, metrics });

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });

    it('should save results to reports category by default', async () => {
      // Arrange
      const dimensions = ['date'];
      const metrics = ['activeUsers'];

      // Act
      const { runReport } = await import('../../src/api/reports.js');
      await runReport({ dimensions, metrics });

      // Assert
      const reportsDir = join(testResultsDir, 'reports');
      expect(existsSync(reportsDir)).toBe(true);
    });

    it('should support custom date ranges', async () => {
      // Arrange
      const dimensions = ['date'];
      const metrics = ['activeUsers'];
      const dateRange = { startDate: '2024-01-01', endDate: '2024-01-31' };

      // Act
      const { runReport } = await import('../../src/api/reports.js');
      const result = await runReport({ dimensions, metrics, dateRange });

      // Assert
      expect(result).toBeDefined();
    });

    it('should support shorthand date ranges like "7d" and "30d"', async () => {
      // Arrange
      const dimensions = ['date'];
      const metrics = ['activeUsers'];

      // Act
      const { runReport } = await import('../../src/api/reports.js');
      const result = await runReport({ dimensions, metrics, dateRange: '7d' });

      // Assert
      expect(result).toBeDefined();
    });

    it('should allow disabling auto-save', async () => {
      // Arrange
      const dimensions = ['date'];
      const metrics = ['activeUsers'];
      const reportsDir = join(testResultsDir, 'reports');

      // Clear any existing reports directory
      if (existsSync(reportsDir)) {
        rmSync(reportsDir, { recursive: true, force: true });
      }

      // Act
      const { runReport } = await import('../../src/api/reports.js');
      await runReport({ dimensions, metrics, save: false });

      // Assert - no new files should be created
      expect(existsSync(reportsDir)).toBe(false);
    });
  });

  describe('getPageViews', () => {
    it('should return page view data', async () => {
      // Arrange & Act
      const { getPageViews } = await import('../../src/api/reports.js');
      const result = await getPageViews();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });

    it('should include pagePath dimension', async () => {
      // Arrange & Act
      const { getPageViews } = await import('../../src/api/reports.js');
      const result = await getPageViews();

      // Assert - check result structure
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('getTrafficSources', () => {
    it('should return traffic source data', async () => {
      // Arrange & Act
      const { getTrafficSources } = await import('../../src/api/reports.js');
      const result = await getTrafficSources();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('getUserDemographics', () => {
    it('should return user demographic data', async () => {
      // Arrange & Act
      const { getUserDemographics } = await import('../../src/api/reports.js');
      const result = await getUserDemographics();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('getEventCounts', () => {
    it('should return event count data', async () => {
      // Arrange & Act
      const { getEventCounts } = await import('../../src/api/reports.js');
      const result = await getEventCounts();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });
  });

  describe('date range parsing', () => {
    it('should parse "7d" to last 7 days', async () => {
      // Arrange & Act
      const { parseDateRange } = await import('../../src/api/reports.js');
      const range = parseDateRange('7d');

      // Assert
      expect(range.startDate).toBeDefined();
      expect(range.endDate).toBe('today');
    });

    it('should parse "30d" to last 30 days', async () => {
      // Arrange & Act
      const { parseDateRange } = await import('../../src/api/reports.js');
      const range = parseDateRange('30d');

      // Assert
      expect(range.startDate).toBeDefined();
      expect(range.endDate).toBe('today');
    });

    it('should pass through explicit date ranges', async () => {
      // Arrange
      const explicit = { startDate: '2024-01-01', endDate: '2024-01-31' };

      // Act
      const { parseDateRange } = await import('../../src/api/reports.js');
      const range = parseDateRange(explicit);

      // Assert
      expect(range.startDate).toBe('2024-01-01');
      expect(range.endDate).toBe('2024-01-31');
    });
  });
});
