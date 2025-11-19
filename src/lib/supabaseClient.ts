import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Fallback para evitar erro quando .env não está presente
const supabaseUrl = envUrl ?? 'https://axjcrpnjckjewqadqfpk.supabase.co';
const supabaseAnonKey = envAnon ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4amNycG5qY2tqZXdxYWRxZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjExMDYsImV4cCI6MjA3NjA5NzEwNn0.H_oEGRi_j7-n13RW1WB6_pTq5jgZ-2_8pqdDkYBwSfw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
