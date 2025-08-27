import { promises as fs } from 'fs';
import * as path from 'path';
import { scanMultiplePages } from './core/page-scanner';
import { ScanResult } from './types';
import { customersConfig, fingerprintsConfig } from './config';

/**
 * Save scan results to file
 */
async function saveResults(results: ScanResult[]): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `scan-results-${timestamp}.json`;
  const outputPath = path.join(__dirname, '../results', filename);
  
  // Ensure results directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to: ${outputPath}`);
}

/**
 * Main function to run the competitor detection
 */
async function main() {
  try {
    console.log('Loading configuration...');
    const customers = customersConfig.customers;
    const fingerprints = fingerprintsConfig;

    // Prepare pages to scan
    const pagesToScan = customers.flatMap(customer =>
      customer.pages.map(page => ({
        url: page.url,
        customer: customer.name,
        pageName: page.name
      }))
    );

    console.log(`Scanning ${pagesToScan.length} pages for ${Object.keys(fingerprints.fingerprints).length} competitors...`);

    // Scan all pages
    const results = await scanMultiplePages(pagesToScan, fingerprints, {
      headless: true,
      timeout: 30000,
      delay: 1000 // 1 second delay between requests
    });

    // Save results
    await saveResults(results);

    // Print summary
    console.log('\n=== SCAN SUMMARY ===');
    results.forEach(result => {
      const detectedCompetitors = result.competitors.filter(c => c.detected);
      console.log(`\n${result.customer} - ${result.pageName} (${result.url}):`);
      
      if (detectedCompetitors.length === 0) {
        console.log('  ❌ No competitors detected');
      } else {
        detectedCompetitors.forEach(competitor => {
          console.log(`  ✅ ${competitor.competitor.toUpperCase()} detected (${competitor.confidence}% confidence)`);
          console.log(`     Found ${competitor.matches.length} matches:`);
          
          competitor.matches.forEach((match, index) => {
            console.log(`     ${index + 1}. ${match.type}: "${match.value}"`);
            if (match.details) {
              if (match.details.actualValue) {
                console.log(`        → Actual value: ${match.details.actualValue}`);
              }
              if (match.details.selector) {
                console.log(`        → Selector: ${match.details.selector}`);
              }
              if (match.details.foundIn) {
                console.log(`        → Found in ${match.details.foundIn.length} script(s)`);
              }
              if (match.details.matchCount) {
                console.log(`        → Found ${match.details.matchCount} elements`);
              }
              if (match.details.actualClasses) {
                console.log(`        → Classes: ${match.details.actualClasses.join(', ')}`);
              }
              if (match.details.actualAttributes) {
                console.log(`        → Attributes: ${JSON.stringify(match.details.actualAttributes)}`);
              }
            }
          });
        });
      }
    });

  } catch (error) {
    console.error('Error running competitor detection:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { main, saveResults };
