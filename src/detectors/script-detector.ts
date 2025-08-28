import { Page } from 'playwright';
import { DetectionMatch } from '../types';
import { ScriptTag } from '../config/types';

/**
 * Check for script-related fingerprints
 */
export async function checkScripts(
  page: Page,
  scripts: { tags?: ScriptTag[]; ids?: string[]; keywords?: string[] }
): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];

  // Check script sources (new structured approach)
  if (scripts.tags) {
    // Get all script sources from the page once
    const allScriptSrcs = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.map((script: any) => script.src).filter(Boolean);
    });

    for (const scriptItem of scripts.tags) {
      let matchFound = false;
      let matchDetails: any = {};

      // First try exact matches
      if (scriptItem.src && !matchFound) {
        for (const exactSrc of scriptItem.src) {
          const found = await page.$(`script[src*="${exactSrc}"]`);
          if (found) {
            const actualSrc = await found.getAttribute('src');
            matchFound = true;
            matchDetails = {
              type: 'src',
              actualValue: actualSrc,
              exactMatch: exactSrc,
              selector: `script[src*="${exactSrc}"]`
            };
            break;
          }
        }
      }

      // If no exact match found, try regex patterns
      if (scriptItem.srcRegex && !matchFound) {
        for (const regexPattern of scriptItem.srcRegex) {
          try {
            const regex = new RegExp(regexPattern);
            for (const scriptSrc of allScriptSrcs) {
              if (regex.test(scriptSrc)) {
                matchFound = true;
                matchDetails = {
                  type: 'srcRegex',
                  actualValue: scriptSrc,
                  pattern: regexPattern,
                  selector: `script[src="${scriptSrc}"]`
                };
                break;
              }
            }
            if (matchFound) break;
          } catch (error) {
            console.warn(`Invalid regex pattern: ${regexPattern}`, error);
          }
        }
      }

      // If we found a match for this script item, add it to matches
      if (matchFound) {
        matches.push({
          type: 'script',
          value: scriptItem.title,
          details: matchDetails
        });
      }
    }
  }

  // Check script IDs
  if (scripts.ids) {
    for (const id of scripts.ids) {
      const found = await page.$(`script#${id}`);
      if (found) {
        const actualId = await found.getAttribute('id');
        matches.push({
          type: 'script',
          value: id,
          details: { type: 'id', actualValue: actualId, selector: `script#${id}` }
        });
      }
    }
  }

  // Check for keywords in script content
  if (scripts.keywords) {
    const scriptContents = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.map((script: any) => script.textContent || '').join(' ');
    });

    for (const keyword of scripts.keywords) {
      if (scriptContents.includes(keyword)) {
        // Find which script(s) contain the keyword for more detail
        const scriptDetails = await page.evaluate((kw) => {
          const scripts = Array.from(document.querySelectorAll('script'));
          const matchingScripts: Array<{src?: string, id?: string, hasContent: boolean}> = [];
          scripts.forEach((script: any) => {
            if (script.textContent && script.textContent.includes(kw)) {
              matchingScripts.push({
                src: script.src || undefined,
                id: script.id || undefined,
                hasContent: !!script.textContent
              });
            }
          });
          return matchingScripts;
        }, keyword);

        matches.push({
          type: 'script',
          value: keyword,
          details: { type: 'keyword', foundIn: scriptDetails }
        });
      }
    }
  }

  return matches;
}
