
import { createClient } from '@supabase/supabase-js';
import { WebsiteSlide, CoverConfig } from '../types';

export interface ListingData {
  first_name: string;
  last_name: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  email: string;
  website_url: string;
  title: string;
  description: string;
  paypal_transaction_id: string;
  payment_status: string;
}

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

  // Fetch the order from config table
  const { data: orderData } = await client
    .from('config')
    .select('value')
    .eq('key', 'slide_order')
    .single();

  const { data, error } = await client
    .from('slides')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching slides:', error);
    return [];
  }

  const slides = (data as any[]).map(row => ({
    id: row.id,
    type: row.type,
    url: row.url,
    content: row.content,
    title: row.title,
    description: row.description,
    category: row.category,
    accentColor: row.accentcolor,
    listicleData: row.listicledata,
    webhookUrl: row.webhookurl,
    googleSheetSubmissionUrl: row.googlesheetsubmissionurl,
    price: row.price
  }));

  if (orderData && orderData.value && Array.isArray(orderData.value)) {
    const order = orderData.value as string[];
    slides.sort((a, b) => {
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  } else {
    // Fallback exactly as before if no order is saved: sort by created_at ascending (though we didn't fetch created_at, we can rely on data order or explicitly sort if needed, but array order usually defaults to created_at if we add .order('created_at')).
    // Actually, let's keep the order by created_at on the fetch just in case.
  }

  return slides;
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
      accentcolor: slide.accentColor,
      listicledata: slide.listicleData,
      webhookurl: slide.webhookUrl,
      googlesheetsubmissionurl: slide.googleSheetSubmissionUrl,
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

export async function saveSlideOrderToSupabase(slideIds: string[]) {
  const client = getSupabase();
  if (!client) return;

  await client.from('config').upsert({
    key: 'slide_order',
    value: slideIds
  });
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
      accentcolor: slide.accentColor,
      listicledata: slide.listicleData,
      webhookurl: slide.webhookUrl,
      googlesheetsubmissionurl: slide.googleSheetSubmissionUrl,
      price: slide.price
    })));

  if (error) {
    console.error('Error saving multiple slides to Supabase:', error);
  } else {
    // Save the order
    await client.from('config').upsert({
      key: 'slide_order',
      value: slides.map(s => s.id)
    });
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

export async function saveListingSubmission(data: ListingData) {
  const client = getSupabase();
  if (!client) return { success: false, error: 'No Supabase client' };

  try {
    // 1. Insert into listings table
    const { data: listingReturn, error: listingError } = await client
      .from('listings')
      .insert(data as any)
      .select('id')
      .single();

    if (listingError) throw listingError;

    // 2. Create and insert a new slide automatically
    const newSlide: WebsiteSlide = {
      id: crypto.randomUUID(),
      type: 'external',
      url: data.website_url,
      title: data.title,
      description: data.description || 'A new premium listing.',
      category: 'Sponsored',
      accentColor: '#FFD700' // Premium gold accent for paid listings
    };

    await saveSlideToSupabase(newSlide);

    return { success: true, listingId: listingReturn.id, slideId: newSlide.id };
  } catch (error) {
    console.error('Error saving listing submission:', error);
    return { success: false, error };
  }
}
