import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) console.warn('❌ Missing VITE_SUPABASE_URL');
if (!supabaseAnonKey) console.warn('❌ Missing VITE_SUPABASE_ANON_KEY');

if (supabaseUrl && supabaseAnonKey) {
    console.log('🔗 Supabase initialized with URL:', supabaseUrl);
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
