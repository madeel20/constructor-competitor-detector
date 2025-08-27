import { DetectionMatch, Fingerprint } from '../types';

/**
 * Calculate confidence score using a simple weighted formula:
 * 1. Each match type has a weight (points per match)
 * 2. Sum all points from matches found
 * 3. Convert to percentage with cap at 100%
 * 4. Apply minimum confidence for high-value matches
 */
export function calculateConfidence(matches: DetectionMatch[], fingerprint: Fingerprint): number {
  if (matches.length === 0) return 0;

  let totalScore = 0;

  // Define weights for different types of matches
  // High-value matches that strongly indicate competitor presence
  const weights = {
    script: {
      src: 40,        // Very high - specific CDN URLs are almost certain indicators
      keyword: 30,    // High - keywords in scripts are strong indicators
      id: 25          // High - script IDs are strong indicators
    },
    windowVariable: 35,    // Very high - window variables are almost certain indicators
    class: 8,             // Medium - CSS classes can be framework-specific (keep lower)
    dataAttribute: 15,    // Medium-high - data attributes are fairly unique
    apiRequest: 45,       // Highest - API calls are the strongest indicators
    cookie: 40,           // Very high - cookies are almost certain indicators
    headTag: 30           // High - head tags with specific hrefs are strong indicators
  };

  // Simple scoring: each match contributes points based on its type
  for (const match of matches) {
    switch (match.type) {
      case 'script':
        // Weight script matches by subtype
        if (match.details?.type === 'src') {
          totalScore += weights.script.src;
        } else if (match.details?.type === 'keyword') {
          totalScore += weights.script.keyword;
        } else if (match.details?.type === 'id') {
          totalScore += weights.script.id;
        }
        break;
      case 'windowVariable':
        totalScore += weights.windowVariable;
        break;
      case 'class':
        totalScore += weights.class;
        break;
      case 'dataAttribute':
        totalScore += weights.dataAttribute;
        break;
      case 'apiRequest':
        totalScore += weights.apiRequest;
        break;
      case 'cookie':
        totalScore += weights.cookie;
        break;
      case 'headTag':
        totalScore += weights.headTag;
        break;
    }
  }

  // Convert to percentage (capped at 100%)
  // Using a simple threshold: 100 points = 100% confidence
  let confidence = Math.min(100, Math.round((totalScore / 100) * 100));

  // Apply minimum confidence for high-value matches
  const hasHighValueMatch = matches.some(match => 
    (match.type === 'script' && match.details?.type === 'src') ||
    match.type === 'windowVariable' ||
    match.type === 'apiRequest' ||
    match.type === 'cookie' ||
    match.type === 'headTag'
  );

  if (hasHighValueMatch && confidence < 70) {
    confidence = 70; // Minimum 70% confidence for high-value matches
  }

  return confidence;
}
