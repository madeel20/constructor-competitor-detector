import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for window variables
 */
export async function checkWindowVariables(page: Page, variables: string[]): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];

  for (const variable of variables) {
    const result = await page.evaluate((varName) => {
      const win = window as any;
      const exists = typeof win[varName] !== 'undefined';
      let value = null;
      if (exists) {
        try {
          // Try to get some info about the value without breaking anything
          const val = win[varName];
          if (typeof val === 'function') {
            value = '[Function]';
          } else if (typeof val === 'object' && val !== null) {
            value = '[Object]';
          } else {
            value = String(val).substring(0, 100); // Limit length
          }
        } catch (e) {
          value = '[Inaccessible]';
        }
      }
      return { exists, value };
    }, variable);

    if (result.exists) {
      matches.push({
        type: 'windowVariable',
        value: variable,
        details: { actualValue: result.value }
      });
    }
  }

  return matches;
}
