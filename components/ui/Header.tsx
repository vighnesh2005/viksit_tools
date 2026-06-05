'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#1a1209] text-[#faf7f0] border-b-3 border-[#b8860b] no-print">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#b8860b] rounded-lg flex items-center justify-center font-serif font-bold text-lg text-[#1a1209]">
            V
          </div>
          <div>
            <div className="font-serif text-xl font-semibold leading-tight">
              Viksit Consultancy
            </div>
            <div className="text-[10px] text-[#d6c9a0] uppercase tracking-widest">
              Chartered Accountants
            </div>
          </div>
        </Link>
        <div className="text-[11px] bg-[#b8860b]/20 text-[#d4a017] px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider hidden sm:block">
          Tool Suite
        </div>
      </div>
    </header>
  );
}
