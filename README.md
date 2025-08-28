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

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file to configure your browser settings:
- `BROWSER_TIMEOUT`: Timeout for page operations in milliseconds (default: 30000)
- `BROWSER_HEADLESS`: Whether to run browser in headless mode (default: true)
- `BATCH_SIZE`: Number of pages to scan per batch/concurrently (default: 10)

## Configuration

### Environment Variables
Create a `.env` file to configure browser settings:

```env
# Browser Configuration
BROWSER_TIMEOUT=30000
BROWSER_HEADLESS=true

# Scanning Configuration
BATCH_SIZE=10
```

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
# Run all customers in headless mode (default)
npm start

# Development mode - all customers (headless by default)
npm run dev

# Development mode with browser window visible
npm run dev:headed

# Run specific customer with npm run dev
npm run dev -- --customer="King Arthur Baking"
npm run dev -- --customer="Everlane"

# Combine arguments with npm run dev
npm run dev -- --customer="King Arthur" --headless=false

# Or use npx directly
npx ts-node src/index.ts --customer="King Arthur Baking"
npx ts-node src/index.ts --customer="King Arthur"  # Partial match works
```

This will:
1. Load customer and fingerprint configurations
2. Scan all customer pages
3. Generate a results file in the `results/` directory
4. Print a summary to the console

### Command Line Options

- `--headless=true|false` - Override the headless setting from environment variables
- `--customer="Customer Name"` - Run scan for specific customer only (supports partial matching)

**Priority order for headless setting:**
1. Command line argument (`--headless=true/false`)
2. Environment variable (`BROWSER_HEADLESS`)
3. Default value (`true`)

**Customer filtering:**
- Use exact customer name: `--customer="King Arthur Baking"`
- Or partial match: `--customer="King Arthur"`
- Case-insensitive matching
- Shows available customers if no match found

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
