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

// 🏆 HET MASTER SCRIPT - DEEL 1 (Systeem, Reacties & Ronde 1)
const audioFiles = [
  // --- SYSTEEM & NAVIGATIE ---
  { file: 'systeem/welkom.mp3', text: 'Welkom bij de Live Arena Quiz! Toets nu je 3-cijferige pincode in om de kluis te openen en het spel te starten.' },
  { file: 'systeem/pin_fout.mp3', text: 'Deze code is niet actief of onjuist. Controleer je code op de website en bel opnieuw. Tot zo!' },
  { file: 'systeem/pin_correct.mp3', text: 'Toegang verleend! Maak je klaar. Ronde één start... nu!' },
  { file: 'systeem/einde_r1.mp3', text: 'Wow, dat was ronde één! Je bent goed op dreef. Wil je je score verhogen en doorgaan naar ronde twee? Toets dan nu een 1. Wil je stoppen en je eindscore horen? Toets dan een 2.' },

  // --- REACTIES (Goed) ---
  { file: 'sfx/correct_1.mp3', text: 'Helemaal goed!' },
  { file: 'sfx/correct_2.mp3', text: 'Yes, dat is het juiste antwoord.' },
  { file: 'sfx/correct_3.mp3', text: 'Correct! Punt in de pocket.' },
  { file: 'sfx/correct_4.mp3', text: 'Spot on! Ga zo door.' },
  { file: 'sfx/correct_5.mp3', text: 'Uitstekend, je score stijgt!' },

  // --- REACTIES (Fout) ---
  { file: 'sfx/fout_1.mp3', text: 'Helaas, dat is fout.' },
  { file: 'sfx/fout_2.mp3', text: 'Oh nee, dat was niet het juiste antwoord.' },
  { file: 'sfx/fout_3.mp3', text: 'Jammer! Volgende keer beter.' },
  { file: 'sfx/fout_4.mp3', text: 'Oeps! Fout gegokt.' },
  { file: 'sfx/fout_5.mp3', text: 'Helaas, we gaan snel door naar de volgende.' },

  // --- RONDE 1 (10 Vragen) ---
  { file: 'ronde1/v1.mp3', text: 'Vraag 1. Wat is de hoofdstad van Frankrijk? ... Toets 1 voor Rome... 2 voor Parijs... of 3, voor Madrid.' },
  { file: 'ronde1/v2.mp3', text: 'Vraag 2. Hoeveel poten heeft een spin? ... Toets 1 voor zes... 2 voor acht... of 3, voor tien.' },
  { file: 'ronde1/v3.mp3', text: 'Vraag 3. Welke kleur hebben smurfen? ... Toets 1 voor blauw... 2 voor groen... of 3, voor geel.' },
  { file: 'ronde1/v4.mp3', text: 'Vraag 4. Wie was de eerste man op de maan? ... Toets 1 voor Buzz Aldrin... 2 voor Yuri Gagarin... of 3, voor Neil Armstrong.' },
  { file: 'ronde1/v5.mp3', text: 'Vraag 5. Hoeveel dagen heeft een schrikkeljaar? ... Toets 1 voor 364... 2 voor 365... of 3, voor 366.' },
  { file: 'ronde1/v6.mp3', text: 'Vraag 6. Welk dier knort? ... Toets 1 voor een koe... 2 voor een varken... of 3, voor een kip.' },
  { file: 'ronde1/v7.mp3', text: 'Vraag 7. Welke planeet staat het dichtst bij de zon? ... Toets 1 voor Venus... 2 voor Mars... of 3, voor Mercurius.' },
  { file: 'ronde1/v8.mp3', text: 'Vraag 8. Wat is de grootste oceaan ter wereld? ... Toets 1 voor de Atlantische Oceaan... 2 voor de Indische Oceaan... of 3, voor de Stille Oceaan.' },
  { file: 'ronde1/v9.mp3', text: 'Vraag 9. Hoeveel kleuren heeft een regenboog? ... Toets 1 voor vijf... 2 voor zeven... of 3, voor negen.' },
  { file: 'ronde1/v10.mp3', text: 'Vraag 10. Welke taal spreekt men in Brazilië? ... Toets 1 voor Spaans... 2 voor Portugees... of 3, voor Braziliaans.' }
];

async function generateAllAudio() {
  console.log(`🚀 Start met genereren van ${audioFiles.length} audio bestanden...`);

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
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,       // Iets lager voor meer enthousiasme
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
      
      // Korte pauze (500ms) om API rate limits te voorkomen
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Fout bij ${item.file}:`, error.message);
    }
  }

  console.log('\n🎉 KLAAR! Alle 24 bestanden staan netjes in je public/audio/ map.');
  console.log('Je kunt ze nu beluisteren en daarna pushen naar GitHub!');
}

generateAllAudio();
