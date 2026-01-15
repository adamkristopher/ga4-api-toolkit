/**
 * Mock Indexing API Client for testing
 */

import { vi } from 'vitest';

// Mock response for URL notification (publish/update)
export const mockUrlNotificationResponse = {
  urlNotificationMetadata: {
    url: 'https://example.com/updated-page',
    latestUpdate: {
      url: 'https://example.com/updated-page',
      type: 'URL_UPDATED',
      notifyTime: '2024-01-15T10:30:00Z',
    },
  },
};

// Mock response for URL notification (remove)
export const mockUrlRemovalResponse = {
  urlNotificationMetadata: {
    url: 'https://example.com/removed-page',
    latestRemove: {
      url: 'https://example.com/removed-page',
      type: 'URL_DELETED',
      notifyTime: '2024-01-15T10:30:00Z',
    },
  },
};

// Mock response for URL inspection
export const mockUrlInspectionResponse = {
  inspectionResult: {
    inspectionResultLink: 'https://search.google.com/search-console/inspect?resource_id=...',
    indexStatusResult: {
      verdict: 'PASS',
      coverageState: 'Submitted and indexed',
      robotsTxtState: 'ALLOWED',
      indexingState: 'INDEXING_ALLOWED',
      lastCrawlTime: '2024-01-14T08:00:00Z',
      pageFetchState: 'SUCCESSFUL',
      googleCanonical: 'https://example.com/updated-page',
      userCanonical: 'https://example.com/updated-page',
      crawledAs: 'DESKTOP',
    },
    mobileUsabilityResult: {
      verdict: 'PASS',
      issues: [],
    },
    richResultsResult: {
      verdict: 'PASS',
      detectedItems: [],
    },
  },
};

// Mock response for URL inspection - not indexed
export const mockUrlInspectionNotIndexedResponse = {
  inspectionResult: {
    inspectionResultLink: 'https://search.google.com/search-console/inspect?resource_id=...',
    indexStatusResult: {
      verdict: 'FAIL',
      coverageState: 'Discovered - currently not indexed',
      robotsTxtState: 'ALLOWED',
      indexingState: 'INDEXING_ALLOWED',
      pageFetchState: 'SUCCESSFUL',
      crawledAs: 'MOBILE',
    },
  },
};

// Mock batch response
export const mockBatchNotificationResponse = {
  responses: [
    { urlNotificationMetadata: mockUrlNotificationResponse.urlNotificationMetadata },
    { urlNotificationMetadata: { ...mockUrlNotificationResponse.urlNotificationMetadata, url: 'https://example.com/page-2' } },
    { urlNotificationMetadata: { ...mockUrlNotificationResponse.urlNotificationMetadata, url: 'https://example.com/page-3' } },
  ],
};

// Create mock indexing client
export const createMockIndexingClient = () => ({
  urlNotifications: {
    publish: vi.fn().mockResolvedValue({ data: mockUrlNotificationResponse }),
    getMetadata: vi.fn().mockResolvedValue({ data: mockUrlNotificationResponse }),
  },
});

// Create mock URL inspection client (part of Search Console API)
export const createMockUrlInspectionClient = () => ({
  urlInspection: {
    index: {
      inspect: vi.fn().mockResolvedValue({ data: mockUrlInspectionResponse }),
    },
  },
});

// Mock indexing constructor
export const MockIndexing = vi.fn().mockImplementation(() => createMockIndexingClient());

// Mock URL inspection constructor
export const MockUrlInspection = vi.fn().mockImplementation(() => createMockUrlInspectionClient());
