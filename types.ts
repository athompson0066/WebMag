export type CoverLayoutType = 'minimal' | 'brutalist' | 'classic' | 'gradient' | 'grid' | 'hero';

export interface CoverConfig {
  layoutId: CoverLayoutType;
  title: string;
  subtitle: string;
  accentColor: string;
  secondaryColor: string;
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
}

export interface ListicleItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  price?: string;
  // inlineHtml is used for AI-generated micro-data visualizations
  inlineHtml?: string;
}

export interface ListicleData {
  sidebarImage?: string;
  items: ListicleItem[];
}

export interface WebsiteSlide {
  id: string;
  type: 'external' | 'internal';
  url?: string;
  content?: string;
  audioData?: string; // Base64 encoded raw PCM (24kHz)
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  price?: string;
  accentColor?: string;
  listicleData?: ListicleData;
  webhookUrl?: string; // Integration endpoint for interactive widgets
  googleSheetSubmissionUrl?: string; // Target for lead generation form results
}

export interface MagazineIssue {
  id: string;
  name: string;
  description: string;
  slides: WebsiteSlide[];
}

export enum AppState {
  COVER = 'COVER',
  READING = 'READING',
  CURATING = 'CURATING',
  ADMIN = 'ADMIN',
  SALES = 'SALES'
}