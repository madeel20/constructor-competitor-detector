import { Page } from 'playwright';
import { DetectionMatch } from '../types';

/**
 * Check for script-related fingerprints
 */
export async function checkScripts(
  page: Page,
  scripts: { src?: string[]; ids?: string[]; keywords?: string[] }
): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];

  // Check script sources
  if (scripts.src) {
    for (const src of scripts.src) {
      const found = await page.$(`script[src*="${src}"]`);
      if (found) {
        const actualSrc = await found.getAttribute('src');
        matches.push({
          type: 'script',
          value: src,
          details: { type: 'src', actualValue: actualSrc, selector: `script[src*="${src}"]` }
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
