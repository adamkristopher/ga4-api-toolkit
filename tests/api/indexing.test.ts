import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  mockUrlNotificationResponse,
  mockUrlRemovalResponse,
  mockUrlInspectionResponse,
  mockUrlInspectionNotIndexedResponse,
  createMockIndexingClient,
  createMockUrlInspectionClient,
} from '../mocks/indexing-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testResultsDir = join(__dirname, '..', '..', 'results-test-indexing');

describe('Indexing API', () => {
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

    // Mock the Indexing and Search Console clients
    vi.doMock('../../src/core/client.js', () => ({
      getClient: vi.fn(),
      getPropertyId: () => 'properties/123456789',
      getSearchConsoleClient: () => createMockUrlInspectionClient(),
      getIndexingClient: () => createMockIndexingClient(),
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

  describe('requestIndexing', () => {
    it('should request indexing for a single URL', async () => {
      // Arrange
      const url = 'https://example.com/updated-page';

      // Act
      const { requestIndexing } = await import('../../src/api/indexing.js');
      const result = await requestIndexing(url);

      // Assert
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    });

    it('should return notification metadata with timestamp', async () => {
      // Arrange
      const url = 'https://example.com/updated-page';

      // Act
      const { requestIndexing } = await import('../../src/api/indexing.js');
      const result = await requestIndexing(url);

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('URL_UPDATED');
    });

    it('should save results to indexing category by default', async () => {
      // Arrange
      const url = 'https://example.com/updated-page';

      // Act
      const { requestIndexing } = await import('../../src/api/indexing.js');
      await requestIndexing(url);

      // Assert
      const indexingDir = join(testResultsDir, 'indexing');
      expect(existsSync(indexingDir)).toBe(true);
    });

    it('should allow disabling auto-save', async () => {
      // Arrange
      const url = 'https://example.com/updated-page';
      const indexingDir = join(testResultsDir, 'indexing');

      // Clear any existing directory
      if (existsSync(indexingDir)) {
        rmSync(indexingDir, { recursive: true, force: true });
      }

      // Act
      const { requestIndexing } = await import('../../src/api/indexing.js');
      await requestIndexing(url, { save: false });

      // Assert - no files should be created
      expect(existsSync(indexingDir)).toBe(false);
    });
  });

  describe('requestIndexingBatch', () => {
    it('should request indexing for multiple URLs', async () => {
      // Arrange
      const urls = [
        'https://example.com/page-1',
        'https://example.com/page-2',
        'https://example.com/page-3',
      ];

      // Act
      const { requestIndexingBatch } = await import('../../src/api/indexing.js');
      const results = await requestIndexingBatch(urls);

      // Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(urls.length);
    });

    it('should return results for each URL', async () => {
      // Arrange
      const urls = [
        'https://example.com/page-1',
        'https://example.com/page-2',
      ];

      // Act
      const { requestIndexingBatch } = await import('../../src/api/indexing.js');
      const results = await requestIndexingBatch(urls);

      // Assert
      expect(results.length).toBe(2);
      results.forEach((result) => {
        expect(result).toHaveProperty('url');
      });
    });
  });

  describe('removeFromIndex', () => {
    it('should request URL removal from index', async () => {
      // Arrange
      const url = 'https://example.com/removed-page';

      // Act
      const { removeFromIndex } = await import('../../src/api/indexing.js');
      const result = await removeFromIndex(url);

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('URL_DELETED');
    });
  });

  describe('inspectUrl', () => {
    it('should inspect a URL and return index status', async () => {
      // Arrange
      const url = 'https://example.com/updated-page';

      // Act
      const { inspectUrl } = await import('../../src/api/indexing.js');
      const result = await inspectUrl(url);

      // Assert
      expect(result).toBeDefined();
      expect(result.indexStatus).toBeDefined();
    });

    it('should return verdict PASS for indexed URLs', async () => {
      // Arrange
      const url = 'https://example.com/indexed-page';

      // Act
      const { inspectUrl } = await import('../../src/api/indexing.js');
      const result = await inspectUrl(url);

      // Assert
      expect(result).toBeDefined();
      expect(result.indexStatus.verdict).toBe('PASS');
    });

    it('should return crawl information', async () => {
      // Arrange
      const url = 'https://example.com/indexed-page';

      // Act
      const { inspectUrl } = await import('../../src/api/indexing.js');
      const result = await inspectUrl(url);

      // Assert
      expect(result.indexStatus).toBeDefined();
      expect(result.indexStatus.coverageState).toBeDefined();
    });

    it('should save inspection results', async () => {
      // Arrange
      const url = 'https://example.com/inspected-page';

      // Act
      const { inspectUrl } = await import('../../src/api/indexing.js');
      await inspectUrl(url);

      // Assert
      const indexingDir = join(testResultsDir, 'indexing');
      expect(existsSync(indexingDir)).toBe(true);
    });
  });
});
