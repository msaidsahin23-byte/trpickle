const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function upload() {
  const imgPath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\94a59afe-6520-449f-9251-538c7248a07e\\.user_uploaded\\media__1785061282797.png';
  const fileBuffer = fs.readFileSync(imgPath);
  
  const form = new FormData();
  form.append('files[]', fileBuffer, 'logo.png');

  try {
    const res = await axios.post('https://pomf.lain.la/upload.php', form, {
      headers: form.getHeaders()
    });
    console.log("Pomf URL:", res.data.files[0].url);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

upload();
