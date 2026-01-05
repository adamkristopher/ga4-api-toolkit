import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createMockClient } from '../mocks/ga4-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testResultsDir = join(__dirname, '..', '..', 'results-test-realtime');

describe('Realtime API', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
    process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

    if (!existsSync(testResultsDir)) {
      mkdirSync(testResultsDir, { recursive: true });
    }

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

    vi.doMock('../../src/core/client.js', () => ({
      getClient: () => createMockClient(),
      getPropertyId: () => 'properties/123456789',
      resetClient: vi.fn(),
    }));
  });

  afterEach(() => {
    if (existsSync(testResultsDir)) {
      rmSync(testResultsDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('getActiveUsers', () => {
    it('should return current active users', async () => {
      // Arrange & Act
      const { getActiveUsers } = await import('../../src/api/realtime.js');
      const result = await getActiveUsers();

      // Assert
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });

    it('should save results to realtime category', async () => {
      // Arrange & Act
      const { getActiveUsers } = await import('../../src/api/realtime.js');
      await getActiveUsers();

      // Assert
      const realtimeDir = join(testResultsDir, 'realtime');
      expect(existsSync(realtimeDir)).toBe(true);
    });
  });

  describe('getRealtimeEvents', () => {
    it('should return current event data', async () => {
      // Arrange & Act
      const { getRealtimeEvents } = await import('../../src/api/realtime.js');
      const result = await getRealtimeEvents();

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('getRealtimePages', () => {
    it('should return currently viewed pages', async () => {
      // Arrange & Act
      const { getRealtimePages } = await import('../../src/api/realtime.js');
      const result = await getRealtimePages();

      // Assert
      expect(result).toBeDefined();
    });
  });
});
