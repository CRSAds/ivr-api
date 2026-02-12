import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Dit endpoint mag door iedereen (je website bezoekers) worden aangeroepen
  // Dus we doen hier geen strenge method check, GET is prima.

  try {
    // 1. Genereer een willekeurig getal tussen 100 en 999
    const randomPin = Math.floor(100 + Math.random() * 900).toString();

    // 2. Sla deze op in de database
    // We slaan ook het IP-adres op (optioneel) om misbruik te kunnen zien later
    const { error } = await supabase
      .from('game_codes')
      .insert({
        code: randomPin,
        is_active: true
      });

    if (error) throw error;

    // 3. Stuur de code terug naar de frontend
    res.status(200).json({ pin: randomPin });

  } catch (e) {
    console.error("Fout bij genereren pin:", e);
    res.status(500).json({ error: 'Kon geen pincode genereren' });
  }
}
