/**
 * GA4 Analytics Toolkit - Main Entry Point
 *
 * Simple interface for Google Analytics 4 data analysis.
 * All results are automatically saved to the /results directory with timestamps.
 *
 * Usage:
 *   import { siteOverview, trafficAnalysis } from './index.js';
 *   const overview = await siteOverview('30d');
 */

// Re-export all API functions
export * from './api/reports.js';
export * from './api/realtime.js';
export * from './api/metadata.js';

// Re-export core utilities
export { getClient, getPropertyId, resetClient } from './core/client.js';
export { saveResult, loadResult, listResults, getLatestResult } from './core/storage.js';
export { getSettings, validateSettings } from './config/settings.js';

// Import for orchestration functions
import {
  runReport,
  getPageViews,
  getTrafficSources,
  getUserDemographics,
  getEventCounts,
  getConversions,
  parseDateRange,
  type DateRange,
} from './api/reports.js';
import { getActiveUsers, getRealtimeEvents, getRealtimePages } from './api/realtime.js';
import { getPropertyMetadata } from './api/metadata.js';
import { saveResult } from './core/storage.js';

// ============================================================================
// HIGH-LEVEL ORCHESTRATION FUNCTIONS
// ============================================================================

/**
 * Comprehensive site overview - combines multiple reports
 */
export async function siteOverview(dateRange?: string | DateRange) {
  console.log('\n📊 Generating site overview...');
  const results: Record<string, unknown> = {};

  console.log('  → Getting page views...');
  results.pageViews = await getPageViews(dateRange);

  console.log('  → Getting traffic sources...');
  results.trafficSources = await getTrafficSources(dateRange);

  console.log('  → Getting user demographics...');
  results.demographics = await getUserDemographics(dateRange);

  console.log('  → Getting event counts...');
  results.events = await getEventCounts(dateRange);

  // Save combined results
  const dateStr = typeof dateRange === 'string' ? dateRange : 'custom';
  saveResult(results, 'reports', 'site_overview', dateStr);

  console.log('✅ Site overview complete\n');
  return results;
}

/**
 * Deep dive on traffic sources
 */
export async function trafficAnalysis(dateRange?: string | DateRange) {
  console.log('\n🚗 Analyzing traffic sources...');
  const results: Record<string, unknown> = {};

  console.log('  → Getting traffic sources...');
  results.sources = await getTrafficSources(dateRange);

  console.log('  → Getting session data by source...');
  results.sessions = await runReport({
    dimensions: ['sessionSource', 'sessionMedium'],
    metrics: ['sessions', 'engagedSessions', 'averageSessionDuration', 'bounceRate'],
    dateRange,
  });

  console.log('  → Getting new vs returning users...');
  results.newVsReturning = await runReport({
    dimensions: ['newVsReturning'],
    metrics: ['activeUsers', 'sessions', 'conversions'],
    dateRange,
  });

  const dateStr = typeof dateRange === 'string' ? dateRange : 'custom';
  saveResult(results, 'reports', 'traffic_analysis', dateStr);

  console.log('✅ Traffic analysis complete\n');
  return results;
}

/**
 * Content performance analysis
 */
export async function contentPerformance(dateRange?: string | DateRange) {
  console.log('\n📄 Analyzing content performance...');
  const results: Record<string, unknown> = {};

  console.log('  → Getting page views...');
  results.pages = await getPageViews(dateRange);

  console.log('  → Getting landing pages...');
  results.landingPages = await runReport({
    dimensions: ['landingPage'],
    metrics: ['sessions', 'activeUsers', 'bounceRate', 'averageSessionDuration'],
    dateRange,
  });

  console.log('  → Getting exit pages...');
  results.exitPages = await runReport({
    dimensions: ['pagePath'],
    metrics: ['exits', 'screenPageViews'],
    dateRange,
  });

  const dateStr = typeof dateRange === 'string' ? dateRange : 'custom';
  saveResult(results, 'reports', 'content_performance', dateStr);

  console.log('✅ Content performance analysis complete\n');
  return results;
}

/**
 * User behavior analysis
 */
export async function userBehavior(dateRange?: string | DateRange) {
  console.log('\n👤 Analyzing user behavior...');
  const results: Record<string, unknown> = {};

  console.log('  → Getting demographics...');
  results.demographics = await getUserDemographics(dateRange);

  console.log('  → Getting events...');
  results.events = await getEventCounts(dateRange);

  console.log('  → Getting engagement metrics...');
  results.engagement = await runReport({
    dimensions: ['date'],
    metrics: ['activeUsers', 'engagedSessions', 'engagementRate', 'averageSessionDuration'],
    dateRange,
  });

  const dateStr = typeof dateRange === 'string' ? dateRange : 'custom';
  saveResult(results, 'reports', 'user_behavior', dateStr);

  console.log('✅ User behavior analysis complete\n');
  return results;
}

/**
 * Compare two date ranges
 */
export async function compareDateRanges(
  range1: DateRange,
  range2: DateRange,
  dimensions: string[] = ['date'],
  metrics: string[] = ['activeUsers', 'sessions', 'screenPageViews']
) {
  console.log('\n📈 Comparing date ranges...');

  console.log(`  → Getting data for ${range1.startDate} to ${range1.endDate}...`);
  const period1 = await runReport({
    dimensions,
    metrics,
    dateRange: range1,
    save: false,
  });

  console.log(`  → Getting data for ${range2.startDate} to ${range2.endDate}...`);
  const period2 = await runReport({
    dimensions,
    metrics,
    dateRange: range2,
    save: false,
  });

  const comparison = {
    period1: { dateRange: range1, data: period1 },
    period2: { dateRange: range2, data: period2 },
  };

  saveResult(comparison, 'reports', 'date_comparison');

  console.log('✅ Date range comparison complete\n');
  return comparison;
}

/**
 * Get current live data snapshot
 */
export async function liveSnapshot() {
  console.log('\n⚡ Getting live data snapshot...');
  const results: Record<string, unknown> = {};

  console.log('  → Getting active users...');
  results.activeUsers = await getActiveUsers();

  console.log('  → Getting current pages...');
  results.currentPages = await getRealtimePages();

  console.log('  → Getting current events...');
  results.currentEvents = await getRealtimeEvents();

  saveResult(results, 'realtime', 'snapshot');

  console.log('✅ Live snapshot complete\n');
  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get available dimensions and metrics
 */
export async function getAvailableFields() {
  console.log('\n📋 Getting available fields...');
  const metadata = await getPropertyMetadata();
  console.log(`  → Found ${metadata.dimensions?.length || 0} dimensions`);
  console.log(`  → Found ${metadata.metrics?.length || 0} metrics`);
  console.log('✅ Field retrieval complete\n');
  return metadata;
}

// Print help when run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log(`
GA4 Analytics Toolkit
=====================

High-level functions:
  - siteOverview(dateRange?)        Comprehensive site snapshot
  - trafficAnalysis(dateRange?)     Deep dive on sources
  - contentPerformance(dateRange?)  Top pages analysis
  - userBehavior(dateRange?)        Engagement patterns
  - compareDateRanges(range1, range2)  Period comparison
  - liveSnapshot()                  Real-time data

Low-level functions:
  - runReport({ dimensions, metrics, dateRange })
  - getPageViews(dateRange?)
  - getTrafficSources(dateRange?)
  - getUserDemographics(dateRange?)
  - getEventCounts(dateRange?)
  - getActiveUsers()
  - getRealtimeEvents()
  - getPropertyMetadata()

All results are automatically saved to /results directory.
`);
}
