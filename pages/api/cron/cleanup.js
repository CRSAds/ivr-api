import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Verwijder alles ouder dan 24 uur
  const { error } = await supabase
    .from('game_codes')
    .delete()
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ message: 'Oude codes verwijderd' });
}
