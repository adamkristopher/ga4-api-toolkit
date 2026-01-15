# GA4 Analytics Toolkit

## Overview

This is a TypeScript toolkit for Google Analytics 4 data analysis, Google Search Console SEO data, and Indexing API integration. Claude executes analysis functions on your behalf and saves structured results to JSON files, then creates human-readable summary documents for decision-making.

## Project Structure

```
GA4/
├── .env                      # API credentials (DO NOT COMMIT)
├── src/
│   ├── index.ts              # High-level convenience functions
│   ├── config/
│   │   └── settings.ts       # Configuration and defaults
│   ├── core/
│   │   ├── client.ts         # API clients (GA4, Search Console, Indexing)
│   │   └── storage.ts        # Auto-save results to JSON
│   └── api/
│       ├── reports.ts        # GA4 standard reports (traffic, pages, etc.)
│       ├── realtime.ts       # GA4 live data
│       ├── metadata.ts       # GA4 available dimensions/metrics
│       ├── searchConsole.ts  # Search Console SEO data
│       └── indexing.ts       # Indexing API (re-crawl requests)
└── results/
    ├── reports/              # GA4 report results
    ├── realtime/             # Real-time snapshots
    ├── searchconsole/        # Search Console results
    ├── indexing/             # Indexing API results
    └── summaries/            # Human-readable markdown summaries
```

## How to Use (Prompting Claude)

### Basic Analysis Requests

Just tell Claude what you want to analyze:

**GA4 Analytics:**
- "Give me a site overview for the last 30 days"
- "Analyze my traffic sources this week"
- "What are my top pages?"
- "Show me real-time active users"
- "Compare this month to last month"

**Search Console SEO:**
- "What are my top search queries?"
- "Show me SEO performance by page"
- "Analyze search traffic by device"
- "Get my Search Console overview for the last 7 days"

**Indexing:**
- "Request re-indexing for these URLs: [url1, url2]"
- "Check if these pages are indexed"
- "Re-crawl my updated blog posts"

### Specific Function Requests

For more control, request specific functions:

**GA4:**
- "Run `siteOverview('30d')` for a comprehensive snapshot"
- "Get `getPageViews('7d')` to see top pages"
- "Use `trafficAnalysis('90d')` for traffic deep dive"

**Search Console:**
- "Run `searchConsoleOverview('30d')` for SEO snapshot"
- "Get `getTopQueries('7d')` to see search terms"
- "Use `keywordAnalysis('30d')` for keyword deep dive"

**Indexing:**
- "Run `reindexUrls(['url1', 'url2'])` to request re-crawl"
- "Use `checkIndexStatus(['url'])` to verify indexing"

### Summary Requests

After running analysis, ask for summaries:

- "Create a summary of those results in /results/summaries"
- "Put the analysis in a document named [specific-name].md"
- "Summarize the data so I can make decisions"

## Workflow Pattern

### 1. Analysis Phase
Claude runs API functions and saves raw JSON to `/results/{category}/`

Example files created:
```
results/reports/20240105_093715__site_overview__30d.json
results/realtime/20240105_094500__snapshot.json
```

### 2. Summary Phase
Claude reads the JSON files and creates markdown summaries in `/results/summaries/`

Example summaries:
```
results/summaries/january-traffic-report.md
results/summaries/weekly-performance-summary.md
```

### 3. Decision Phase
You review the summaries which contain:
- Data tables with key metrics
- Trend analysis
- Strategic recommendations
- Links to source data

## Available Functions

### GA4 High-Level (index.ts)
| Function | Purpose |
|----------|---------|
| `siteOverview(dateRange?)` | Comprehensive site snapshot |
| `trafficAnalysis(dateRange?)` | Deep dive on traffic sources |
| `contentPerformance(dateRange?)` | Top pages analysis |
| `userBehavior(dateRange?)` | User engagement patterns |
| `compareDateRanges(range1, range2)` | Period comparison |
| `liveSnapshot()` | Real-time data snapshot |

### Search Console High-Level
| Function | Purpose |
|----------|---------|
| `searchConsoleOverview(dateRange?)` | Combined SEO snapshot |
| `keywordAnalysis(dateRange?)` | Query/keyword deep dive |
| `seoPagePerformance(dateRange?)` | Page-level SEO metrics |

### Indexing High-Level
| Function | Purpose |
|----------|---------|
| `reindexUrls(urls)` | Request re-indexing for multiple URLs |
| `checkIndexStatus(urls)` | Check if URLs are indexed |

### GA4 Reports API
| Function | Purpose |
|----------|---------|
| `runReport({ dimensions, metrics, dateRange })` | Custom report |
| `getPageViews(dateRange?)` | Page performance |
| `getTrafficSources(dateRange?)` | Traffic sources |
| `getUserDemographics(dateRange?)` | User demographics |
| `getEventCounts(dateRange?)` | Event tracking |
| `getConversions(dateRange?)` | Conversion data |
| `getEcommerceRevenue(dateRange?)` | E-commerce metrics |

### GA4 Realtime API
| Function | Purpose |
|----------|---------|
| `getActiveUsers()` | Current active users |
| `getRealtimeEvents()` | Live event stream |
| `getRealtimePages()` | Currently viewed pages |

### GA4 Metadata API
| Function | Purpose |
|----------|---------|
| `getAvailableDimensions()` | List all dimensions |
| `getAvailableMetrics()` | List all metrics |
| `getPropertyMetadata()` | Full property info |

### Search Console API
| Function | Purpose |
|----------|---------|
| `querySearchAnalytics(options)` | Raw search analytics query |
| `getTopQueries(dateRange?)` | Top search queries by clicks |
| `getTopPages(dateRange?)` | Top pages by impressions |
| `getDevicePerformance(dateRange?)` | Mobile vs desktop breakdown |
| `getCountryPerformance(dateRange?)` | Traffic by country |
| `getSearchAppearance(dateRange?)` | Rich results, AMP data |

### Indexing API
| Function | Purpose |
|----------|---------|
| `requestIndexing(url)` | Request single URL re-crawl |
| `requestIndexingBatch(urls)` | Batch request for multiple URLs |
| `removeFromIndex(url)` | Request URL removal |
| `inspectUrl(url)` | Check URL's index status |

## Date Range Formats

- Shorthand: `"7d"`, `"30d"`, `"90d"` (days ago to today)
- Explicit: `{ startDate: "2024-01-01", endDate: "2024-01-31" }`
- GA4 format: `{ startDate: "30daysAgo", endDate: "today" }`

## Common Dimensions

- `date`, `dateHour`, `week`, `month`
- `country`, `city`, `region`
- `deviceCategory`, `browser`, `operatingSystem`
- `pagePath`, `pageTitle`, `landingPage`
- `sessionSource`, `sessionMedium`, `sessionCampaignName`
- `eventName`
- `newVsReturning`

## Common Metrics

- `activeUsers`, `newUsers`, `totalUsers`
- `sessions`, `engagedSessions`, `engagementRate`
- `screenPageViews`, `averageSessionDuration`
- `bounceRate`, `exits`
- `eventCount`, `conversions`
- `totalRevenue`, `ecommercePurchases`

## Summary Document Format

When Claude creates summaries, they follow this structure:

```markdown
# [Analysis Title]
Generated: [timestamp]

## Executive Summary
- Key insight 1
- Key insight 2

## 1. Traffic Overview
| Metric | Value | Change |
[data table]

## 2. Top Pages
[ranked list]

## 3. Traffic Sources
[breakdown by source/medium]

## 4. Recommendations
- Actionable insight 1
- Actionable insight 2
```

## Session History

### Session: YYYY-MM-DD

**Analysis conducted:**

1. **[Analysis Name]**
   - Functions used: [list]
   - Summary: `results/summaries/[filename].md`
   - Key finding: [brief insight]

## Tips for Best Results

1. **Be specific** - "Analyze traffic for the last 30 days" works better than "show me data"

2. **Request summaries** - Always ask for a summary document after analysis

3. **Specify date ranges** - Use clear date ranges like "7d" or specific dates

4. **Ask for comparisons** - "Compare this month to last month" provides context

5. **Request recommendations** - "What should I focus on?" prompts actionable insights

## Credentials

Located in `.env` (not committed to git):
```
# GA4 Analytics
GA4_PROPERTY_ID=123456789
GA4_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Search Console (required for SEO and indexing functions)
SEARCH_CONSOLE_SITE_URL=https://your-domain.com
```

Get credentials by:
1. Creating a GCP project
2. Enabling the following APIs:
   - Google Analytics Data API
   - Google Search Console API
   - Indexing API
3. Creating a service account and downloading JSON key
4. Adding service account email to:
   - GA4 property (Viewer role)
   - Search Console property (User role via Settings > Users and permissions)
