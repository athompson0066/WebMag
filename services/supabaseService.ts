
import { createClient } from '@supabase/supabase-js';
import { WebsiteSlide, CoverConfig } from '../types';

const SUPABASE_URL = 'https://irlxxeoocqktiuulfuqb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybHh4ZW9vY3FrdGl1dWxmdXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU2MTgsImV4cCI6MjA3NDQ4MTYxOH0.1rjQgX34Kj8R_ibQ6LsmXl6J3WI8d5kEXrk3SbB6iyg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchSlidesFromSupabase(): Promise<WebsiteSlide[]> {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching slides:', error);
    return [];
  }
  return data as WebsiteSlide[];
}

export async function saveSlideToSupabase(slide: WebsiteSlide) {
  const { error } = await supabase
    .from('slides')
    .upsert({
      id: slide.id,
      url: slide.url,
      content: slide.content,
      type: slide.type,
      title: slide.title,
      description: slide.description,
      category: slide.category,
      accentColor: slide.accentColor,
      listicleData: slide.listicleData,
      webhookUrl: slide.webhookUrl,
      googleSheetSubmissionUrl: slide.googleSheetSubmissionUrl,
      price: slide.price
    });

  if (error) console.error('Error saving slide:', error);
}

export async function removeSlideFromSupabase(id: string) {
  const { error } = await supabase
    .from('slides')
    .delete()
    .eq('id', id);

  if (error) console.error('Error removing slide:', error);
}

export async function saveMultipleSlidesToSupabase(slides: WebsiteSlide[]) {
  // First, clear existing slides if necessary or handle upsert carefully
  // For a "Magazine Issue", we usually want to sync the whole set
  const { error } = await supabase
    .from('slides')
    .upsert(slides.map(slide => ({
      id: slide.id,
      url: slide.url,
      content: slide.content,
      type: slide.type,
      title: slide.title,
      description: slide.description,
      category: slide.category,
      accentColor: slide.accentColor,
      listicleData: slide.listicleData,
      webhookUrl: slide.webhookUrl,
      googleSheetSubmissionUrl: slide.googleSheetSubmissionUrl,
      price: slide.price
    })));

  if (error) console.error('Error saving multiple slides:', error);
}

export async function fetchCoverConfigFromSupabase(): Promise<CoverConfig | null> {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'cover_config')
    .single();

  if (error) {
    console.error('Error fetching cover config:', error);
    return null;
  }
  return data.value as CoverConfig;
}

export async function saveCoverConfigToSupabase(config: CoverConfig) {
  const { error } = await supabase
    .from('config')
    .upsert({
      key: 'cover_config',
      value: config
    });

  if (error) console.error('Error saving cover config:', error);
}
