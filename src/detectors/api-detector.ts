import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for API requests by analyzing captured network traffic
 */
export async function checkAPIRequests(
  page: Page, 
  urls: string[], 
  networkRequests?: Array<{ url: string; method: string; resourceType: string }>
): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];
  const detectedRequests = new Set<string>();
  // Analyze pre-captured network requests
  if (networkRequests) {
    for (const request of networkRequests) {
      for (const targetUrl of urls) {
        if (request.url.includes(targetUrl) || request.url.startsWith(targetUrl)) {
          if (!detectedRequests.has(request.url)) {
            detectedRequests.add(request.url);
            matches.push({
              type: 'apiRequest',
              value: request.url
            });
          }
        }
      }
    }
  }

  return matches;
}
