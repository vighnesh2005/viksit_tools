const DOC_STYLES = `

body {
  font-family: 'Bookman Old Style', serif;
  font-size: 13pt;
  color: #000;
  line-height: 1.5;
  mso-line-height-rule: exactly;
  mso-para-margin: 0in;
  mso-para-margin-bottom: .0001pt;
  mso-pagination: widow-orphan;
}
h1 {
  text-align: center;
  font-weight: bold;
  font-size: 15pt;
  margin: 0 0 6pt;
}
h2 {
  text-align: center;
  font-weight: bold;
  font-size: 14pt;
  margin: 16pt 0 8pt;
}
h3 {
  font-weight: bold;
  font-size: 14pt;
  margin: 14pt 0 6pt;
}
p {
  text-align: justify;
  margin-bottom: 6pt;
  line-height: 1.5;
  mso-line-height-rule: exactly;
}
.sig-line {
  border-bottom: 1pt solid #000;
  display: inline-block;
  width: 160pt;
  margin-top: 8pt;
}
.station-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10pt;
  font-size: 11pt;
}
.decl-block {
  margin: 12pt 0;
  border-left: 2pt solid #000;
  padding-left: 12pt;
  padding: 8pt 0;
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
  font-size: 11pt;
  margin-bottom: 10pt;
}
.photo-cell {
  width: 105pt;
  height: 125pt;
  text-align: center;
  vertical-align: middle;
}
}
.section-hdr {
  text-align: center;
  font-weight: bold;
  font-size: 15pt;
  text-transform: uppercase;
  margin: 18pt 0 10pt;
}
.section-sub {
  font-weight: bold;
  font-size: 14pt;
  margin: 14pt 0 8pt;
}
table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin: 8pt auto;
  font-size: 10pt;
  mso-table-overlap: never;
  mso-table-layout-alt: fixed;
}
th {
  font-weight: bold;
  padding: 4pt 6pt;
  text-align: left;
  border: 0.5pt solid #000;
  font-size: 10pt;
}
td {
  padding: 4pt 6pt;
  border: 0.5pt solid #000;
  vertical-align: top;
  word-break: normal;
  mso-word-break: break-all;
  font-size: 10pt;
}
tr {
  page-break-inside: avoid;
}
ul {
  margin: 4pt 0 4pt 24pt;
}
ul li {
  margin-bottom: 4pt;
  text-align: justify;
}
ol {
  margin: 4pt 0 4pt 26pt;
}
ol li {
  margin-bottom: 4pt;
  text-align: justify;
}
.initials-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4pt;
  margin: 10pt 0;
  font-size: 10pt;
  table-layout: fixed;
}
.and-sep {
  text-align: center;
  font-weight: bold;
  margin: 6pt 0;
  font-size: 11pt;
  text-transform: uppercase;
  letter-spacing: 1pt;
}
.deed-place {
  margin-top: 16pt;
  text-align: justify;
  font-style: italic;
}
.deed-ol {
  margin: 4pt 0 4pt 26pt;
}
.deed-ol > li {
  margin-bottom: 8pt;
}
.signature-area {
  margin-top: 24pt;
  display: flex;
  justify-content: flex-end;
  text-align: right;
}
.doc-party {
  margin-bottom: 6pt;
  padding-left: 8pt;
  border-left: 2pt solid #000;
}
.rules-section h3 {
  font-size: 14pt;
  font-weight: bold;
  margin-top: 12pt;
  margin-bottom: 4pt;
}
.rules-section p {
  margin-bottom: 5pt;
  padding-left: 8pt;
}
.society-title {
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  margin-bottom: 2pt;
}
.society-sub {
  text-align: center;
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 10pt;
}
.affidavit-title {
  text-align: center;
  font-size: 20pt;
  font-weight: bold;
  text-decoration: underline;
  margin-bottom: 12pt;
}
.form1-title {
  text-align: center;
  font-size: 10pt;
  font-weight: bold;
  margin-bottom: 2pt;
}
.deed-title {
  text-align: center;
  font-size: 11pt;
  font-weight: bold;
  text-decoration: underline;
  margin-bottom: 8pt;
}
.bold-name {
  font-weight: bold;
}
.underline {
  text-decoration: underline;
}
.center {
  text-align: center;
}
.right {
  text-align: right;
}
.sig-block {
  margin-top: 18pt;
  text-align: right;
}
.empty-line {
  margin: 6pt 0;
}
.itr-box {
  border: 2pt solid #000;
  color: #000;
  text-align: center;
  padding: 24pt;
  margin: 14pt 0;
}
.itr-box h1 {
  color: #000;
  margin: 0;
  border: none;
  font-size: 24pt;
}
.alert-crit {
  border-left: 3pt solid #000;
  padding: 6pt 10pt;
  margin: 4pt 0;
  font-size: 10.5pt;
  font-weight: bold;
}
.alert-ok {
  border-left: 3pt solid #000;
  padding: 6pt 10pt;
  margin: 4pt 0;
  font-size: 10.5pt;
}
.scope-box {
  border: 1pt solid #000;
  padding: 10pt 14pt;
  margin: 8pt 0;
}
.score-pill {
  display: inline-block;
  padding: 3pt 10pt;
  border-radius: 12pt;
  font-weight: bold;
  font-size: 10pt;
  table-layout: fixed;
}
`;

export default DOC_STYLES;

export const DOC_PREVIEW_STYLES = `
.doc-content {
  font-family: 'Bookman Old Style', serif;
  font-size: 13pt;
  line-height: 1.5;
  color: #000;
  padding: 0.4in;
}
.doc-content h1 { text-align: center; font-weight: bold; font-size: 15pt; margin: 0 0 6pt; }
.doc-content h2 { text-align: center; font-weight: bold; font-size: 14pt; margin: 16pt 0 8pt; }
.doc-content p { text-align: justify; margin-bottom: 6pt; line-height: 1.5; }
.doc-content table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 8pt auto; font-size: 10pt; }
.doc-content tr { page-break-inside: avoid; }
.doc-content th { font-weight: bold; padding: 4pt 6pt; text-align: left; border: 0.5pt solid #000; font-size: 10pt; }
.doc-content td { padding: 4pt 6pt; border: 0.5pt solid #000; vertical-align: top; font-size: 10pt; word-break: break-word; }
.doc-content ul { margin: 4pt 0 4pt 24pt; }
.doc-content ul li { margin-bottom: 4pt; text-align: justify; }
.doc-content ol { margin: 4pt 0 4pt 26pt; }
.doc-content ol li { margin-bottom: 4pt; text-align: justify; }
.doc-content .section-hdr { text-align: center; font-weight: bold; font-size: 15pt; text-transform: uppercase; margin: 18pt 0 10pt; border-bottom: 1pt solid #000; padding-bottom: 4pt; }
.doc-content .section-sub { font-weight: bold; font-size: 14pt; margin: 14pt 0 8pt; text-decoration: underline; }
.doc-content .firm-hdr { text-align: center; font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; margin-bottom: 2pt; }
.doc-content .firm-addr { text-align: center; font-size: 11pt; margin-bottom: 10pt; }
.doc-content .sig-line { border-bottom: 1pt solid #000; display: inline-block; width: 160pt; margin-top: 8pt; }
.doc-content .station-row { display: flex; justify-content: space-between; margin-top: 10pt; font-size: 11pt; }
.doc-content .initials-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4pt; margin: 10pt 0; font-size: 10pt; }
.doc-content .and-sep { text-align: center; font-weight: bold; margin: 6pt 0; font-size: 11pt; text-transform: uppercase; letter-spacing: 1pt; }
.doc-content .deed-place { margin-top: 16pt; text-align: justify; font-style: italic; }
.doc-content .deed-ol { margin: 4pt 0 4pt 26pt; }
.doc-content .deed-ol > li { margin-bottom: 8pt; }
.doc-content .photo-cell { width: 105pt; height: 125pt; text-align: center; vertical-align: middle; }
.doc-content .decl-block { margin: 12pt 0; border-left: 2pt solid #000; padding-left: 12pt; padding: 8pt 0; }
.doc-content .signature-area { margin-top: 24pt; display: flex; justify-content: flex-end; text-align: right; }
.doc-content .doc-party { margin-bottom: 6pt; padding-left: 8pt; border-left: 2pt solid #000; }
.doc-content .society-title { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 2pt; }
.doc-content .society-sub { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 10pt; }
.doc-content .affidavit-title { text-align: center; font-size: 20pt; font-weight: bold; text-decoration: underline; margin-bottom: 12pt; }
.doc-content .form1-title { text-align: center; font-size: 10pt; font-weight: bold; margin-bottom: 2pt; }
.doc-content .deed-title { text-align: center; font-size: 11pt; font-weight: bold; text-decoration: underline; margin-bottom: 8pt; }
.doc-content .itr-box { border: 2pt solid #000; color: #000; text-align: center; padding: 24pt; margin: 14pt 0; }
.doc-content .itr-box h1 { color: #000; margin: 0; border: none; font-size: 24pt; }
.doc-content .alert-crit { background: #fdf0f0; border-left: 4pt solid #8b2020; padding: 6pt 10pt; margin: 4pt 0; font-size: 10.5pt; }
.doc-content .alert-ok { background: #f0f7f0; border-left: 4pt solid #2c4a1e; padding: 6pt 10pt; margin: 4pt 0; font-size: 10.5pt; }
.doc-content .scope-box { border: 1pt solid #d6c9a0; padding: 10pt 14pt; margin: 8pt 0; }
@media print {
  .no-print { display: none !important; }
}
`;
