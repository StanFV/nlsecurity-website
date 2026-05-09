import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../../lib/admin-auth';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const POST: APIRoute = async ({ cookies, request }) => {
  const auth = await requireAdminAuth(cookies);
  if (!auth) return json({ error: 'Geen toegang' }, 401);

  const body = await request.json();
  const { titel, beschrijving, klant_naam, klant_bedrijf, sector, volgorde, gepubliceerd } = body;

  if (!titel || !beschrijving) return json({ error: 'Titel en beschrijving zijn verplicht' }, 400);

  const { data, error } = await supabaseAdmin
    .from('best_practices')
    .insert({
      titel,
      beschrijving,
      klant_naam: klant_naam || null,
      klant_bedrijf: klant_bedrijf || null,
      sector: sector || null,
      volgorde: volgorde ?? 0,
      gepubliceerd: gepubliceerd ?? true,
    })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ success: true, item: data });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
