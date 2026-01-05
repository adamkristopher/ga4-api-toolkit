import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Settings', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to get fresh settings each test
    vi.resetModules();
    // Clone the original env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getSettings', () => {
    it('should return settings object with all required properties', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { getSettings } = await import('../../src/config/settings.js');
      const settings = getSettings();

      // Assert
      expect(settings).toHaveProperty('propertyId');
      expect(settings).toHaveProperty('clientEmail');
      expect(settings).toHaveProperty('privateKey');
      expect(settings).toHaveProperty('defaultDateRange');
      expect(settings).toHaveProperty('resultsDir');
    });

    it('should parse property ID from environment', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '987654321';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { getSettings } = await import('../../src/config/settings.js');
      const settings = getSettings();

      // Assert
      expect(settings.propertyId).toBe('987654321');
    });

    it('should use default date range of 30 days', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { getSettings } = await import('../../src/config/settings.js');
      const settings = getSettings();

      // Assert
      expect(settings.defaultDateRange).toBe('30d');
    });

    it('should set results directory relative to project root', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { getSettings } = await import('../../src/config/settings.js');
      const settings = getSettings();

      // Assert
      expect(settings.resultsDir).toContain('results');
    });
  });

  describe('validateSettings', () => {
    it('should return true when all required credentials are present', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { validateSettings } = await import('../../src/config/settings.js');
      const result = validateSettings();

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error when GA4_PROPERTY_ID is missing', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { validateSettings } = await import('../../src/config/settings.js');
      const result = validateSettings();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('GA4_PROPERTY_ID is required');
    });

    it('should return error when GA4_CLIENT_EMAIL is missing', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = '';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { validateSettings } = await import('../../src/config/settings.js');
      const result = validateSettings();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('GA4_CLIENT_EMAIL is required');
    });

    it('should return error when GA4_PRIVATE_KEY is missing', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '';

      // Act
      const { validateSettings } = await import('../../src/config/settings.js');
      const result = validateSettings();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('GA4_PRIVATE_KEY is required');
    });

    it('should return multiple errors when multiple credentials are missing', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '';
      process.env.GA4_CLIENT_EMAIL = '';
      process.env.GA4_PRIVATE_KEY = '';

      // Act
      const { validateSettings } = await import('../../src/config/settings.js');
      const result = validateSettings();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Settings type', () => {
    it('should export Settings interface with correct types', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '123456789';
      process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
      process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';

      // Act
      const { getSettings } = await import('../../src/config/settings.js');
      const settings = getSettings();

      // Assert
      expect(typeof settings.propertyId).toBe('string');
      expect(typeof settings.clientEmail).toBe('string');
      expect(typeof settings.privateKey).toBe('string');
      expect(typeof settings.defaultDateRange).toBe('string');
      expect(typeof settings.resultsDir).toBe('string');
    });
  });
});
