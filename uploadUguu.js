const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function upload() {
  const form = new FormData();
  form.append('files[]', fs.createReadStream('C:\\Users\\PC\\.gemini\\antigravity\\brain\\94a59afe-6520-449f-9251-538c7248a07e\\.user_uploaded\\media__1785061282797.png'));
  try {
    const res = await axios.post('https://uguu.se/upload.php', form, { headers: form.getHeaders() });
    console.log(res.data.files[0].url);
  } catch(e) {
    console.error(e.message);
  }
}
upload();
