import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const GET: APIRoute = async ({ cookies }) => {
  const auth = await requireAdminAuth(cookies, true);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return json({ error: error.message }, 500);

  const users = authUsers.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    role: u.app_metadata?.role ?? 'admin',
    mfa_required: u.app_metadata?.mfa_required ?? false,
    mfa_enrolled: ((u as any).factors ?? []).length > 0,
  }));

  return json({ users });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const auth = await requireAdminAuth(cookies, true);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { email, role, mfa_required } = await request.json();

  if (!email || !email.includes('@')) {
    return json({ error: 'Voer een geldig e-mailadres in' }, 400);
  }

  const mfaRequired = mfa_required !== false; // standaard true, tenzij expliciet false
  const siteUrl = import.meta.env.SITE_URL ?? 'https://nlsecurity-website.vercel.app';
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { role: role ?? 'admin', mfa_required: mfaRequired },
      redirectTo: `${siteUrl}/admin`
    }
  );
  if (inviteError) return json({ error: inviteError.message }, 500);

  // Sla rol en MFA-instelling op in app_metadata
  await supabaseAdmin.auth.admin.updateUserById(inviteData.user.id, {
    app_metadata: { role: role ?? 'admin', mfa_required: mfaRequired },
  });

  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
