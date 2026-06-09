import DOC_STYLES from './doc-styles';
// @ts-ignore
import * as htmlDocx from 'html-docx-js/dist/html-docx';

export function downloadDoc(htmlContent: string, filename: string) {
  const wrapped = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${filename}</title><style>${DOC_STYLES}</style></head>
<body>${htmlContent}</body></html>`;

  // html-docx-js may be an object with a default property in some bundlers
  const converter = (htmlDocx as any).default || htmlDocx;
  
  const converted = converter.asBlob(wrapped, { 
    margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } 
  });

  const url = URL.createObjectURL(converted);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
