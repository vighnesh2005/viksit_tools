import Link from 'next/link';

const tools = [
  {
    title: 'Partnership Deed',
    desc: 'Generate a complete partnership deed under IPA 1932 with a 5-step wizard. Also produces supporting registration documents — Affidavit, Form No. 1, and Photo Form.',
    href: '/tools/partnership-deed',
    icon: '⚖',
    tags: ['IPA 1932', '5-Step Wizard', 'Supporting Docs'],
    color: 'accent',
  },
  {
    title: 'BDM Qualification',
    desc: 'Score, tier, and recommend engagement packages for prospective clients. 25-question engine across 5 modules with automated flagging and actionable next steps.',
    href: '/tools/bdm-qualification',
    icon: '📊',
    tags: ['25 Questions', '5 Modules', 'DOC Report'],
    color: 'teal',
  },
  {
    title: 'ITR Assessment',
    desc: 'Complete ITR assessment for AY 2026-27. Questionnaire-driven ITR form determination, risk flagging, filing readiness scoring, and compliance checklists.',
    href: '/tools/itr-assessment',
    icon: '📋',
    tags: ['AY 2026-27', 'ITR Engine', 'Risk Flags'],
    color: 'navy',
  },
  {
    title: 'Society Registration',
    desc: 'Generate all documents for society registration under Act 35 of 2001 — Cover Letter, Resolution, Memorandum of Association, and President + NOC Affidavits.',
    href: '/tools/document-suite',
    icon: '📁',
    tags: ['Societies Act', '4 Documents', 'DOC Download'],
    color: 'society',
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; iconShadow: string }> = {
  accent: { bg: 'from-[#2c4a1e] to-[#3d6129]', border: 'border-[#2c4a1e]/30 hover:border-[#2c4a1e]', badge: 'bg-[#2c4a1e]/10 text-[#2c4a1e] border-[#2c4a1e]/20', iconShadow: 'shadow-[#2c4a1e]/20' },
  teal: { bg: 'from-[#0D6E6E] to-[#0f8080]', border: 'border-[#0D6E6E]/30 hover:border-[#0D6E6E]', badge: 'bg-[#0D6E6E]/10 text-[#0D6E6E] border-[#0D6E6E]/20', iconShadow: 'shadow-[#0D6E6E]/20' },
  navy: { bg: 'from-[#1B3A5C] to-[#2d5a8a]', border: 'border-[#1B3A5C]/30 hover:border-[#1B3A5C]', badge: 'bg-[#1B3A5C]/10 text-[#1B3A5C] border-[#1B3A5C]/20', iconShadow: 'shadow-[#1B3A5C]/20' },
  society: { bg: 'from-[#1e3a5a] to-[#274d78]', border: 'border-[#1e3a5a]/30 hover:border-[#1e3a5a]', badge: 'bg-[#1e3a5a]/10 text-[#1e3a5a] border-[#1e3a5a]/20', iconShadow: 'shadow-[#1e3a5a]/20' },
};

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b8860b]/10 border border-[#b8860b]/20 text-[#b8860b] text-xs font-semibold tracking-wider uppercase mb-6">
          CA Tool Suite
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1a1209] mb-4 leading-tight">
          Viksit Tool Suite
        </h1>
        <p className="text-[#7a6e5a] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Professional document generation and assessment tools for chartered accountants and business advisors. Generate, download, and print.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {tools.map((tool) => {
          const c = colorMap[tool.color];
          return (
            <Link
              key={tool.title}
              href={tool.href}
              className={`group block bg-white rounded-xl border-2 ${c.border} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5`}
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center text-2xl shrink-0 shadow-lg ${c.iconShadow} group-hover:scale-105 transition-transform`}>
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl font-semibold text-[#1a1209] mb-1.5 group-hover:underline decoration-[#b8860b] underline-offset-2">
                    {tool.title}
                  </h2>
                  <p className="text-sm text-[#7a6e5a] leading-relaxed mb-4">
                    {tool.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badge}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xl text-[#d6c9a0] group-hover:text-[#b8860b] transition-colors shrink-0 self-center">
                  →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-16 text-center border-t border-[#d6c9a0]/30 pt-8">
        <p className="text-sm text-[#7a6e5a]">
          All documents are generated in <strong className="text-[#1a1209]">.DOC</strong> format for easy editing and printing.
        </p>
      </div>
    </div>
  );
}
