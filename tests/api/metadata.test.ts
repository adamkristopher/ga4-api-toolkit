import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createMockClient, mockMetadataResponse } from '../mocks/ga4-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testResultsDir = join(__dirname, '..', '..', 'results-test-metadata');

describe('Metadata API', () => {
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

  describe('getAvailableDimensions', () => {
    it('should return list of available dimensions', async () => {
      // Arrange & Act
      const { getAvailableDimensions } = await import('../../src/api/metadata.js');
      const result = await getAvailableDimensions();

      // Assert
      expect(result).toBeDefined();
      expect(result.dimensions).toBeDefined();
    });
  });

  describe('getAvailableMetrics', () => {
    it('should return list of available metrics', async () => {
      // Arrange & Act
      const { getAvailableMetrics } = await import('../../src/api/metadata.js');
      const result = await getAvailableMetrics();

      // Assert
      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
    });
  });

  describe('getPropertyMetadata', () => {
    it('should return full property metadata', async () => {
      // Arrange & Act
      const { getPropertyMetadata } = await import('../../src/api/metadata.js');
      const result = await getPropertyMetadata();

      // Assert
      expect(result).toBeDefined();
      expect(result.dimensions).toBeDefined();
      expect(result.metrics).toBeDefined();
    });
  });
});
