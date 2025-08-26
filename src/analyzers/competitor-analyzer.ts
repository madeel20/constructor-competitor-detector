import { Page } from 'playwright';
import { FingerprintDetector } from '../detectors/fingerprint-detector';
import { CompetitorFingerprint, DetectionResult } from '../types';

export class CompetitorAnalyzer {
  private page: Page;
  private detector: FingerprintDetector;

  constructor(page: Page) {
    this.page = page;
    this.detector = new FingerprintDetector(page);
  }

  async analyzeCompetitor(
    competitorName: string, 
    fingerprint: CompetitorFingerprint
  ): Promise<{ confidence: number; matches: any }> {
    const allMatches: any = {};
    let totalPossibleMatches = 0;
    let actualMatches = 0;

    // Detect scripts
    if (fingerprint.scripts) {
      const scriptMatches = await this.detector.detectScripts(fingerprint);
      if (scriptMatches.length > 0) {
        allMatches.scripts = scriptMatches;
        actualMatches += scriptMatches.length;
      }
      
      const possibleScriptMatches = (fingerprint.scripts.src?.length || 0) + 
                                   (fingerprint.scripts.ids?.length || 0) + 
                                   (fingerprint.scripts.keywords?.length || 0);
      totalPossibleMatches += possibleScriptMatches;
    }

    // Detect window variables
    if (fingerprint.windowVariables) {
      const windowMatches = await this.detector.detectWindowVariables(fingerprint.windowVariables);
      if (windowMatches.length > 0) {
        allMatches.windowVariables = windowMatches;
        actualMatches += windowMatches.length;
      }
      totalPossibleMatches += fingerprint.windowVariables.length;
    }

    // Detect data attributes
    if (fingerprint.dataAttributes) {
      const dataAttrMatches = await this.detector.detectDataAttributes(fingerprint.dataAttributes);
      if (dataAttrMatches.length > 0) {
        allMatches.dataAttributes = dataAttrMatches;
        actualMatches += dataAttrMatches.length;
      }
      totalPossibleMatches += fingerprint.dataAttributes.length;
    }

    // Detect cookies
    if (fingerprint.cookies) {
      const cookieMatches = await this.detector.detectCookies(fingerprint.cookies);
      if (cookieMatches.length > 0) {
        allMatches.cookies = cookieMatches;
        actualMatches += cookieMatches.length;
      }
      totalPossibleMatches += fingerprint.cookies.length;
    }

    // Detect head tags
    if (fingerprint.headTags) {
      const headTagMatches = await this.detector.detectHeadTags(fingerprint.headTags);
      if (headTagMatches.length > 0) {
        allMatches.headTags = headTagMatches;
        actualMatches += headTagMatches.length;
      }
      totalPossibleMatches += fingerprint.headTags.length;
    }

    // Detect classes
    if (fingerprint.classesList) {
      const classMatches = await this.detector.detectClasses(fingerprint.classesList);
      if (classMatches.length > 0) {
        allMatches.classes = classMatches;
        actualMatches += classMatches.length;
      }
      totalPossibleMatches += fingerprint.classesList.length;
    }

    // Detect API requests
    if (fingerprint.apiRequestsURLs) {
      const apiMatches = await this.detector.detectApiRequests(fingerprint.apiRequestsURLs);
      if (apiMatches.length > 0) {
        allMatches.apiRequests = apiMatches;
        actualMatches += apiMatches.length;
      }
      totalPossibleMatches += fingerprint.apiRequestsURLs.length;
    }

    const confidence = totalPossibleMatches > 0 ? (actualMatches / totalPossibleMatches) * 100 : 0;

    return {
      confidence: Math.round(confidence * 100) / 100,
      matches: allMatches
    };
  }

  async analyzeAllCompetitors(
    customerName: string,
    pageUrl: string,
    fingerprints: { [key: string]: CompetitorFingerprint }
  ): Promise<DetectionResult> {
    const detectedCompetitors: any = {};

    for (const [competitorName, fingerprint] of Object.entries(fingerprints)) {
      try {
        const analysis = await this.analyzeCompetitor(competitorName, fingerprint);
        
        // Only include competitors with some confidence
        if (analysis.confidence > 0) {
          detectedCompetitors[competitorName] = analysis;
        }
      } catch (error) {
        console.error(`Error analyzing ${competitorName}:`, error);
      }
    }

    return {
      customerName,
      pageUrl,
      detectedCompetitors,
      timestamp: new Date().toISOString()
    };
  }
}
