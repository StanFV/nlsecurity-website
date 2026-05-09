import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';

export const POST: APIRoute = async ({ cookies, params, request }) => {
  const auth = await requireAdminAuth(cookies, true);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const redirectTo = body.redirectTo ?? `${import.meta.env.SITE_URL ?? ''}/admin`;

  const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(id);
  if (getUserError || !userData?.user?.email) {
    return json({ error: 'Gebruiker niet gevonden' }, 404);
  }

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(userData.user.email, {
    redirectTo,
  });
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
