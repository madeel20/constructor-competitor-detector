import { promises as fs } from 'fs';
import * as path from 'path';
import { scanMultiplePages } from './core/page-scanner';
import { ScanResult, ScanSummary } from './types';
import { customersConfig, fingerprintsConfig, envConfig } from './config';

/**
 * Save scan results to file
 */
async function saveResults(results: ScanResult[]): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `scan-results-${timestamp}.json`;
  const outputPath = path.join(__dirname, '../results', filename);
  
  // Ensure results directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  const summary: ScanSummary = {
    totalPages: results.length,
    successfulScans: results.filter(r => r.success).length,
    failedScans: results.filter(r => !r.success).length,
    results
  };
  
  await fs.writeFile(outputPath, JSON.stringify(summary, null, 2));
  console.log(`Results saved to: ${outputPath}`);
}

/**
 * Main function to run the competitor detection
 */
async function main() {
  try {
    console.log('Loading configuration...');
    let customers = customersConfig.customers;
    
    // Filter customers if specified
    if (envConfig.customerFilter) {
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(envConfig.customerFilter!.toLowerCase())
      );
      
      if (customers.length === 0) {
        console.error(`❌ No customers found matching "${envConfig.customerFilter}"`);
        console.log(`📁 Check customer names in: src/config/customers.ts`);
        process.exit(1);
      }
    }
    
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
      headless: envConfig.headless,
      timeout: envConfig.timeout,
      userAgent: envConfig.userAgent,
      maxConcurrency: envConfig.batchSize,
      delay: 1000 // 1 second delay between requests
    });

    // Save results
    await saveResults(results);

    // Print summary
    console.log('\n=== SCAN SUMMARY ===');
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    console.log(`📊 Total scans: ${results.length} | ✅ Successful: ${successfulResults.length} | ❌ Failed: ${failedResults.length}`);
    
    // Report successful scans
    successfulResults.forEach(result => {
      const detectedCompetitors = result.competitors?.filter(c => c.detected) || [];
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
              if (match.details.pattern) {
                console.log(`        → Matched regex pattern: ${match.details.pattern}`);
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
    
    // Report failed scans
    if (failedResults.length > 0) {
      console.log('\n=== FAILED SCANS ===');
      failedResults.forEach(result => {
        console.log(`\n❌ ${result.customer} - ${result.pageName} (${result.url}):`);
        console.log(`   Error: ${result.error?.type}: ${result.error?.message}`);
      });
    }

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
