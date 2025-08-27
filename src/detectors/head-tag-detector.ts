import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for head tags
 */
export async function checkHeadTags(page: Page, headTags: Array<{ tag: string; href?: string; rel?: string; [key: string]: any }>): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];

  for (const tagConfig of headTags) {
    let selector = tagConfig.tag;
    
    if (tagConfig.href) {
      selector += `[href*="${tagConfig.href}"]`;
    }
    if (tagConfig.rel) {
      selector += `[rel="${tagConfig.rel}"]`;
    }

    const found = await page.$(selector);
    if (found) {
      matches.push({
        type: 'headTag',
        value: selector,
        details: tagConfig
      });
    }
  }

  return matches;
}
