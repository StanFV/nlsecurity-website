import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';

export const POST: APIRoute = async ({ cookies, params }) => {
  const auth = await requireAdminAuth(cookies, true);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'ID ontbreekt' }, 400);

  if (id === auth.user.id) {
    return json({ error: 'Je kunt je eigen MFA niet resetten via dit paneel' }, 400);
  }

  // Haal factoren op
  const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(id);
  if (getUserError || !userData?.user) {
    return json({ error: 'Gebruiker niet gevonden' }, 404);
  }

  const factors = (userData.user as any).factors ?? [];
  
  // Verwijder alle factoren
  for (const factor of factors) {
    const { error: deleteError } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
      userId: id,
      factorId: factor.id,
    });
    if (deleteError) {
      console.error(`Fout bij verwijderen factor ${factor.id}:`, deleteError);
    }
  }

  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
