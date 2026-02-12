import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const p = req.body;

    // Data validatie (optioneel, maar handig)
    if (!p.caller_id) {
       return res.status(400).json({ error: "Missing caller_id" });
    }

    // 1. Data wegschrijven naar Supabase tabel 'game_results'
    const { error } = await supabase
      .from('game_results')
      .insert({
        caller_id: p.caller_id,
        pin_code: p.pin_code,
        duration_seconds: p.duration_seconds || 0,
        questions_answered: p.questions_answered || 0,
        questions_correct: p.questions_correct || 0,
        round_reached: p.round_reached || 1,
        timestamp_end: p.timestamp_end || new Date().toISOString()
      });

    if (error) throw error;

    console.log(`💾 Resultaat opgeslagen voor ${p.caller_id}: Score ${p.questions_correct}/${p.questions_answered}`);

    return res.status(200).json({ saved: true });

  } catch (e) {
    console.error("Fout bij opslaan resultaat:", e);
    // We sturen toch 200 OK terug naar de IVR provider om retries te voorkomen,
    // maar we loggen de error wel in Vercel logs.
    return res.status(200).json({ saved: false, error: 'Handled internal error' });
  }
}
