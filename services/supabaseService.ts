
import { createClient } from '@supabase/supabase-js';
import { WebsiteSlide, CoverConfig } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export async function fetchSlidesFromSupabase(): Promise<WebsiteSlide[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('slides')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching slides:', error);
    return [];
  }
  return (data as any) as WebsiteSlide[];
}

export async function saveSlideToSupabase(slide: WebsiteSlide) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
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
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
    .from('slides')
    .delete()
    .eq('id', id);

  if (error) console.error('Error removing slide:', error);
}

export async function saveMultipleSlidesToSupabase(slides: WebsiteSlide[]) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
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
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
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
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
    .from('config')
    .upsert({
      key: 'cover_config',
      value: config
    });

  if (error) console.error('Error saving cover config:', error);
}
