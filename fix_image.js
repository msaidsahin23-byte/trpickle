const sharp = require('sharp');
const svg = `<svg width="1024" height="1024">
  <rect x="50" y="50" width="924" height="70" fill="white"/>
  <text x="512" y="105" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="black" text-anchor="middle">PICKLEBALL SAHASI VE MUTFAK KURALLARI</text>
</svg>`;
sharp('public/images/academy/kitchen_rules.png')
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .toFile('public/images/academy/kitchen_rules_fixed.png')
  .then(() => console.log('Done'))
  .catch(err => console.error(err));
