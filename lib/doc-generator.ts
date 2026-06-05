const DOC_STYLES = `
body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; margin: 0.9in; color: #000; line-height: 1.8; }
h1 { text-align: center; font-size: 16pt; font-weight: bold; text-decoration: underline; margin-bottom: 8px; }
h2 { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 14px; }
p { text-align: justify; margin-bottom: 9px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th { background: #1B3A6B; color: #fff; padding: 6px 9px; font-size: 11pt; text-align: left; }
td { padding: 6px 9px; border: 1px solid #ccc; font-size: 11pt; vertical-align: top; }
tr:nth-child(even) td { background: #f8f8f8; }
ul { margin: 6px 0 6px 22px; }
ul li { margin-bottom: 6px; text-align: justify; }
ol { margin: 6px 0 6px 24px; }
ol li { margin-bottom: 5px; text-align: justify; }
.sig-line { border-bottom: 1px solid #000; display: inline-block; width: 180px; margin-top: 26px; }
.station-row { display: flex; justify-content: space-between; margin-top: 18px; }
.and-sep { text-align: center; font-weight: bold; margin: 8px 0; }
.initials-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin: 16px 0; font-size: 10.5pt; }
.deed-place { margin-top: 24px; text-align: justify; }
.firm-hdr { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 3px; }
.firm-addr { text-align: center; font-size: 10.5pt; margin-bottom: 14px; }
.section-hdr { text-align: center; font-size: 12.5pt; font-weight: bold; text-decoration: underline; margin: 18px 0 12px; }
.photo-cell { width: 90px; height: 90px; text-align: center; vertical-align: middle; }
.decl-block { margin: 16px 0; border-left: 3px solid #d6c9a0; padding-left: 14px; }
.itr-box { background: #1B3A6B; color: #fff; text-align: center; padding: 20pt; margin: 12pt 0; }
.itr-box h1 { color: #fff; margin: 0; }
.alert-crit { background: #FDECEA; border-left: 4pt solid #C00000; padding: 6pt 10pt; margin: 4pt 0; }
.alert-ok { background: #EDF7F1; border-left: 4pt solid #217A3C; padding: 6pt 10pt; margin: 4pt 0; }
.code-block { font-family: 'Courier New', monospace; font-size: 10pt; white-space: pre-wrap; }
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
