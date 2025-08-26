export interface Customer {
  name: string;
  pages: Array<{
    name: string;
    url: string;
  }>;
}

export interface Fingerprint {
  scripts?: {
    src?: string[];
    ids?: string[];
    keywords?: string[];
  };
  apiRequestsURLs?: string[];
  windowVariables?: string[];
  dataAttributes?: string[];
  cookies?: string[];
  headTags?: Array<{
    tag: string;
    href?: string;
    rel?: string;
    [key: string]: any;
  }>;
  classesList?: string[];
}

export interface FingerprintsConfig {
  fingerprints: {
    [competitorName: string]: Fingerprint;
  };
}

export interface DetectionMatch {
  type: 'script' | 'apiRequest' | 'windowVariable' | 'dataAttribute' | 'cookie' | 'headTag' | 'class';
  value: string;
  details?: any;
}

export interface CompetitorDetection {
  competitor: string;
  detected: boolean;
  matches: DetectionMatch[];
  confidence: number;
}

export interface ScanResult {
  customer: string;
  pageName: string;
  url: string;
  timestamp: Date;
  competitors: CompetitorDetection[];
}
