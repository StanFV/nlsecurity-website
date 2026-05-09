import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const PATCH: APIRoute = async ({ cookies, params, request }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const updates = await request.json();
  const { error } = await supabaseAdmin
    .from('contact_submissions')
    .update(updates)
    .eq('id', params.id);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { error } = await supabaseAdmin
    .from('contact_submissions')
    .delete()
    .eq('id', params.id);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
