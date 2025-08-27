import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for CSS classes
 */
export async function checkCSSClasses(page: Page, classes: string[]): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];

  for (const className of classes) {
    // Handle wildcard classes
    if (className.includes('*')) {
      const baseClass = className.replace('*', '');
      const elements = await page.$$(`[class*="${baseClass}"]`);
      if (elements.length > 0) {
        const actualClasses = await Promise.all(
          elements.slice(0, 3).map(el => el.getAttribute('class'))
        );
        matches.push({
          type: 'class',
          value: className,
          details: { 
            matchCount: elements.length,
            actualClasses: actualClasses.filter(Boolean),
            selector: `[class*="${baseClass}"]`
          }
        });
      }
    } else {
      const found = await page.$(`.${className}`);
      if (found) {
        const actualClass = await found.getAttribute('class');
        matches.push({
          type: 'class',
          value: className,
          details: { 
            actualClass,
            selector: `.${className}`
          }
        });
      }
    }
  }

  return matches;
}
