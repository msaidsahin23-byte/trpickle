const sharp = require('sharp');
const svg = `<svg width="1024" height="1024">
  <rect x="0" y="30" width="1024" height="65" fill="rgb(241, 251, 253)"/>
  <text x="512" y="75" font-family="Arial, sans-serif" font-weight="900" font-size="36" fill="black" text-anchor="middle">PICKLEBALL SAHASI VE MUTFAK KURALLARI</text>
</svg>`;
sharp('C:/Users/PC/.gemini/antigravity/brain/428f188c-0c6a-45da-ab28-a332f2838740/kitchen_rules_tr_1782343306912.png')
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .toFile('public/images/academy/kitchen_rules.png')
  .then(() => console.log('Done'))
  .catch(err => console.error(err));
