import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for cookies
 */
export async function checkCookies(page: Page, cookieNames: string[]): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];
  const cookies = await page.context().cookies();

  for (const cookieName of cookieNames) {
    const found = cookies.find(cookie => 
      cookie.name.includes(cookieName.replace('*', ''))
    );
    
    if (found) {
      matches.push({
        type: 'cookie',
        value: cookieName,
        details: { name: found.name }
      });
    }
  }

  return matches;
}
