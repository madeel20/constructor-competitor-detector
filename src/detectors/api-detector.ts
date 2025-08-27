import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for API requests (simplified - checks for URLs in network requests)
 */
export async function checkAPIRequests(page: Page, urls: string[]): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];
  
  // This is a simplified version - in practice, you'd set up request interceptors
  // For now, we'll check if these URLs appear in the page source or scripts
  const pageContent = await page.content();
  
  for (const url of urls) {
    if (pageContent.includes(url)) {
      matches.push({
        type: 'apiRequest',
        value: url
      });
    }
  }

  return matches;
}
