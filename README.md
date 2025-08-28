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
Define competitor fingerprints to detect. Example structure:

```json
{
  "fingerprints": {
    "competitorName": {
      "scripts": {
        "tags": [
          {
            "title": "Script description", // e.g. Algolia Search Client
            "src": ["exact-script-url"], // e.g. CDN URL
            "srcReg": ["regex-pattern-for-script-url"] // e.g. versioned CDN regex
          }
          // ...more script tag patterns
        ],
        "ids": ["element-id"], // DOM element IDs
        "keywords": ["keyword-in-script"] // Keywords in script/config
      },
      "apiRequestsURLs": ["api-endpoint-url"], // API endpoints used
      "windowVariables": ["global-js-variable"], // JS variables on window
      "dataAttributes": ["data-attribute-pattern"], // HTML data attributes
      "cookies": ["cookie-name"], // Cookie names set by competitor
      "headTags": [
        {
          "tag": "html-tag-type", // e.g. link, meta
          "href": "url-pattern", // URL in tag
          "rel": "relationship-attribute" // e.g. preconnect
        }
        // ...more head tag patterns
      ],
      "classesList": ["css-class-name"] // CSS classes used by competitor widgets
    }
    // ...other competitors
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
or
npm run dev -- --headless=false

# Run specific customer with npm run dev
npm run dev -- --customer="King Arthur Baking"
npm run dev -- --customer="Everlane"

# Combine arguments with npm run dev
npm run dev -- --customer="King Arthur" --headless=false

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

## Project Structure

```
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── scanner.ts        # Scanning logic
│   └── index.ts          # Main entry point
├── config/
│   ├── customers.json    # Customer definitions
│   └── fingerprints.json # Fingerprint patterns
├── results/              # Scan results
├── package.json          # Project metadata & scripts
└── tsconfig.json         # TypeScript config
```

## Output Format

Results are saved as JSON files in the `results/` folder. Example format:

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
          "type": "script", // match type: script, windowVariable, class, etc.
          "value": "algoliasearch", // matched value
          "details": {
            "type": "keyword", // e.g. keyword, src, srcReg, etc.
            // ...additional details
          }
        }
        // ...more matches
      ]
    }
    // ...other competitors
  ]
}
```

