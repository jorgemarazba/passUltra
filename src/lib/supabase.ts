import { createClient } from '@supabase/supabase-js';

// Tu Antena (URL direccional hacia Supabase)
const supabaseUrl = 'https://pxrebiderxetiypxouzi.supabase.co';

// Tu Llave Pública (Permite a React tocar la puerta, pero los datos siguen protegidos)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmViaWRlcnhldGl5cHhvdXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjU3MzIsImV4cCI6MjA5MjA0MTczMn0.TT6jqNHAXtzwujqL7PN5yS8KK1uDjxXa7nVV6P6AUJ8';

// El Conector Oficial
export const supabase = createClient(supabaseUrl, supabaseKey);
