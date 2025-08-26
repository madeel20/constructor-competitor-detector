import { Page } from 'playwright';
import { CompetitorFingerprint } from '../types';

export class FingerprintDetector {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async detectScripts(fingerprint: CompetitorFingerprint): Promise<string[]> {
    const matches: string[] = [];
    
    if (!fingerprint.scripts) return matches;

    // Check script sources
    if (fingerprint.scripts.src) {
      const scriptSources = await this.page.$$eval('script[src]', scripts => 
        scripts.map(script => (script as HTMLScriptElement).src)
      );
      
      for (const src of fingerprint.scripts.src) {
        if (scriptSources.some(scriptSrc => scriptSrc.includes(src) || src.includes(scriptSrc))) {
          matches.push(`script:${src}`);
        }
      }
    }

    // Check script IDs
    if (fingerprint.scripts.ids) {
      for (const id of fingerprint.scripts.ids) {
        const element = await this.page.$(`script#${id}`);
        if (element) {
          matches.push(`script-id:${id}`);
        }
      }
    }

    // Check for keywords in script content
    if (fingerprint.scripts.keywords) {
      const scriptContents = await this.page.$$eval('script', scripts => 
        scripts.map(script => script.textContent || '')
      );
      
      for (const keyword of fingerprint.scripts.keywords) {
        if (scriptContents.some(content => content.includes(keyword))) {
          matches.push(`script-keyword:${keyword}`);
        }
      }
    }

    return matches;
  }

  async detectWindowVariables(windowVariables: string[]): Promise<string[]> {
    const matches: string[] = [];
    
    for (const variable of windowVariables) {
      try {
        const hasVariable = await this.page.evaluate((varName) => {
          return typeof (window as any)[varName] !== 'undefined';
        }, variable);
        
        if (hasVariable) {
          matches.push(`window:${variable}`);
        }
      } catch (error) {
        // Variable check failed, continue with next
      }
    }
    
    return matches;
  }

  async detectDataAttributes(dataAttributes: string[]): Promise<string[]> {
    const matches: string[] = [];
    
    for (const attr of dataAttributes) {
      let selector: string;
      if (attr.endsWith('*')) {
        // Wildcard attribute
        const baseAttr = attr.slice(0, -1);
        selector = `[${baseAttr}]`;
      } else {
        selector = `[${attr}]`;
      }
      
      try {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          matches.push(`data-attr:${attr}`);
        }
      } catch (error) {
        // Selector failed, continue with next
      }
    }
    
    return matches;
  }

  async detectCookies(cookies: string[]): Promise<string[]> {
    const matches: string[] = [];
    const pageCookies = await this.page.context().cookies();
    
    for (const cookieName of cookies) {
      if (pageCookies.some(cookie => cookie.name.includes(cookieName))) {
        matches.push(`cookie:${cookieName}`);
      }
    }
    
    return matches;
  }

  async detectHeadTags(headTags: any[]): Promise<string[]> {
    const matches: string[] = [];
    
    for (const tag of headTags) {
      let selector = tag.tag;
      
      if (tag.href) {
        selector += `[href*="${tag.href}"]`;
      }
      if (tag.rel) {
        selector += `[rel="${tag.rel}"]`;
      }
      
      try {
        const element = await this.page.$(`head ${selector}`);
        if (element) {
          matches.push(`head-tag:${selector}`);
        }
      } catch (error) {
        // Selector failed, continue with next
      }
    }
    
    return matches;
  }

  async detectClasses(classesList: string[]): Promise<string[]> {
    const matches: string[] = [];
    
    for (const className of classesList) {
      try {
        const element = await this.page.$(`.${className}`);
        if (element) {
          matches.push(`class:${className}`);
        }
      } catch (error) {
        // Selector failed, continue with next
      }
    }
    
    return matches;
  }

  async detectApiRequests(apiUrls: string[]): Promise<string[]> {
    const matches: string[] = [];
    const interceptedRequests: string[] = [];
    
    // Set up request interception
    this.page.on('request', request => {
      interceptedRequests.push(request.url());
    });
    
    // Wait a bit to capture network requests
    await this.page.waitForTimeout(2000);
    
    for (const apiUrl of apiUrls) {
      if (interceptedRequests.some(url => url.includes(apiUrl))) {
        matches.push(`api:${apiUrl}`);
      }
    }
    
    return matches;
  }
}
