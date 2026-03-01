import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txmhrtwhurqnmnmjztqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWhydHdodXJxbm1ubWp6dHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjY3MDMsImV4cCI6MjA3ODc0MjcwM30.Z6LKfgVuUrc9HsDFUPBy8q2cDELwDVdpFNiWaVskRi4';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
