
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txmhrtwhurqnmnmjztqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWhydHdodXJxbm1ubWp6dHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjY3MDMsImV4cCI6MjA3ODc0MjcwM30.Z6LKfgVuUrc9HsDFUPBy8q2cDELwDVdpFNiWaVskRi4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteUser() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .ilike('nombre', 'ANTONIA')
      .select();

    if (error) {
      console.error('Error deleting user:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('User ANTONIA deleted successfully:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('User ANTONIA not found or already deleted.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

deleteUser();
