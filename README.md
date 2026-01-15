# GA4 Analytics Toolkit

A TypeScript toolkit for Google Analytics 4, Google Search Console, and Indexing API - designed for use with AI assistants like Claude Code.

## Features

- **GA4 Analytics** - Traffic, pages, events, conversions, real-time data
- **Search Console SEO** - Search queries, page performance, device/country breakdown
- **Indexing API** - Request re-indexing, check URL index status
- **Auto-save Results** - All API responses automatically saved with timestamps
- **Type-safe** - Full TypeScript support with interfaces for all responses
- **Flexible Date Ranges** - Support for shorthand (`"30d"`) and explicit date ranges
- **Test Coverage** - Built with TDD, 78 tests included

## Prerequisites

- Node.js 18+
- A Google Analytics 4 property
- A Google Search Console property (for SEO features)
- A Google Cloud Platform project with APIs enabled:
  - Google Analytics Data API
  - Google Search Console API
  - Indexing API
- Service account credentials

## Installation

```bash
git clone https://github.com/yourusername/ga4-toolkit.git
cd ga4-toolkit
npm install
```

## Configuration

### 1. Create a GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable the following APIs:
   - Google Analytics Data API
   - Google Search Console API
   - Indexing API

### 2. Create Service Account

1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Give it a name like "ga4-toolkit"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"
6. Click on the service account you just created
7. Go to "Keys" tab > "Add Key" > "Create new key"
8. Select JSON and click "Create"
9. Save the downloaded JSON file securely

### 3. Add Service Account to GA4 and Search Console

**For GA4:**
1. Open your GA4 property
2. Go to Admin > Property Access Management
3. Click the "+" button to add a user
4. Enter the service account email (from the JSON key)
5. Select "Viewer" role
6. Click "Add"

**For Search Console:**
1. Open [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to Settings > Users and permissions
4. Click "Add user"
5. Enter the service account email
6. Select "Full" permission
7. Click "Add"

### 4. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
GA4_PROPERTY_ID=123456789
GA4_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
SEARCH_CONSOLE_SITE_URL=https://your-domain.com
```

- Find your GA4 Property ID in GA4 Admin > Property Settings
- Use your exact Search Console property URL (e.g., `https://casso.app/`)

## Usage

### With Claude Code

Just ask Claude what you want to analyze:

**GA4 Analytics:**
```
"Give me a site overview for the last 30 days"
"Analyze my traffic sources this week"
"What are my top pages?"
"Compare this month to last month"
```

**Search Console SEO:**
```
"What are my top search queries?"
"Show me SEO performance by page"
"Get my Search Console overview"
```

**Indexing:**
```
"Request re-indexing for https://casso.app/blog/new-post"
"Check if these URLs are indexed"
```

### Programmatic Usage

```typescript
import {
  siteOverview,
  getPageViews,
  searchConsoleOverview,
  getTopQueries,
  reindexUrls,
  checkIndexStatus,
} from './src/index.js';

// GA4 Analytics
const overview = await siteOverview('30d');
const pages = await getPageViews('7d');

// Search Console SEO
const seoOverview = await searchConsoleOverview('30d');
const queries = await getTopQueries('7d');

// Indexing API
const reindexResult = await reindexUrls(['https://casso.app/blog/new-post']);
const indexStatus = await checkIndexStatus(['https://casso.app/']);
```

## API Reference

### GA4 High-Level Functions

| Function | Description |
|----------|-------------|
| `siteOverview(dateRange?)` | Comprehensive site snapshot |
| `trafficAnalysis(dateRange?)` | Deep dive on traffic sources |
| `contentPerformance(dateRange?)` | Top pages analysis |
| `userBehavior(dateRange?)` | User engagement patterns |
| `compareDateRanges(range1, range2)` | Period comparison |
| `liveSnapshot()` | Real-time data snapshot |

### Search Console High-Level Functions

| Function | Description |
|----------|-------------|
| `searchConsoleOverview(dateRange?)` | Combined SEO snapshot |
| `keywordAnalysis(dateRange?)` | Query/keyword deep dive |
| `seoPagePerformance(dateRange?)` | Page-level SEO metrics |

### Indexing High-Level Functions

| Function | Description |
|----------|-------------|
| `reindexUrls(urls)` | Request re-indexing for multiple URLs |
| `checkIndexStatus(urls)` | Check if URLs are indexed |

### GA4 Reports API

| Function | Description |
|----------|-------------|
| `runReport(options)` | Run custom report with any dimensions/metrics |
| `getPageViews(dateRange?)` | Page performance data |
| `getTrafficSources(dateRange?)` | Traffic source breakdown |
| `getUserDemographics(dateRange?)` | User demographics (country, device) |
| `getEventCounts(dateRange?)` | Event tracking data |
| `getConversions(dateRange?)` | Conversion metrics |
| `getEcommerceRevenue(dateRange?)` | E-commerce metrics |

### GA4 Realtime API

| Function | Description |
|----------|-------------|
| `getActiveUsers()` | Current active users |
| `getRealtimeEvents()` | Live event stream |
| `getRealtimePages()` | Currently viewed pages |

### GA4 Metadata API

| Function | Description |
|----------|-------------|
| `getAvailableDimensions()` | List all available dimensions |
| `getAvailableMetrics()` | List all available metrics |
| `getPropertyMetadata()` | Full property metadata |

### Search Console API

| Function | Description |
|----------|-------------|
| `querySearchAnalytics(options)` | Raw search analytics query |
| `getTopQueries(dateRange?)` | Top search queries by clicks |
| `getTopPages(dateRange?)` | Top pages by impressions |
| `getDevicePerformance(dateRange?)` | Mobile vs desktop breakdown |
| `getCountryPerformance(dateRange?)` | Traffic by country |
| `getSearchAppearance(dateRange?)` | Rich results, AMP data |

### Indexing API

| Function | Description |
|----------|-------------|
| `requestIndexing(url)` | Request single URL re-crawl |
| `requestIndexingBatch(urls)` | Batch request for multiple URLs |
| `removeFromIndex(url)` | Request URL removal from index |
| `inspectUrl(url)` | Check URL's index status |

## Date Ranges

Three formats are supported:

```typescript
// Shorthand (days ago to today)
await getPageViews('7d');
await getPageViews('30d');
await getPageViews('90d');

// Explicit dates
await getPageViews({ startDate: '2024-01-01', endDate: '2024-01-31' });

// GA4 relative format
await getPageViews({ startDate: '30daysAgo', endDate: 'today' });
```

## Results Storage

All results are automatically saved to the `results/` directory:

```
results/
├── reports/
│   └── 20240105_093715__site_overview__30d.json
├── realtime/
│   └── 20240105_094500__snapshot.json
├── searchconsole/
│   └── 20240105_100000__overview__30d.json
├── indexing/
│   └── 20240105_101500__request_indexing.json
└── summaries/
    └── january-report.md
```

Each result includes metadata:

```json
{
  "metadata": {
    "savedAt": "2024-01-05T09:37:15.123Z",
    "category": "reports",
    "operation": "site_overview",
    "propertyId": "123456789"
  },
  "data": { ... }
}
```

## Development

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Build

```bash
npm run build
```

## Common Dimensions

- `date`, `dateHour`, `week`, `month`
- `country`, `city`, `region`
- `deviceCategory`, `browser`, `operatingSystem`
- `pagePath`, `pageTitle`, `landingPage`
- `sessionSource`, `sessionMedium`, `sessionCampaignName`
- `eventName`, `newVsReturning`

## Common Metrics

- `activeUsers`, `newUsers`, `totalUsers`
- `sessions`, `engagedSessions`, `engagementRate`
- `screenPageViews`, `averageSessionDuration`
- `bounceRate`, `exits`
- `eventCount`, `conversions`
- `totalRevenue`, `ecommercePurchases`

## License

MIT License - see [LICENSE](LICENSE) file.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Implement your changes
5. Run tests (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Acknowledgments

- Built with the [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- Inspired by the DataForSEO API toolkit pattern
