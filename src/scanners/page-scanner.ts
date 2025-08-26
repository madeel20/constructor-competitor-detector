import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { CompetitorAnalyzer } from '../analyzers/competitor-analyzer';
import { DetectionResult, ScanConfig, FingerprintsConfig } from '../types';

export class PageScanner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async initialize(config: ScanConfig): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: config.headless ?? true 
    });
    
    this.context = await this.browser.newContext({
      userAgent: config.userAgent
    });
  }

  async scanPage(
    url: string, 
    customerName: string,
    fingerprints: FingerprintsConfig,
    timeout: number = 30000
  ): Promise<DetectionResult> {
    if (!this.context) {
      throw new Error('Scanner not initialized. Call initialize() first.');
    }

    const page = await this.context.newPage();
    
    try {
      // Navigate to the page with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout 
      });

      // Wait a bit for dynamic content to load
      await page.waitForTimeout(3000);

      const analyzer = new CompetitorAnalyzer(page);
      const result = await analyzer.analyzeAllCompetitors(
        customerName,
        url,
        fingerprints.fingerprints
      );

      return result;
    } catch (error) {
      console.error(`Error scanning ${url}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async scanMultiplePages(
    urls: Array<{ url: string; customerName: string; pageName: string }>,
    fingerprints: FingerprintsConfig,
    timeout: number = 30000
  ): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];

    for (const { url, customerName, pageName } of urls) {
      try {
        console.log(`Scanning ${customerName} - ${pageName}: ${url}`);
        const result = await this.scanPage(url, customerName, fingerprints, timeout);
        results.push(result);
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to scan ${url}:`, error);
        // Continue with other pages even if one fails
      }
    }

    return results;
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}
