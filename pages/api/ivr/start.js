import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Gebruik de juiste variabelen uit de IVR payload
  const { caller_id, pin_code } = req.body;

  if (!pin_code) {
    return res.status(400).json({ error: "No pin provided" });
  }

  try {
    // 1. Zoek de actieve code op via .limit(1) om dubbele waarden op te vangen
    const { data, error } = await supabase
      .from('game_codes')
      .select('id')
      .eq('code', String(pin_code))
      .eq('is_active', true)
      .limit(1);

    // Als data leeg is, bestaat de code niet of is deze al verbruikt
    if (error || !data || data.length === 0) {
      console.warn(`❌ Login mislukt of code al verbruikt: ${caller_id} met pin ${pin_code}`);
      return res.status(403).json({ valid: false });
    }

    const activeCodeId = data[0].id;

    // 2. NIEUW: Deactiveer de specifieke code direct in de database
    const { error: updateError } = await supabase
      .from('game_codes')
      .update({ is_active: false })
      .eq('id', activeCodeId);

    if (updateError) {
      console.error('Fout bij deactiveren van code in database:', updateError);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // 3. Geef de IVR-centrale groen licht
    console.log(`✅ Login succes (code is nu gedeactiveerd): ${caller_id} met pin ${pin_code}`);
    return res.status(200).json({ valid: true });

  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
