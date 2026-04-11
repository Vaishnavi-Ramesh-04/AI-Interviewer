const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  try {
    console.log("Loading pdf-parse");
    // We don't have a PDF easily so we'll just check if it loads
    console.log("pdfParse loaded successfully:", typeof pdfParse);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
