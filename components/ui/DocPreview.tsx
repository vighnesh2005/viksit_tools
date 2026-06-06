'use client';
import { downloadDoc } from '@/lib/doc-generator';

interface DocPreviewProps {
  html: string;
  title: string;
  filename: string;
  onEdit?: () => void;
}

export default function DocPreview({ html, title, filename, onEdit }: DocPreviewProps) {
  return (
    <div className="bg-white border-2 border-[#d6c9a0] rounded-xl overflow-hidden shadow-lg">
      <div className="bg-[#1a1209] text-[#faf7f0] px-6 py-3 flex items-center justify-between gap-3">
        <span className="font-serif text-sm truncate">{title}</span>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => downloadDoc(html, filename.replace(/\s+/g, '_'))}
            className="bg-[#b8860b] text-[#1a1209] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#d4a017] transition cursor-pointer"
          >
            ⬇ Download DOC
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="bg-transparent text-[#faf7f0] border border-white/20 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
            >
              ✎ Edit
            </button>
          )}
        </div>
      </div>
      <div className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
