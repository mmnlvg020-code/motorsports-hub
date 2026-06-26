import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = {
  'F1': 'Formula_One',
  'WRC': 'World_Rally_Championship',
  'IMSA': 'IMSA_SportsCar_Championship',
  'Formula 2': 'Formula_2',
  'MotoGP': 'MotoGP',
  'WEC': 'FIA_World_Endurance_Championship',
  'Formula E': 'Formula_E',
  'IndyCar': 'IndyCar_Series',
  'NASCAR': 'NASCAR_Cup_Series'
};

async function fetchImage(wikiTitle) {
  return new Promise((resolve) => {
    https.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.originalimage ? json.originalimage.source : null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function updateRaces() {
  const racesFilePath = path.join(__dirname, 'src', 'data', 'races.js');
  let content = fs.readFileSync(racesFilePath, 'utf-8');
  
  // Extract all categories used
  for (const [cat, wikiTitle] of Object.entries(categories)) {
    const imgUrl = await fetchImage(wikiTitle);
    if (imgUrl) {
      console.log(`Updated ${cat} with ${imgUrl}`);
      // Simple string replace for the image URL.
      // E.g., we replace all images of category cat.
      const regex = new RegExp(`category: "${cat}",\\s*date: (.*?),\\s*circuit: (.*?),\\s*country: (.*?),\\s*image: "(.*?)"`, 'g');
      content = content.replace(regex, `category: "${cat}",\n    date: $1,\n    circuit: $2,\n    country: $3,\n    image: "${imgUrl}"`);
    }
  }
  
  fs.writeFileSync(racesFilePath, content, 'utf-8');
  console.log('races.js updated successfully!');
}

updateRaces();
