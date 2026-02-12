import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { caller_id, pin_code } = req.body;

  if (!pin_code) {
    return res.status(400).json({ error: "No pin provided" });
  }

  try {
    // AANGEPASTE LOGICA:
    // We gebruiken .limit(1) in plaats van .single()
    // Dit zorgt ervoor dat als code '123' er 10x in staat, hij niet crasht,
    // maar gewoon "Ja, gevonden" zegt.
    const { data, error } = await supabase
      .from('game_codes')
      .select('id')
      .eq('code', String(pin_code))
      .eq('is_active', true)
      .limit(1);

    // Als data leeg is (lengte 0), dan bestaat de code niet.
    if (error || !data || data.length === 0) {
      console.warn(`❌ Login mislukt: ${caller_id} met pin ${pin_code}`);
      return res.status(403).json({ valid: false });
    }

    console.log(`✅ Login succes: ${caller_id} met pin ${pin_code}`);
    return res.status(200).json({ valid: true });

  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
