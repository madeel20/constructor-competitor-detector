# Competitor Detector

A simple TypeScript project using Playwright to detect competitor fingerprints on websites.

## Features

- 🔍 Detect competitor technologies by analyzing:
  - Script tags and sources
  - Window variables
  - CSS classes
  - Data attributes
  - Cookies
  - Head tags
  - API request URLs
- 📊 Generate confidence scores for detections
- 🔧 Functional programming approach - simple and modular
- 📁 JSON-based configuration for customers and fingerprints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Configuration

### Customer Configuration (`config/customers.json`)
Define the customers and their pages to scan:

```json
{
  "customers": [
    {
      "name": "Example Customer 1",
      "pages": [
        {
          "name": "Homepage",
          "url": "https://example.com"
        },
        {
          "name": "Search Page", 
          "url": "https://example.com/search"
        }
      ]
    }
  ]
}
```

### Fingerprints Configuration (`config/fingerprints.json`)
Define competitor fingerprints to detect:

```json
{
  "fingerprints": {
    "algolia": {
      "scripts": {
        "src": ["https://cdn.jsdelivr.net/npm/algoliasearch@4"],
        "keywords": ["ALGOLIA_SEARCH_API_KEY", "algolia"]
      },
      "windowVariables": ["algoliasearch", "__algolia"],
      "classesList": ["ais-SearchBox", "ais-Hits"],
      "dataAttributes": ["data-algolia-*"],
      "cookies": ["_ALGOLIA"]
    }
  }
}
```

## Usage

### Run the Scanner

```bash
npm start
```

This will:
1. Load customer and fingerprint configurations
2. Scan all customer pages
3. Generate a results file in the `results/` directory
4. Print a summary to the console

### Programmatic Usage

```typescript
import { scanPage, scanMultiplePages } from './src/scanner';
import { loadFingerprints } from './src/index';

// Scan a single page
const fingerprints = await loadFingerprints();
const result = await scanPage(
  'https://example.com',
  'Customer Name',
  'Homepage',
  fingerprints,
  { headless: true, timeout: 30000 }
);

console.log(result);
```

## Project Structure

```
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── scanner.ts        # Core scanning functions
│   └── index.ts          # Main entry point
├── config/
│   ├── customers.json    # Customer configuration
│   └── fingerprints.json # Competitor fingerprints
├── results/              # Scan results (auto-generated)
├── package.json
└── tsconfig.json
```

## Output Format

Results are saved as JSON files with this structure:

```json
{
  "customer": "Customer Name",
  "pageName": "Homepage", 
  "url": "https://example.com",
  "timestamp": "2025-08-26T...",
  "competitors": [
    {
      "competitor": "algolia",
      "detected": true,
      "confidence": 85,
      "matches": [
        {
          "type": "script",
          "value": "algoliasearch",
          "details": { "type": "keyword" }
        }
      ]
    }
  ]
}
```

## Scripts

- `npm start` - Run the competitor detection
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with ts-node

## License

MIT
