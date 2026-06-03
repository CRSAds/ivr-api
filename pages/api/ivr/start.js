import { createClient } from '@supabase/supabase-js';

// Initialiseer de Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Gebruik de service role key voor backend updates
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Accepteer alleen POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // De IVR moet de pincode in de body meesturen
  const { pin } = req.body; 

  if (!pin) {
    return res.status(400).json({ valid: false, error: 'Pincode ontbreekt' });
  }

  try {
    // 1. Zoek de code op die nog actief is
    const { data, error } = await supabase
      .from('game_codes')
      .select('id, code')
      .eq('code', pin)
      .eq('is_active', true)
      .limit(1)
      .single();

    // Als er een error is (bijv. geen resultaten), is de code ongeldig of al gebruikt
    if (error || !data) {
      return res.status(403).json({ 
        valid: false, 
        error: 'Ongeldige of reeds verbruikte pincode' 
      });
    }

    // 2. Code gevonden! Zet is_active nu direct op false.
    const { error: updateError } = await supabase
      .from('game_codes')
      .update({ is_active: false })
      .eq('id', data.id);

    if (updateError) {
      console.error('Fout bij updaten van code status in Supabase:', updateError);
      return res.status(500).json({ error: 'Database update gefaald' });
    }

    // 3. Return succes naar de IVR
    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error('Serverfout in /api/ivr/start:', err);
    return res.status(500).json({ error: 'Interne serverfout' });
  }
}
