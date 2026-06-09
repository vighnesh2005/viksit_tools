import fs from 'fs';
const xml = fs.readFileSync('temp_docx_extract/word/document.xml', 'utf8');
const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
if (matches) {
  const text = matches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join('\n');
  fs.writeFileSync('extracted_text.txt', text);
}
