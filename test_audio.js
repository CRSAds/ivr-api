require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; 
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID; 

if (!ELEVENLABS_API_KEY || !VOICE_ID) {
  console.error("❌ Fout: ELEVENLABS_API_KEY of ELEVENLABS_VOICE_ID mist in .env.local");
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, 'public', 'audio');

// 📝 ONZE TEST DATA (Eerste 3 'Goed' reacties)
const audioFiles = [
  { file: 'sfx/correct_1.mp3', text: 'Helemaal goed!' },
  { file: 'sfx/correct_2.mp3', text: 'Yes, dat is het juiste antwoord.' },
  { file: 'sfx/correct_3.mp3', text: 'Correct! Punt in de pocket.' }
];

async function generateTestAudio() {
  console.log(`Start test met ${audioFiles.length} audio bestanden...`);

  for (const item of audioFiles) {
    const filePath = path.join(OUTPUT_DIR, item.file);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Genereert: ${item.file} ...`);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: item.text,
          model_id: 'eleven_multilingual_v2', // Multilingual ondersteunt Nederlands heel goed
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      fs.writeFileSync(filePath, buffer);
      console.log(`✅ Opgeslagen: ${item.file}`);

    } catch (error) {
      console.error(`❌ Fout bij ${item.file}:`, error.message);
    }
  }

  console.log('🎉 Test geslaagd! Check je public/audio/sfx map.');
}

generateTestAudio();
