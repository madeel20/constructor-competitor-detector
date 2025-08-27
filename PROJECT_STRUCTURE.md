# Project Structure

This document describes the organized structure of the competitor detector project after refactoring.

## Directory Structure

```
src/
├── core/                    # Core scanning functionality
│   ├── competitor-detector.ts    # Main competitor detection logic
│   ├── page-scanner.ts           # Page scanning orchestration
│   └── index.ts                  # Core module exports
├── detectors/               # Individual detection methods
│   ├── api-detector.ts           # API request detection
│   ├── attribute-detector.ts     # Data attribute detection
│   ├── cookie-detector.ts        # Cookie detection
│   ├── css-detector.ts           # CSS class detection
│   ├── head-tag-detector.ts      # HTML head tag detection
│   ├── script-detector.ts        # Script detection (src, IDs, keywords)
│   ├── window-detector.ts        # Window variable detection
│   └── index.ts                  # Detector module exports
├── utils/                   # Utility functions
│   └── confidence-calculator.ts  # Confidence scoring algorithm
├── types.ts                 # Type definitions
└── index.ts                 # Main entry point
```

## Module Organization

### Core Modules (`src/core/`)
- **competitor-detector.ts**: Orchestrates all detection methods and combines results
- **page-scanner.ts**: Handles browser automation and page scanning workflow
- **index.ts**: Provides clean exports for the core functionality

### Detection Modules (`src/detectors/`)
Each detector is responsible for a specific type of fingerprint detection:
- **script-detector.ts**: Detects JavaScript files, script IDs, and keywords in script content
- **window-detector.ts**: Checks for global window variables
- **css-detector.ts**: Detects CSS classes (supports wildcards)
- **attribute-detector.ts**: Finds HTML data attributes (supports wildcards)
- **api-detector.ts**: Identifies API request URLs
- **cookie-detector.ts**: Detects browser cookies
- **head-tag-detector.ts**: Finds specific HTML head tags

### Utilities (`src/utils/`)
- **confidence-calculator.ts**: Sophisticated scoring algorithm that weighs different types of matches and provides confidence scores

## Key Benefits of This Structure

1. **Modularity**: Each detection method is isolated and can be modified independently
2. **Testability**: Individual detectors can be unit tested separately
3. **Maintainability**: Clear separation of concerns makes the code easier to understand and maintain
4. **Extensibility**: New detection methods can be easily added as separate modules
5. **Reusability**: Detectors can be reused in different contexts

## Usage

### Using the Core API
```typescript
import { detectCompetitors, scanPage } from './core';
import { FingerprintsConfig } from './types';

// Scan a single page
const result = await scanPage(url, customer, pageName, fingerprints);

// Detect competitors on an existing page
const competitors = await detectCompetitors(page, fingerprints.fingerprints);
```

### Using Individual Detectors
```typescript
import { checkScripts, checkWindowVariables } from './detectors';

// Use specific detectors
const scriptMatches = await checkScripts(page, fingerprint.scripts);
const windowMatches = await checkWindowVariables(page, fingerprint.windowVariables);
```

## Adding New Detectors

To add a new detection method:

1. Create a new file in `src/detectors/` (e.g., `new-detector.ts`)
2. Export your detection function
3. Add the export to `src/detectors/index.ts`
4. Update `src/core/competitor-detector.ts` to use the new detector
5. Update the confidence calculator if needed
