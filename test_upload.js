const fs = require('fs');

async function upload() {
  const fileData = fs.readFileSync('package.json');
  const blob = new Blob([fileData], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob, 'package.json');

  try {
    const res = await fetch('http://localhost:3000/api/upload/cv', {
      method: 'POST',
      body: formData
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch err:", err);
  }
}

upload();
