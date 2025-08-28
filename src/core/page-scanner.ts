import { chromium } from 'playwright';
import { FingerprintsConfig, ScanResult } from '../types';
import { detectCompetitors } from './competitor-detector';

/**
 * Scan a single page for competitors
 */
export async function scanPage(
  url: string,
  customer: string,
  pageName: string,
  fingerprints: FingerprintsConfig,
  options: { headless?: boolean; timeout?: number; userAgent?: string } = {}
): Promise<ScanResult> {
  const browser = await chromium.launch({ 
    headless: options.headless ?? true 
  });

  try {
    const context = await browser.newContext({
      userAgent: options.userAgent
    });
    const page = await context.newPage();

    // Track network requests - MUST be set up BEFORE navigation
    const networkRequests: Array<{ url: string; method: string; resourceType: string }> = [];
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: options.timeout || 30000
    });

    // Wait for dynamic content
    await page.waitForTimeout(3000);
    
    // Detect competitors (pass network requests for API detection)
    const competitors = await detectCompetitors(page, fingerprints.fingerprints, networkRequests);

    return {
      customer,
      pageName,
      url,
      timestamp: new Date(),
      competitors
    };
  } finally {
    await browser.close();
  }
}

/**
 * Scan multiple pages for competitors in parallel with concurrency limit
 */
export async function scanMultiplePages(
  pages: Array<{ url: string; customer: string; pageName: string }>,
  fingerprints: FingerprintsConfig,
  options: { headless?: boolean; timeout?: number; userAgent?: string; delay?: number; maxConcurrency?: number } = {}
): Promise<ScanResult[]> {
  const maxConcurrency = options.maxConcurrency || 10;
  const results: ScanResult[] = [];
  
  // Process pages in chunks with concurrency limit
  for (let i = 0; i < pages.length; i += maxConcurrency) {
    const chunk = pages.slice(i, i + maxConcurrency);
    
    console.log(`Processing batch ${Math.floor(i / maxConcurrency) + 1}/${Math.ceil(pages.length / maxConcurrency)} (${chunk.length} pages)`);
    
    const chunkPromises = chunk.map(async ({ url, customer, pageName }) => {
      try {
        console.log(`Scanning ${customer} - ${pageName}: ${url}`);
        return await scanPage(url, customer, pageName, fingerprints, options);
      } catch (error) {
        console.error(`Failed to scan ${url}:`, error);
        return null;
      }
    });
    
    const chunkResults = await Promise.all(chunkPromises);
    
    // Filter out failed scans (null results) and add successful ones
    results.push(...chunkResults.filter((result): result is ScanResult => result !== null));
  }

  return results;
}
