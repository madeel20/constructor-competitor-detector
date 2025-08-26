import { chromium, Browser, Page } from 'playwright';
import { FingerprintsConfig, Fingerprint, ScanResult, CompetitorDetection, DetectionMatch } from './types';

/**
 * Detects competitors on a page based on fingerprints
 */
export async function detectCompetitors(
  page: Page,
  fingerprints: { [competitorName: string]: Fingerprint }
): Promise<CompetitorDetection[]> {
  const results: CompetitorDetection[] = [];

  for (const [competitorName, fingerprint] of Object.entries(fingerprints)) {
    const matches: DetectionMatch[] = [];

    // Check scripts
    if (fingerprint.scripts) {
      const scriptMatches = await checkScripts(page, fingerprint.scripts);
      matches.push(...scriptMatches);
    }

    // Check window variables
    if (fingerprint.windowVariables) {
      const windowMatches = await checkWindowVariables(page, fingerprint.windowVariables);
      matches.push(...windowMatches);
    }

    // Check CSS classes
    if (fingerprint.classesList) {
      const classMatches = await checkCSSClasses(page, fingerprint.classesList);
      matches.push(...classMatches);
    }

    // Check data attributes
    if (fingerprint.dataAttributes) {
      const dataMatches = await checkDataAttributes(page, fingerprint.dataAttributes);
      matches.push(...dataMatches);
    }

    // Check API requests (from network activity)
    if (fingerprint.apiRequestsURLs) {
      const apiMatches = await checkAPIRequests(page, fingerprint.apiRequestsURLs);
      matches.push(...apiMatches);
    }

    // Check cookies
    if (fingerprint.cookies) {
      const cookieMatches = await checkCookies(page, fingerprint.cookies);
      matches.push(...cookieMatches);
    }

    // Check head tags
    if (fingerprint.headTags) {
      const headMatches = await checkHeadTags(page, fingerprint.headTags);
      matches.push(...headMatches);
    }

    const detected = matches.length > 0;
    const confidence = calculateConfidence(matches, fingerprint);

    results.push({
      competitor: competitorName,
      detected,
      matches,
      confidence
    });
  }

  return results;
}

/**
 * Check for script-related fingerprints
 */
async function checkScripts(
  page: Page,
  scripts: { src?: string[]; ids?: string[]; keywords?: string[] }
): Promise<DetectionMatch[]> {
  const matches: DetectionMatch[] = [];    // Check script sources
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
    }    // Check script IDs
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

/**
 * Check for window variables
 */
async function checkWindowVariables(page: Page, variables: string[]): Promise<DetectionMatch[]> {
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

/**
 * Check for CSS classes
 */
async function checkCSSClasses(page: Page, classes: string[]): Promise<DetectionMatch[]> {
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

/**
 * Check for data attributes
 */
async function checkDataAttributes(page: Page, attributes: string[]): Promise<DetectionMatch[]> {
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

/**
 * Check for API requests (simplified - checks for URLs in network requests)
 */
async function checkAPIRequests(page: Page, urls: string[]): Promise<DetectionMatch[]> {
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

/**
 * Check for cookies
 */
async function checkCookies(page: Page, cookieNames: string[]): Promise<DetectionMatch[]> {
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

/**
 * Check for head tags
 */
async function checkHeadTags(page: Page, headTags: Array<{ tag: string; href?: string; rel?: string; [key: string]: any }>): Promise<DetectionMatch[]> {
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

/**
 * Calculate confidence score based on matches with weighted scoring
 */
function calculateConfidence(matches: DetectionMatch[], fingerprint: Fingerprint): number {
  if (matches.length === 0) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Define weights for different types of matches
  const weights = {
    script: {
      src: 15,        // High confidence - specific CDN URLs are strong indicators
      keyword: 10,    // Medium-high - keywords in scripts are good indicators
      id: 8          // Medium - script IDs are fairly reliable
    },
    windowVariable: 12,    // High - window variables are strong indicators
    class: 8,             // Medium - CSS classes can be framework-specific
    dataAttribute: 10,    // Medium-high - data attributes are often unique
    apiRequest: 15,       // High - API calls are very specific
    cookie: 12,           // High - cookies are usually unique to services
    headTag: 6            // Lower - head tags can be common
  };

  // Calculate scores for each match type
  const matchesByType = matches.reduce((acc, match) => {
    if (!acc[match.type]) acc[match.type] = [];
    acc[match.type].push(match);
    return acc;
  }, {} as { [key: string]: DetectionMatch[] });

  // Script matches - with sub-type weighting
  if (matchesByType.script) {
    const scriptMatches = matchesByType.script;
    const srcMatches = scriptMatches.filter(m => m.details?.type === 'src');
    const keywordMatches = scriptMatches.filter(m => m.details?.type === 'keyword');
    const idMatches = scriptMatches.filter(m => m.details?.type === 'id');

    // Score based on number and type, with diminishing returns
    totalScore += Math.min(srcMatches.length * weights.script.src, weights.script.src * 3);
    totalScore += Math.min(keywordMatches.length * weights.script.keyword, weights.script.keyword * 2);
    totalScore += Math.min(idMatches.length * weights.script.id, weights.script.id * 2);
  }

  // Window variables - high value but with diminishing returns
  if (matchesByType.windowVariable) {
    const count = matchesByType.windowVariable.length;
    totalScore += Math.min(count * weights.windowVariable, weights.windowVariable * 3);
  }

  // CSS classes - common but multiple matches increase confidence
  if (matchesByType.class) {
    const count = matchesByType.class.length;
    // More classes = higher confidence, but with diminishing returns
    if (count >= 5) {
      totalScore += weights.class * 2; // Strong indicator if many classes found
    } else if (count >= 2) {
      totalScore += weights.class * 1.5;
    } else {
      totalScore += weights.class;
    }
  }

  // Data attributes - valuable indicators
  if (matchesByType.dataAttribute) {
    const count = matchesByType.dataAttribute.length;
    totalScore += Math.min(count * weights.dataAttribute, weights.dataAttribute * 2);
  }

  // API requests - very strong indicators
  if (matchesByType.apiRequest) {
    const count = matchesByType.apiRequest.length;
    totalScore += count * weights.apiRequest; // No cap - each API call is valuable
  }

  // Cookies - strong and unique indicators
  if (matchesByType.cookie) {
    const count = matchesByType.cookie.length;
    totalScore += count * weights.cookie;
  }

  // Head tags - less reliable but still valuable
  if (matchesByType.headTag) {
    const count = matchesByType.headTag.length;
    totalScore += Math.min(count * weights.headTag, weights.headTag * 2);
  }

  // Calculate max possible score based on what's available in fingerprint
  if (fingerprint.scripts) {
    maxPossibleScore += (fingerprint.scripts.src?.length || 0) * weights.script.src;
    maxPossibleScore += (fingerprint.scripts.keywords?.length || 0) * weights.script.keyword;
    maxPossibleScore += (fingerprint.scripts.ids?.length || 0) * weights.script.id;
  }
  if (fingerprint.windowVariables) {
    maxPossibleScore += Math.min(fingerprint.windowVariables.length * weights.windowVariable, weights.windowVariable * 3);
  }
  if (fingerprint.classesList && fingerprint.classesList.length > 0) {
    if (fingerprint.classesList.length >= 5) {
      maxPossibleScore += weights.class * 2;
    } else if (fingerprint.classesList.length >= 2) {
      maxPossibleScore += weights.class * 1.5;
    } else {
      maxPossibleScore += weights.class;
    }
  }
  if (fingerprint.dataAttributes) {
    maxPossibleScore += Math.min(fingerprint.dataAttributes.length * weights.dataAttribute, weights.dataAttribute * 2);
  }
  if (fingerprint.apiRequestsURLs) {
    maxPossibleScore += fingerprint.apiRequestsURLs.length * weights.apiRequest;
  }
  if (fingerprint.cookies) {
    maxPossibleScore += fingerprint.cookies.length * weights.cookie;
  }
  if (fingerprint.headTags) {
    maxPossibleScore += Math.min(fingerprint.headTags.length * weights.headTag, weights.headTag * 2);
  }

  // Calculate percentage, but also apply bonus for diverse match types
  let baseConfidence = Math.min(100, Math.round((totalScore / Math.max(maxPossibleScore, 1)) * 100));

  // Bonus for match diversity (having different types of matches)
  const matchTypes = Object.keys(matchesByType);
  if (matchTypes.length >= 3) {
    baseConfidence = Math.min(100, baseConfidence + 10); // +10% for high diversity
  } else if (matchTypes.length >= 2) {
    baseConfidence = Math.min(100, baseConfidence + 5);  // +5% for medium diversity
  }

  // Bonus for high-value combinations
  if (matchesByType.script && matchesByType.windowVariable) {
    baseConfidence = Math.min(100, baseConfidence + 5); // Scripts + window vars = strong combo
  }
  if (matchesByType.apiRequest && (matchesByType.script || matchesByType.windowVariable)) {
    baseConfidence = Math.min(100, baseConfidence + 8); // API + other tech = very strong
  }

  return baseConfidence;
}

/**
 * Scan a single page for competitors
 */
export async function scanPage(
  url: string,
  customer: string,
  pageName: string,
  fingerprints: FingerprintsConfig,
  options: { headless?: boolean; timeout?: number } = {}
): Promise<ScanResult> {
  const browser = await chromium.launch({ 
    headless: options.headless ?? true 
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: options.timeout || 30000
    });

    // Wait for dynamic content
    await page.waitForTimeout(3000);

    // Detect competitors
    const competitors = await detectCompetitors(page, fingerprints.fingerprints);

    return {
      customer,
      pageName,
      url,
      timestamp: new Date(),
      competitors
    };
  } finally {
    await browser.close();
  }
}

/**
 * Scan multiple pages for competitors
 */
export async function scanMultiplePages(
  pages: Array<{ url: string; customer: string; pageName: string }>,
  fingerprints: FingerprintsConfig,
  options: { headless?: boolean; timeout?: number; delay?: number } = {}
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  for (const { url, customer, pageName } of pages) {
    try {
      console.log(`Scanning ${customer} - ${pageName}: ${url}`);
      const result = await scanPage(url, customer, pageName, fingerprints, options);
      results.push(result);
      
      // Add delay between requests to be respectful
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    } catch (error) {
      console.error(`Failed to scan ${url}:`, error);
      // Continue with other pages
    }
  }

  return results;
}
