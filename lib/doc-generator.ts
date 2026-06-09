import DOC_STYLES from './doc-styles';
// @ts-ignore
import * as htmlDocx from 'html-docx-js/dist/html-docx';

export function downloadDoc(htmlContent: string, filename: string) {
  const wrapped = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${filename}</title><style>${DOC_STYLES}</style></head>
<body>${htmlContent}</body></html>`;

  // html-docx-js may be an object with a default property in some bundlers
  const converter = (htmlDocx as any).default || htmlDocx;
  
  const converted = converter.asBlob(wrapped, { 
    margins: { top: 1080, right: 1080, bottom: 1080, left: 1080 } 
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
