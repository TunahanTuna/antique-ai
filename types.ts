export interface AntiqueAnalysis {
  title: string;
  estimatedDate: string;
  origin: string;
  style: string;
  confidenceScore: number;
  estimatedValue: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  restorationTips: string[];
  historicalContext: string;
  detailedHistory: string;
  searchQueries: string[];
  keyFeatures: string[];
  isAuthentic: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface HistoryItem extends AntiqueAnalysis {
  id: string;
  imageUrl: string;
  timestamp: number;
}