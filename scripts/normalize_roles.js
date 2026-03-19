
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txmhrtwhurqnmnmjztqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWhydHdodXJxbm1ubWp6dHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjY3MDMsImV4cCI6MjA3ODc0MjcwM30.Z6LKfgVuUrc9HsDFUPBy8q2cDELwDVdpFNiWaVskRi4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function normalizeRoles() {
  try {
    console.log('Fetching users...');
    const { data: users, error: fetchError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol');

    if (fetchError) throw fetchError;

    console.log(`Found ${users.length} users. Normalizing roles...`);

    for (const user of users) {
      let newRol = user.rol;
      if (user.rol === 'Administrador' || user.rol === 'ADMINISTRADOR') {
        newRol = 'admin';
      } else if (user.rol === 'Cajero' || user.rol === 'CAJERO') {
        newRol = 'cajero';
      }

      if (newRol !== user.rol) {
        console.log(`Updating user ${user.nombre}: ${user.rol} -> ${newRol}`);
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ rol: newRol })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`Error updating user ${user.nombre}:`, updateError);
        }
      }
    }

    console.log('Role normalization complete.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

normalizeRoles();
