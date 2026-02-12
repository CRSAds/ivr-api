import { createClient } from '@supabase/supabase-js';

// Initialiseer Supabase
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Alleen POST verzoeken toestaan
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { caller_id, pin_code } = req.body;

  // 1. Check of er überhaupt een code is meegestuurd
  if (!pin_code) {
    return res.status(400).json({ error: "No pin provided" });
  }

  try {
    // 2. Zoek de code in de database
    // We checken op de code én of is_active op true staat
    const { data, error } = await supabase
      .from('game_codes')
      .select('id, code')
      .eq('code', String(pin_code))
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn(`❌ Login mislukt: ${caller_id} met pin ${pin_code}`);
      
      // HTTP 403 Forbidden = Code ongeldig -> IVR verbreekt verbinding
      return res.status(403).json({ valid: false });
    }

    console.log(`✅ Login succes: ${caller_id} met pin ${pin_code}`);
    
    // HTTP 200 OK = Code geldig -> IVR start het spel
    return res.status(200).json({ valid: true });

  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
