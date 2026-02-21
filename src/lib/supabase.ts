import { createClient } from '@supabase/supabase-js';

if (!supabaseUrl) console.warn('❌ Missing VITE_SUPABASE_URL');
if (!supabaseAnonKey) console.warn('❌ Missing VITE_SUPABASE_ANON_KEY');

if (supabaseUrl && supabaseAnonKey) {
    console.log('🔗 Supabase initialized with URL:', supabaseUrl);
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
