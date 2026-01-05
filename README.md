# GA4 Analytics Toolkit

A TypeScript toolkit for Google Analytics 4 data analysis, designed for use with AI assistants like Claude Code.

## Features

- **Simple API** - High-level functions for common analytics tasks
- **Auto-save Results** - All API responses automatically saved with timestamps
- **Type-safe** - Full TypeScript support with interfaces for all responses
- **Flexible Date Ranges** - Support for shorthand (`"30d"`) and explicit date ranges
- **Singleton Client** - Efficient credential management
- **Test Coverage** - Built with TDD, comprehensive test suite included

## Prerequisites

- Node.js 18+
- A Google Analytics 4 property
- A Google Cloud Platform project with Analytics Data API enabled
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
3. Enable the "Google Analytics Data API"

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

### 3. Add Service Account to GA4

1. Open your GA4 property
2. Go to Admin > Property Access Management
3. Click the "+" button to add a user
4. Enter the service account email (from the JSON key)
5. Select "Viewer" role
6. Click "Add"

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
```

Find your Property ID in GA4 Admin > Property Settings.

## Usage

### With Claude Code

Just ask Claude what you want to analyze:

```
"Give me a site overview for the last 30 days"
"Analyze my traffic sources this week"
"What are my top pages?"
"Compare this month to last month"
```

### Programmatic Usage

```typescript
import { siteOverview, getPageViews, runReport } from './src/index.js';

// High-level analysis
const overview = await siteOverview('30d');

// Specific reports
const pages = await getPageViews('7d');

// Custom reports
const custom = await runReport({
  dimensions: ['country', 'city'],
  metrics: ['activeUsers', 'sessions'],
  dateRange: '30d',
});
```

## API Reference

### High-Level Functions

| Function | Description |
|----------|-------------|
| `siteOverview(dateRange?)` | Comprehensive site snapshot |
| `trafficAnalysis(dateRange?)` | Deep dive on traffic sources |
| `contentPerformance(dateRange?)` | Top pages analysis |
| `userBehavior(dateRange?)` | User engagement patterns |
| `compareDateRanges(range1, range2)` | Period comparison |
| `liveSnapshot()` | Real-time data snapshot |

### Reports API

| Function | Description |
|----------|-------------|
| `runReport(options)` | Run custom report with any dimensions/metrics |
| `getPageViews(dateRange?)` | Page performance data |
| `getTrafficSources(dateRange?)` | Traffic source breakdown |
| `getUserDemographics(dateRange?)` | User demographics (country, device) |
| `getEventCounts(dateRange?)` | Event tracking data |
| `getConversions(dateRange?)` | Conversion metrics |
| `getEcommerceRevenue(dateRange?)` | E-commerce metrics |

### Realtime API

| Function | Description |
|----------|-------------|
| `getActiveUsers()` | Current active users |
| `getRealtimeEvents()` | Live event stream |
| `getRealtimePages()` | Currently viewed pages |

### Metadata API

| Function | Description |
|----------|-------------|
| `getAvailableDimensions()` | List all available dimensions |
| `getAvailableMetrics()` | List all available metrics |
| `getPropertyMetadata()` | Full property metadata |

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
