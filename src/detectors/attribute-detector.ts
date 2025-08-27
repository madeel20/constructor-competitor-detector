import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for data attributes
 */
export async function checkDataAttributes(page: Page, attributes: string[]): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];

  for (const attr of attributes) {
    // Handle wildcard attributes
    if (attr.includes('*')) {
      const baseAttr = attr.replace('*', '');
      const elements = await page.$$(`[${baseAttr}]`);
      if (elements.length > 0) {
        const actualAttrs = await Promise.all(
          elements.slice(0, 3).map(async el => {
            const attrs: {[key: string]: string} = {};
            const attributeNames = await el.evaluate((element: any) => {
              return Array.from(element.attributes).map((attr: any) => attr.name);
            });
            for (const name of attributeNames) {
              if (name.includes(baseAttr)) {
                attrs[name] = await el.getAttribute(name) || '';
              }
            }
            return attrs;
          })
        );
        matches.push({
          type: 'dataAttribute',
          value: attr,
          details: { 
            matchCount: elements.length,
            actualAttributes: actualAttrs,
            selector: `[${baseAttr}]`
          }
        });
      }
    } else {
      const found = await page.$(`[${attr}]`);
      if (found) {
        const actualValue = await found.getAttribute(attr);
        matches.push({
          type: 'dataAttribute',
          value: attr,
          details: { 
            actualValue,
            selector: `[${attr}]`
          }
        });
      }
    }
  }

  return matches;
}
