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
  options: { headless?: boolean; timeout?: number } = {}
): Promise<ScanResult> {
  const browser = await chromium.launch({ 
    headless: options.headless ?? true 
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: options.timeout || 30000
    });

    // Wait for dynamic content
    await page.waitForTimeout(3000);

    // Detect competitors
    const competitors = await detectCompetitors(page, fingerprints.fingerprints);

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
 * Scan multiple pages for competitors
 */
export async function scanMultiplePages(
  pages: Array<{ url: string; customer: string; pageName: string }>,
  fingerprints: FingerprintsConfig,
  options: { headless?: boolean; timeout?: number; delay?: number } = {}
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  for (const { url, customer, pageName } of pages) {
    try {
      console.log(`Scanning ${customer} - ${pageName}: ${url}`);
      const result = await scanPage(url, customer, pageName, fingerprints, options);
      results.push(result);
      
      // Add delay between requests to be respectful
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    } catch (error) {
      console.error(`Failed to scan ${url}:`, error);
      // Continue with other pages
    }
  }

  return results;
}
