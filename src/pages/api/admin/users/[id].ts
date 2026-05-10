import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

async function getSuperAdminCount(): Promise<number> {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  return (data?.users ?? []).filter(u => u.app_metadata?.role === 'super_admin').length;
}

export const PATCH: APIRoute = async ({ cookies, request, params }) => {
  const auth = await requireAdminAuth(cookies, true);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { id } = params;
  const updates = await request.json();

  // Haal huidige app_metadata op en merge
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(id);
  const currentMeta = userData?.user?.app_metadata ?? {};

  // Voorkom dat de laatste super admin wordt gedegradeerd
  if (updates.role !== undefined && updates.role !== 'super_admin' && currentMeta.role === 'super_admin') {
    const count = await getSuperAdminCount();
    if (count <= 1) {
      return json({ error: 'Er moet altijd minimaal één Super Admin zijn. Wijs eerst een andere Super Admin aan.' }, 400);
    }
  }

  const newMeta: Record<string, any> = { ...currentMeta };
  if (updates.role !== undefined) newMeta.role = updates.role;
  if (updates.mfa_required !== undefined) newMeta.mfa_required = updates.mfa_required;

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: newMeta,
  });

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const auth = await requireAdminAuth(cookies, true);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { id } = params;
  if (id === auth.user.id) {
    return json({ error: 'Je kunt jezelf niet verwijderen' }, 400);
  }

  // Voorkom dat de laatste super admin wordt verwijderd
  const { data: toDelete } = await supabaseAdmin.auth.admin.getUserById(id);
  if (toDelete?.user?.app_metadata?.role === 'super_admin') {
    const count = await getSuperAdminCount();
    if (count <= 1) {
      return json({ error: 'Er moet altijd minimaal één Super Admin zijn. Wijs eerst een andere Super Admin aan.' }, 400);
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
