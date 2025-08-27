import { Page } from 'playwright';
import { Fingerprint, CompetitorDetection, DetectionMatch } from '../types';
import { checkScripts } from '../detectors/script-detector';
import { checkWindowVariables } from '../detectors/window-detector';
import { checkCSSClasses } from '../detectors/css-detector';
import { checkDataAttributes } from '../detectors/attribute-detector';
import { checkAPIRequests } from '../detectors/api-detector';
import { checkCookies } from '../detectors/cookie-detector';
import { checkHeadTags } from '../detectors/head-tag-detector';
import { calculateConfidence } from '../utils/confidence-calculator';

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
