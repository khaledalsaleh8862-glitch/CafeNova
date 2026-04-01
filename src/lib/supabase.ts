import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables - using placeholder values');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co');
}