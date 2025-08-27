// Re-export config types for backward compatibility
export type { 
  CustomerConfig as Customer, 
  CompetitorFingerprint as Fingerprint,
  FingerprintsConfig,
  PageConfig
} from './config';

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
