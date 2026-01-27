
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
  description: string;
  category: string;
  accentColor?: string;
  listicleData?: ListicleData;
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
