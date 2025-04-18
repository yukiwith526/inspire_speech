import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yhfeadlfywjlazqqvegm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmVhZGxmeXdqbGF6cXF2ZWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDMzMzQsImV4cCI6MjA2MDU3OTMzNH0.kIzZ6PBRxT7YJoEIRbf9GcKmxeUKITpE1gYYUeBDqHQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ChatHistory = {
  id: string;
  user_id: string;
  input_text: string;
  response: string;
  voice_id: string;
  created_at: string;
}

export type Profile = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
} 