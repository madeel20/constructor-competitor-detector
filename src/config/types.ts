export interface PageConfig {
  name: string;
  url: string;
}

export interface CustomerConfig {
  name: string;
  pages: PageConfig[];
}

export interface CustomersConfig {
  customers: CustomerConfig[];
}

export interface ScriptTag {
  title: string;
  src?: string[];
  srcRegex?: string[];
}

export interface ScriptFingerprint {
  tags?: ScriptTag[];
  ids?: string[];
  keywords?: string[];
}

export interface HeadTagFingerprint {
  tag: string;
  href?: string;
  rel?: string;
  [key: string]: any;
}

export interface CompetitorFingerprint {
  scripts?: ScriptFingerprint;
  apiRequestsURLs?: string[];
  windowVariables?: string[];
  dataAttributes?: string[];
  cookies?: string[];
  headTags?: HeadTagFingerprint[];
  classesList?: string[];
}

export interface FingerprintsConfig {
  fingerprints: {
    [competitorName: string]: CompetitorFingerprint;
  };
}
