const DOC_STYLES = `
body {
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  margin: 1.2in 1in 1in;
  color: #1a1209;
  line-height: 1.6;
}
h1 {
  text-align: center;
  font-size: 16pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1pt;
  margin: 0 0 18pt;
  padding-bottom: 6pt;
  border-bottom: 2.5pt solid #1a1209;
}
h2 {
  font-size: 13pt;
  font-weight: bold;
  margin: 20pt 0 10pt;
  text-transform: uppercase;
  letter-spacing: 0.5pt;
  padding-bottom: 4pt;
  border-bottom: 1pt solid #b8860b;
}
h3 {
  font-size: 12pt;
  font-weight: bold;
  margin: 16pt 0 8pt;
}
p {
  text-align: justify;
  margin-bottom: 8pt;
  line-height: 1.65;
}
.page-break {
  page-break-before: always;
}
.section-hdr {
  background: #1a1209;
  color: #faf7f0;
  padding: 8pt 12pt;
  font-size: 11pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5pt;
  margin: 24pt 0 14pt;
  border-radius: 2pt;
}
.section-sub {
  background: #f5e9c8;
  color: #1a1209;
  padding: 5pt 10pt;
  font-size: 10.5pt;
  font-weight: bold;
  margin: 16pt 0 10pt;
  border-left: 3pt solid #b8860b;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 10pt 0;
  font-size: 10.5pt;
}
th {
  background: #1a1209;
  color: #faf7f0;
  padding: 5pt 8pt;
  font-size: 10pt;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.3pt;
}
td {
  padding: 5pt 8pt;
  border: 0.5pt solid #ccc;
  vertical-align: top;
}
tr:nth-child(even) td {
  background: #faf7f0;
}
ul {
  margin: 6pt 0 6pt 20pt;
}
ul li {
  margin-bottom: 5pt;
  text-align: justify;
}
ol {
  margin: 6pt 0 6pt 22pt;
}
ol li {
  margin-bottom: 5pt;
  text-align: justify;
}
.deed-ol {
  margin: 6pt 0 6pt 26pt;
}
.deed-ol > li {
  margin-bottom: 9pt;
}
.sig-line {
  border-bottom: 1pt solid #1a1209;
  display: inline-block;
  width: 160pt;
  margin-top: 22pt;
}
.station-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14pt;
  font-size: 10.5pt;
}
.and-sep {
  text-align: center;
  font-weight: bold;
  margin: 6pt 0;
  font-size: 11pt;
  text-transform: uppercase;
  letter-spacing: 1pt;
}
.initials-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4pt;
  margin: 12pt 0;
  font-size: 10pt;
  font-style: italic;
}
.deed-place {
  margin-top: 20pt;
  text-align: justify;
  font-style: italic;
}
.firm-hdr {
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5pt;
  margin-bottom: 2pt;
}
.firm-addr {
  text-align: center;
  font-size: 10.5pt;
  margin-bottom: 12pt;
  color: #555;
}
.section-hdr-center {
  text-align: center;
  font-size: 12pt;
  font-weight: bold;
  text-decoration: underline;
  margin: 18pt 0 12pt;
}
.photo-cell {
  width: 80pt;
  height: 80pt;
  text-align: center;
  vertical-align: middle;
}
.decl-block {
  margin: 14pt 0;
  border-left: 3pt solid #b8860b;
  padding-left: 12pt;
  background: #faf7f0;
  padding: 8pt 12pt;
  border-radius: 2pt;
}
.itr-box {
  background: #1a1209;
  color: #faf7f0;
  text-align: center;
  padding: 24pt;
  margin: 14pt 0;
  border-radius: 3pt;
}
.itr-box h1 {
  color: #faf7f0;
  margin: 0;
  border: none;
  font-size: 24pt;
}
.alert-crit {
  background: #fdf0f0;
  border-left: 4pt solid #8b2020;
  padding: 6pt 10pt;
  margin: 4pt 0;
  font-size: 10.5pt;
  border-radius: 2pt;
}
.alert-ok {
  background: #f0f7f0;
  border-left: 4pt solid #2c4a1e;
  padding: 6pt 10pt;
  margin: 4pt 0;
  font-size: 10.5pt;
  border-radius: 2pt;
}
.code-block {
  font-family: 'Courier New', monospace;
  font-size: 10pt;
  white-space: pre-wrap;
}
.signature-area {
  margin-top: 30pt;
  display: flex;
  justify-content: flex-end;
  text-align: right;
}
.doc-party {
  margin-bottom: 8pt;
  padding-left: 8pt;
  border-left: 2pt solid #b8860b;
}
.rules-section h3 {
  font-size: 11pt;
  font-weight: bold;
  margin-top: 14pt;
  margin-bottom: 4pt;
  color: #1a1209;
}
.rules-section p {
  margin-bottom: 6pt;
  padding-left: 8pt;
}
.score-pill {
  display: inline-block;
  padding: 3pt 10pt;
  border-radius: 12pt;
  font-weight: bold;
  font-size: 10pt;
}
.scope-box {
  border: 1pt solid #d6c9a0;
  padding: 10pt 14pt;
  margin: 8pt 0;
  background: #faf7f0;
  border-radius: 2pt;
}
`;

export function downloadDoc(htmlContent: string, filename: string) {
  const wrapped = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${filename}</title><style>${DOC_STYLES}</style></head>
<body>${htmlContent}</body></html>`;

  const blob = new Blob([wrapped], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
