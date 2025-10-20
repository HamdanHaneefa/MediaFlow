import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vvanwuljkromnuudxtgx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YW53dWxqa3JvbW51dWR4dGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzUyOTEsImV4cCI6MjA3NjM1MTI5MX0.2GmhLtNr7xmfP7caDDe5TZheOfKF6bcqy37F-lUXqoA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
