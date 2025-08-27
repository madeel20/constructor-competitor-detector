import { DetectionMatch, Fingerprint } from '../types';

/**
 * Calculate confidence score based on matches with weighted scoring
 */
export function calculateConfidence(matches: DetectionMatch[], fingerprint: Fingerprint): number {
  if (matches.length === 0) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;

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

    // Score based on number and type - each match is very valuable
    totalScore += srcMatches.length * weights.script.src;
    totalScore += keywordMatches.length * weights.script.keyword;
    totalScore += idMatches.length * weights.script.id;
  }

  // Window variables - very high value indicators
  if (matchesByType.windowVariable) {
    const count = matchesByType.windowVariable.length;
    totalScore += count * weights.windowVariable;
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

  // API requests - strongest indicators
  if (matchesByType.apiRequest) {
    const count = matchesByType.apiRequest.length;
    totalScore += count * weights.apiRequest; // Each API call is extremely valuable
  }

  // Cookies - very strong and unique indicators
  if (matchesByType.cookie) {
    const count = matchesByType.cookie.length;
    totalScore += count * weights.cookie;
  }

  // Head tags - strong indicators when specific
  if (matchesByType.headTag) {
    const count = matchesByType.headTag.length;
    totalScore += count * weights.headTag;
  }

  // Calculate max possible score based on what's available in fingerprint
  if (fingerprint.scripts) {
    maxPossibleScore += (fingerprint.scripts.src?.length || 0) * weights.script.src;
    maxPossibleScore += (fingerprint.scripts.keywords?.length || 0) * weights.script.keyword;
    maxPossibleScore += (fingerprint.scripts.ids?.length || 0) * weights.script.id;
  }
  if (fingerprint.windowVariables) {
    maxPossibleScore += fingerprint.windowVariables.length * weights.windowVariable;
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
    maxPossibleScore += fingerprint.headTags.length * weights.headTag;
  }

  // Calculate percentage, but also apply bonus for diverse match types
  let baseConfidence = Math.min(100, Math.round((totalScore / Math.max(maxPossibleScore, 1)) * 100));

  // Special case: If we have any high-value matches, ensure minimum confidence
  const hasHighValueMatch = 
    matchesByType.script?.some(m => m.details?.type === 'src') ||
    matchesByType.windowVariable?.length > 0 ||
    matchesByType.apiRequest?.length > 0 ||
    matchesByType.cookie?.length > 0 ||
    matchesByType.headTag?.length > 0;

  if (hasHighValueMatch && baseConfidence < 70) {
    baseConfidence = 70; // Minimum 70% confidence for high-value matches
  }

  // Bonus for match diversity (having different types of matches)
  const matchTypes = Object.keys(matchesByType);
  if (matchTypes.length >= 3) {
    baseConfidence = Math.min(100, baseConfidence + 15); // +15% for high diversity
  } else if (matchTypes.length >= 2) {
    baseConfidence = Math.min(100, baseConfidence + 8);  // +8% for medium diversity
  }

  // Bonus for high-value combinations
  if (matchesByType.script && matchesByType.windowVariable) {
    baseConfidence = Math.min(100, baseConfidence + 10); // Scripts + window vars = very strong combo
  }
  if (matchesByType.apiRequest && (matchesByType.script || matchesByType.windowVariable)) {
    baseConfidence = Math.min(100, baseConfidence + 15); // API + other tech = extremely strong
  }
  if (matchesByType.apiRequest && matchesByType.cookie) {
    baseConfidence = Math.min(100, baseConfidence + 12); // API + cookies = near certain
  }

  return baseConfidence;
}
