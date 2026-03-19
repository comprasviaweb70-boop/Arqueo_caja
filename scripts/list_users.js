
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txmhrtwhurqnmnmjztqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWhydHdodXJxbm1ubWp6dHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjY3MDMsImV4cCI6MjA3ODc0MjcwM30.Z6LKfgVuUrc9HsDFUPBy8q2cDELwDVdpFNiWaVskRi4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      process.exit(1);
    }

    console.log('Current users in the database:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

listUsers();
