import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const GET: APIRoute = async ({ cookies }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .select('*')
    .order('volgorde', { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ members: data });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const formData = await request.formData();
  const naam = formData.get('naam') as string;
  const functie = formData.get('functie') as string;
  const beschrijving = (formData.get('beschrijving') as string) || null;
  const email = (formData.get('email') as string) || null;
  const phone = (formData.get('phone') as string) || null;
  const linkedin = (formData.get('linkedin') as string) || null;
  const volgorde = parseInt(formData.get('volgorde') as string) || 0;
  const toon_contact = formData.get('toon_contact') !== 'false';
  const toon_over_ons = formData.get('toon_over_ons') !== 'false';
  const foto = formData.get('foto') as File | null;

  if (!naam || !functie) return json({ error: 'Naam en functie zijn verplicht' }, 400);

  let foto_url: string | null = null;
  if (foto && foto.size > 0) {
    const ext = foto.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { data: upload, error: uploadErr } = await supabaseAdmin.storage
      .from('team-fotos')
      .upload(path, Buffer.from(await foto.arrayBuffer()), { contentType: foto.type, upsert: true });

    if (!uploadErr) {
      const { data: { publicUrl } } = supabaseAdmin.storage.from('team-fotos').getPublicUrl(upload.path);
      foto_url = publicUrl;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .insert({ naam, functie, beschrijving, email, phone, linkedin, foto_url, volgorde, toon_contact, toon_over_ons })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ success: true, member: data });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
