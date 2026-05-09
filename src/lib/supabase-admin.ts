import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = ws;
}

const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
