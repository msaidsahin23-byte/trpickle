const fs = require('fs');

async function upload() {
  const imgPath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\94a59afe-6520-449f-9251-538c7248a07e\\.user_uploaded\\media__1785061282797.png';
  const fileBuffer = fs.readFileSync(imgPath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, 'logo.png');

  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });
    const url = await response.text();
    console.log("Catbox URL:", url);
  } catch (err) {
    console.error("Error:", err);
  }
}

upload();
