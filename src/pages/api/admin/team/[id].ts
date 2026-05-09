import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const PATCH: APIRoute = async ({ cookies, params, request }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const contentType = request.headers.get('content-type') ?? '';
  let updates: Record<string, any>;
  let foto_url: string | undefined;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    updates = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'foto') updates[key] = value === '' ? null : value;
    }
    if (updates.volgorde !== undefined) updates.volgorde = parseInt(updates.volgorde);
    if (updates.toon_contact !== undefined) updates.toon_contact = updates.toon_contact === 'true';
    if (updates.toon_over_ons !== undefined) updates.toon_over_ons = updates.toon_over_ons === 'true';

    const foto = formData.get('foto') as File | null;
    if (foto && foto.size > 0) {
      const ext = foto.name.split('.').pop() ?? 'jpg';
      const path = `${params.id}.${ext}`;
      const { data: upload, error: uploadErr } = await supabaseAdmin.storage
        .from('team-fotos')
        .upload(path, Buffer.from(await foto.arrayBuffer()), { contentType: foto.type, upsert: true });

      if (!uploadErr) {
        const { data: { publicUrl } } = supabaseAdmin.storage.from('team-fotos').getPublicUrl(upload.path);
        foto_url = publicUrl;
        updates.foto_url = foto_url;
      }
    }
  } else {
    updates = await request.json();
  }

  const { error } = await supabaseAdmin.from('team_members').update(updates).eq('id', params.id);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true, foto_url });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  // Verwijder foto uit storage als die bestaat
  const { data: member } = await supabaseAdmin
    .from('team_members').select('foto_url').eq('id', params.id).single();

  if (member?.foto_url) {
    const path = member.foto_url.split('/team-fotos/')[1];
    if (path) await supabaseAdmin.storage.from('team-fotos').remove([path]);
  }

  const { error } = await supabaseAdmin.from('team_members').delete().eq('id', params.id);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
