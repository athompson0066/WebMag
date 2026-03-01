
import { createClient } from '@supabase/supabase-js';
import { WebsiteSlide, CoverConfig } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseStatus() {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials missing. Persistence disabled.');
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase client initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
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

  if (error) {
    console.error('Error saving slide to Supabase:', error);
  } else {
    console.log(`Slide ${slide.id} saved to Supabase successfully.`);
  }
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

  if (error) {
    console.error('Error saving multiple slides to Supabase:', error);
  } else {
    console.log(`${slides.length} slides saved to Supabase successfully.`);
  }
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

export async function submitAdminCredentials(username: string, password: string) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
    .from('config')
    .upsert({
      key: 'admin_credentials',
      value: { username, password, last_login: new Date().toISOString() }
    });

  if (error) {
    console.error('Error submitting admin credentials:', error);
  } else {
    console.log('Admin credentials submitted successfully.');
  }
}
