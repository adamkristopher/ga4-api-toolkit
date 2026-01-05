import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testResultsDir = join(__dirname, '..', '..', 'results-test-storage');

describe('Storage', () => {
  beforeEach(() => {
    // Create test results directory
    if (!existsSync(testResultsDir)) {
      mkdirSync(testResultsDir, { recursive: true });
    }
    // Reset modules
    vi.resetModules();
    // Mock the settings to use test directory
    vi.doMock('../../src/config/settings.js', () => ({
      getSettings: () => ({
        propertyId: 'test-property',
        clientEmail: 'test@test.com',
        privateKey: 'test-key',
        defaultDateRange: '30d',
        resultsDir: testResultsDir,
      }),
    }));
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testResultsDir)) {
      rmSync(testResultsDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('saveResult', () => {
    it('should save data to a JSON file with timestamp in filename', async () => {
      // Arrange
      const data = { sessions: 100, users: 50 };
      const category = 'reports';
      const operation = 'page_views';

      // Act
      const { saveResult } = await import('../../src/core/storage.js');
      const filepath = saveResult(data, category, operation);

      // Assert
      expect(filepath).toMatch(/reports\/\d{8}_\d{6}__page_views.*\.json$/);
      expect(existsSync(filepath)).toBe(true);
    });

    it('should wrap data with metadata', async () => {
      // Arrange
      const data = { sessions: 100 };
      const category = 'reports';
      const operation = 'traffic_sources';

      // Act
      const { saveResult, loadResult } = await import('../../src/core/storage.js');
      const filepath = saveResult(data, category, operation);
      const saved = loadResult(filepath);

      // Assert
      expect(saved).toHaveProperty('metadata');
      expect(saved).toHaveProperty('data');
      expect(saved.metadata.category).toBe('reports');
      expect(saved.metadata.operation).toBe('traffic_sources');
      expect(saved.metadata).toHaveProperty('savedAt');
      expect(saved.data).toEqual({ sessions: 100 });
    });

    it('should include extra info in filename when provided', async () => {
      // Arrange
      const data = { pageViews: 500 };
      const category = 'reports';
      const operation = 'page_views';
      const extraInfo = '7d';

      // Act
      const { saveResult } = await import('../../src/core/storage.js');
      const filepath = saveResult(data, category, operation, extraInfo);

      // Assert
      expect(filepath).toContain('__7d');
    });

    it('should create category subdirectory if it does not exist', async () => {
      // Arrange
      const data = { activeUsers: 10 };
      const category = 'realtime';
      const operation = 'active_users';

      // Act
      const { saveResult } = await import('../../src/core/storage.js');
      const filepath = saveResult(data, category, operation);

      // Assert
      expect(existsSync(join(testResultsDir, 'realtime'))).toBe(true);
      expect(existsSync(filepath)).toBe(true);
    });

    it('should include property ID in metadata', async () => {
      // Arrange
      const data = { sessions: 100 };

      // Act
      const { saveResult, loadResult } = await import('../../src/core/storage.js');
      const filepath = saveResult(data, 'reports', 'overview');
      const saved = loadResult(filepath);

      // Assert
      expect(saved.metadata.propertyId).toBe('test-property');
    });
  });

  describe('loadResult', () => {
    it('should load and parse a saved JSON file', async () => {
      // Arrange
      const data = { revenue: 1000.50 };
      const { saveResult, loadResult } = await import('../../src/core/storage.js');
      const filepath = saveResult(data, 'reports', 'revenue');

      // Act
      const loaded = loadResult(filepath);

      // Assert
      expect(loaded.data).toEqual({ revenue: 1000.50 });
    });

    it('should return null for non-existent file', async () => {
      // Arrange
      const { loadResult } = await import('../../src/core/storage.js');

      // Act
      const result = loadResult('/non/existent/file.json');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('listResults', () => {
    it('should return empty array when no results exist', async () => {
      // Arrange
      const { listResults } = await import('../../src/core/storage.js');

      // Act
      const results = listResults('reports');

      // Assert
      expect(results).toEqual([]);
    });

    it('should return list of result files for a category', async () => {
      // Arrange
      const { saveResult, listResults } = await import('../../src/core/storage.js');
      saveResult({ a: 1 }, 'reports', 'test1');
      saveResult({ b: 2 }, 'reports', 'test2');
      saveResult({ c: 3 }, 'realtime', 'other');

      // Act
      const results = listResults('reports');

      // Assert
      expect(results).toHaveLength(2);
      expect(results.every(r => r.includes('reports'))).toBe(true);
    });

    it('should respect limit parameter', async () => {
      // Arrange
      const { saveResult, listResults } = await import('../../src/core/storage.js');
      saveResult({ a: 1 }, 'reports', 'test1');
      saveResult({ b: 2 }, 'reports', 'test2');
      saveResult({ c: 3 }, 'reports', 'test3');

      // Act
      const results = listResults('reports', 2);

      // Assert
      expect(results).toHaveLength(2);
    });

    it('should return results sorted by date descending (newest first)', async () => {
      // Arrange
      const { saveResult, listResults } = await import('../../src/core/storage.js');
      saveResult({ a: 1 }, 'reports', 'first');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      saveResult({ b: 2 }, 'reports', 'second');

      // Act
      const results = listResults('reports');

      // Assert
      expect(results[0]).toContain('second');
      expect(results[1]).toContain('first');
    });
  });

  describe('getLatestResult', () => {
    it('should return the most recent result for a category', async () => {
      // Arrange
      const { saveResult, getLatestResult } = await import('../../src/core/storage.js');
      saveResult({ old: true }, 'reports', 'data');
      await new Promise(resolve => setTimeout(resolve, 10));
      saveResult({ new: true }, 'reports', 'data');

      // Act
      const latest = getLatestResult('reports');

      // Assert
      expect(latest).not.toBeNull();
      expect(latest?.data).toEqual({ new: true });
    });

    it('should filter by operation when provided', async () => {
      // Arrange
      const { saveResult, getLatestResult } = await import('../../src/core/storage.js');
      saveResult({ traffic: true }, 'reports', 'traffic_sources');
      await new Promise(resolve => setTimeout(resolve, 10));
      saveResult({ pages: true }, 'reports', 'page_views');

      // Act
      const latest = getLatestResult('reports', 'traffic_sources');

      // Assert
      expect(latest).not.toBeNull();
      expect(latest?.data).toEqual({ traffic: true });
    });

    it('should return null when no results exist', async () => {
      // Arrange
      const { getLatestResult } = await import('../../src/core/storage.js');

      // Act
      const result = getLatestResult('reports');

      // Assert
      expect(result).toBeNull();
    });
  });
});
