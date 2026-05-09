import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase-admin';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Ongeldig verzoek' }, 400);

  const { voornaam, tussenvoegsel, achternaam, bedrijfsnaam, email, phone, contact_voorkeur, bericht, privacy_akkoord } = body;

  if (!voornaam || !achternaam || !bericht) {
    return json({ error: 'Vul alle verplichte velden in' }, 400);
  }
  if (!privacy_akkoord) {
    return json({ error: 'Geef toestemming voor het opslaan van uw gegevens' }, 400);
  }

  const { error } = await supabaseAdmin.from('contact_submissions').insert({
    voornaam,
    tussenvoegsel: tussenvoegsel || null,
    achternaam,
    bedrijfsnaam: bedrijfsnaam || null,
    email: email || null,
    phone: phone || null,
    contact_voorkeur,
    bericht,
    privacy_akkoord: true,
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
