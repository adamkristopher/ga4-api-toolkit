import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockBetaAnalyticsDataClient, createMockClient } from '../mocks/ga4-client.js';

// Mock the @google-analytics/data module
vi.mock('@google-analytics/data', () => ({
  BetaAnalyticsDataClient: MockBetaAnalyticsDataClient,
}));

describe('Client', () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up environment for client
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GA4_CLIENT_EMAIL = 'test@project.iam.gserviceaccount.com';
    process.env.GA4_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getClient', () => {
    it('should return a GA4 analytics data client', async () => {
      // Arrange & Act
      const { getClient } = await import('../../src/core/client.js');
      const client = getClient();

      // Assert
      expect(client).toBeDefined();
      expect(client).toHaveProperty('runReport');
      expect(client).toHaveProperty('runRealtimeReport');
      expect(client).toHaveProperty('getMetadata');
    });

    it('should return the same client instance on multiple calls (singleton)', async () => {
      // Arrange & Act
      const { getClient } = await import('../../src/core/client.js');
      const client1 = getClient();
      const client2 = getClient();

      // Assert
      expect(client1).toBe(client2);
    });

    it('should initialize client with credentials from settings', async () => {
      // Arrange & Act
      const { getClient } = await import('../../src/core/client.js');
      getClient();

      // Assert
      expect(MockBetaAnalyticsDataClient).toHaveBeenCalledWith({
        credentials: {
          client_email: 'test@project.iam.gserviceaccount.com',
          private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        },
      });
    });
  });

  describe('getPropertyId', () => {
    it('should return the property ID from settings', async () => {
      // Arrange & Act
      const { getPropertyId } = await import('../../src/core/client.js');
      const propertyId = getPropertyId();

      // Assert
      expect(propertyId).toBe('properties/123456789');
    });

    it('should format property ID with "properties/" prefix', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '987654321';
      vi.resetModules();

      // Act
      const { getPropertyId } = await import('../../src/core/client.js');
      const propertyId = getPropertyId();

      // Assert
      expect(propertyId).toBe('properties/987654321');
    });
  });

  describe('resetClient', () => {
    it('should reset the singleton instance', async () => {
      // Arrange
      const { getClient, resetClient } = await import('../../src/core/client.js');
      const client1 = getClient();

      // Act
      resetClient();
      vi.resetModules();
      // Need to re-mock after reset
      vi.mock('@google-analytics/data', () => ({
        BetaAnalyticsDataClient: MockBetaAnalyticsDataClient,
      }));
      const { getClient: getClient2 } = await import('../../src/core/client.js');
      const client2 = getClient2();

      // Assert - After reset, should create new instance
      expect(MockBetaAnalyticsDataClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should throw error when credentials are invalid', async () => {
      // Arrange
      process.env.GA4_PROPERTY_ID = '';
      process.env.GA4_CLIENT_EMAIL = '';
      process.env.GA4_PRIVATE_KEY = '';
      vi.resetModules();

      // Re-mock after module reset
      vi.mock('@google-analytics/data', () => ({
        BetaAnalyticsDataClient: MockBetaAnalyticsDataClient,
      }));

      // Act & Assert
      const { getClient } = await import('../../src/core/client.js');
      expect(() => getClient()).toThrow('Invalid GA4 credentials');
    });
  });
});
