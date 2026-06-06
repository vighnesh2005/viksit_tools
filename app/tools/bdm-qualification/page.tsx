'use client';
import { useState } from 'react';
import { downloadDoc } from '@/lib/doc-generator';

type PkgNum = 1 | 2 | 3 | 4 | 5;

const PACKAGES: Record<PkgNum, { name: string; price: string; color: string; ideal: string; services: string[]; deliverables: string[]; addons: string[] }> = {
  1: { name: 'Foundation Compliance', price: '₹4,000 – ₹7,000 / month', color: '#1a7a4a', ideal: 'Turnover < ₹5 Cr | Score 0–8',
    services: ['R2R: Monthly bookkeeping & finalisation','GST: GSTR-1 & GSTR-3B filing','TDS: Basic deduction & filing','ITR: Annual business return filing'],
    deliverables: ['Monthly accounts statement','GST return acknowledgements','TDS challans & certificates','Annual ITR confirmation'],
    addons: ['Payroll processing (+₹1,500/mo)','Tally AMC support (+₹500/mo)','Udyam/MSME registration (one-time ₹2,000)'] },
  2: { name: 'Growth', price: '₹8,000 – ₹15,000 / month', color: '#0D6E6E', ideal: 'Turnover ₹5–25 Cr | Score 9–15',
    services: ['All Package 1 services','MIS: Monthly P&L, BS, CF','GST: Multi-GSTIN reconciliation','TDS: Expanded compliance','Annual audit support'],
    deliverables: ['Monthly MIS pack (3 reports)','GST reconciliation statement','Creditor / Debtor ageing','Audit readiness checklist'],
    addons: ['Business loan documentation (+₹3,000)','Payroll with PF/ESI (+₹2,500/mo)','Accounting software migration (₹5,000)'] },
  3: { name: 'Managed Finance', price: '₹16,000 – ₹28,000 / month', color: '#1B3A5C', ideal: 'Turnover ₹25–100 Cr | Score 16–22',
    services: ['All Package 2 services','Advanced MIS (5-7 reports + KPI)','Full payroll: PF, ESI, PT','Quarterly advance tax','GST annual return (GSTR-9)','Direct tax advisory'],
    deliverables: ['Monthly MIS dashboard','Payroll register & salary slips','Advance tax working sheet','Quarterly review call (Sr CA)','Statutory compliance calendar'],
    addons: ['Cash flow projection (+₹3,000/mo)','Audit representation (+₹5,000/visit)','Bank funding support via P4'] },
  4: { name: 'Virtual CFO', price: '₹30,000 – ₹50,000 / month', color: '#C9952A', ideal: 'Turnover ₹50–200 Cr | Score 20–27',
    services: ['All Package 3 services','Virtual CFO: Monthly strategy call','Investor-ready financials','Debt/equity funding advisory','Board reporting pack','Annual tax optimisation'],
    deliverables: ['Monthly CFO report (10-15 pages)','Funding-ready financial model','Board deck (quarterly)','Working capital analysis','Annual tax planning note'],
    addons: ['ESOP/shareholding advisory (+₹10,000)','Transfer pricing basics (+₹8,000)','Due diligence support'] },
  5: { name: 'CFO Suite (Enterprise)', price: '₹55,000 – ₹1,00,000+ / month', color: '#6B3FA0', ideal: 'Turnover ₹100–500 Cr | Score 25–30',
    services: ['Full-scope finance outsourcing','Group-level MIS consolidation','Statutory + internal audit coordination','Full tax compliance','Funding advisory (end-to-end)','IBC/restructuring advisory'],
    deliverables: ['Consolidated group MIS','Auditor liaison reports','Full compliance tracker','Investor reporting pack','Annual strategy review'],
    addons: ['All add-ons from lower packages','Custom SLA & dedicated RM','Priority P4 Funding access'] },
};

interface Flag { type: 'risk' | 'warn' | 'opp'; icon: string; text: string; }

function getScore(ids: string[]): number {
  let t = 0; for (const id of ids) { const el = document.getElementById(id) as HTMLSelectElement; if (el && el.selectedIndex > 0) t += parseInt(el.value) || 0; } return Math.min(t, 6);
}
function isAnswered(ids: string[]) {
  if (typeof document === 'undefined') return false;
  return ids.every(id => { const el = document.getElementById(id) as HTMLSelectElement; return el && el.selectedIndex > 0; });
}
function answeredCount(qs: { id: string }[]) {
  if (typeof document === 'undefined') return 0;
  return qs.filter(q => { const el = document.getElementById(q.id) as HTMLSelectElement; return el && el.selectedIndex > 0; }).length;
}

export default function BDMQualificationPage() {
  const [client, setClient] = useState({ clientName: '', bdmName: '', date: '', leadSource: '' });
  const [showResult, setShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [scores, setScores] = useState({ a: 0, b: 0, c: 0, d: 0, e: 0 });
  const [pkgNum, setPkgNum] = useState<PkgNum>(1);
  const [tierChip, setTierChip] = useState('');
  const [tierDesc, setTierDesc] = useState('');
  const [flags, setFlags] = useState<Flag[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ a: true, b: false, c: false, d: false, e: false });

  const toggleSection = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const updateScore = () => {
    const m = { a: ['a1','a2','a3','a4','a5'], b: ['b1','b2','b3','b4','b5'], c: ['c1','c2','c3','c4','c5'], d: ['d1','d2','d3','d4','d5'], e: ['e1','e2','e3','e4','e5'] };
    const s = { a: 0, b: 0, c: 0, d: 0, e: 0 };
    let total = 0;
    for (const [k, ids] of Object.entries(m)) { const v = getScore(ids); s[k as keyof typeof s] = v; total += v; }
    return { scores: s, total };
  };

  const generateResult = () => {
    const { scores: modScores, total } = updateScore();
    setScores(modScores);
    setTotalScore(total);

    let tier: 1|2|3|4 = 1;
    let chip = '', desc = '';
    if (total <= 8) { tier = 1; chip = 'BASIC'; desc = 'Small, compliant MSME — Foundation package'; }
    else if (total <= 15) { tier = 2; chip = 'GROWTH'; desc = 'Growing MSME with expanding compliance needs'; }
    else if (total <= 22) { tier = 3; chip = 'ADVANCED'; desc = 'Mid-size business requiring structured finance support'; }
    else { tier = 4; chip = 'COMPLEX'; desc = 'High-complexity client — Managed Finance or above'; }

    const sectorEl = document.getElementById('d1') as HTMLSelectElement;
    const sector = sectorEl?.selectedIndex > 0 ? sectorEl.options[sectorEl.selectedIndex].text : '';
    let pn: PkgNum = tier === 1 ? 1 : tier === 2 ? 2 : tier === 3 ? 3 : 4;
    if (sector.includes('Real Estate') || sector.includes('Builder')) pn = Math.max(pn, 3) as PkgNum;
    if (sector.includes('Healthcare') || sector.includes('Hospital')) pn = Math.max(pn, 3) as PkgNum;
    if (sector.includes('Multi-entity') || sector.includes('Emerging')) pn = Math.max(pn, 4) as PkgNum;
    if (total >= 25) pn = 5;

    setPkgNum(pn);
    setTierChip(chip);
    setTierDesc(desc);

    const gf = (id: string) => { const el = document.getElementById(id) as HTMLSelectElement; return el ? el.selectedIndex : 0; };
    const gv = (id: string) => { const el = document.getElementById(id) as HTMLSelectElement; return el && el.selectedIndex > 0 ? parseInt(el.value) : 0; };
    const f: Flag[] = [];
    if (gv('b4') >= 1) f.push({ type: 'risk', icon: '⚠️', text: 'Active tax notice or litigation detected. Add representation add-on.' });
    if (gv('b1') >= 3 || gv('b3') >= 3) f.push({ type: 'warn', icon: '📋', text: 'Significant compliance backlog. Apply catch-up fee (base × 1.30) for first 3 months.' });
    if (gv('a5') >= 2) f.push({ type: 'warn', icon: '📍', text: 'Multi-location client. Apply multi-GSTIN multiplier (base × 1.25).' });
    if (gv('e1') >= 2 || gv('d5') >= 2) f.push({ type: 'opp', icon: '💼', text: 'Funding/cash flow intent. Refer to P4 Funding Vertical today.' });
    if (gv('c3') >= 2) f.push({ type: 'opp', icon: '📊', text: 'Client has no MIS. Strong upsell — present MIS module.' });
    if (gv('d4') >= 2 || gv('e2') >= 2) f.push({ type: 'opp', icon: '🚀', text: 'Multi-partner or expansion intent. Recommend Virtual CFO.' });
    if (gv('b5') >= 1) f.push({ type: 'opp', icon: '🏷️', text: 'Client not Udyam registered. Offer as free onboarding value-add.' });
    if (gv('a4') >= 1) f.push({ type: 'opp', icon: '🏦', text: 'Existing credit facilities. Engage on debt advisory — P4 cross-sell.' });
    if (gv('d3') >= 2) f.push({ type: 'warn', icon: '👥', text: 'Payroll > 10 employees. Confirm PF/ESI registration before scoping.' });
    setFlags(f);
    setShowResult(true);
    setTimeout(() => document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const downloadReport = () => {
    const cName = client.clientName || 'Client';
    const pkg = PACKAGES[pkgNum];
    const modLabels = ['A · Financial Profile', 'B · Compliance Status', 'C · Accounting & Technology', 'D · Business Complexity', 'E · Growth Intent'];
    const modKeys = ['a','b','c','d','e'];
    const html = `<div class="page-break"><h1>Viksit Management Consultancy</h1>
<h2 style="border:none;text-align:center;text-transform:none;letter-spacing:0;font-weight:normal;">Kurnool Delivery Centre</h2>
<div class="section-hdr">Client Qualification Report</div>
<table><tr><th colspan="2">Assessment Summary</th></tr>
<tr><td style="width:200pt;">Client Name</td><td><b>${cName}</b></td></tr>
<tr><td>BDM</td><td>${client.bdmName || '—'}</td></tr>
<tr><td>Date</td><td>${client.date || new Date().toLocaleDateString('en-IN')}</td></tr>
<tr><td>Lead Source</td><td>${client.leadSource || '—'}</td></tr>
<tr><td>Total Score</td><td><b>${totalScore} / 30</b></td></tr>
<tr><td>Tier</td><td><b>${tierChip}</b></td></tr>
<tr><td>Recommended Package</td><td><b>${pkg.name}</b></td></tr>
<tr><td>Monthly Retainer</td><td>${pkg.price}</td></tr>
</table></div>

<div>
<div class="section-hdr">Module-wise Score Breakdown</div>
<table><tr><th>Module</th><th style="width:120pt;">Score</th></tr>${modKeys.map((k, i) => `<tr><td>${modLabels[i]}</td><td>${scores[k as keyof typeof scores]} / 6</td></tr>`).join('')}<tr style="font-weight:bold;"><td>Total</td><td>${totalScore} / 30</td></tr></table></div>

<div>
<div class="section-hdr">Recommended Engagement Package</div>
<h2 style="text-align:center;border:none;font-size:14pt;">${pkg.name}</h2>
<div class="scope-box"><p><b>Ideal For:</b> ${pkg.ideal}</p>
<p><b>Monthly Retainer:</b> ${pkg.price}</p></div>
<div class="section-sub">Services Included</div><ul>${pkg.services.map(s => `<li>${s}</li>`).join('')}</ul>
<div class="section-sub">Monthly Deliverables</div><ul>${pkg.deliverables.map(d => `<li>${d}</li>`).join('')}</ul>
<div class="section-sub">Recommended Add-ons</div><ul>${pkg.addons.map(a => `<li>${a}</li>`).join('')}</ul></div>

<div>
<div class="section-hdr">Engagement Flags &amp; Opportunities</div>
${flags.length ? `<ul>${flags.map(f => `<li>${f.icon} ${f.text}</li>`).join('')}</ul>` : '<p>No flags identified.</p>'}
<div class="section-hdr">Recommended Next Steps</div>
<ol><li>Log this assessment in CRM. Attach this report.</li><li>Prepare proposal using ${pkg.name} template.</li><li>Route draft proposal for internal review.</li><li>Dispatch within 24 hours. Follow up on Day 3.</li></ol>
<p style="margin-top:24pt;text-align:center;color:#666;font-size:10pt;"><i>Confidential — For Internal Use Only | Viksit Management Consultancy | Kurnool Delivery Centre</i></p></div>`;
    downloadDoc(html, `BDM_Qualification_${cName.replace(/\s+/g, '_')}`);
  };

  const resetForm = () => {
    if (!confirm('Reset all fields?')) return;
    document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    document.querySelectorAll<HTMLInputElement>('input[type=text]').forEach(i => i.value = '');
    setClient({ clientName: '', bdmName: '', date: '', leadSource: '' });
    setShowResult(false);
  };

  const renderQ = (id: string, label: string, hint: string, opts: [string, number][]) => (
    <div className="grid md:grid-cols-[280px_1fr] gap-4 mb-5 items-start">
      <div className="text-sm font-medium text-[#1e2d3d] leading-relaxed pt-1">{label}<span className="block text-xs font-normal text-[#6B7C93] italic mt-0.5">{hint}</span></div>
      <select id={id} className="w-full p-2.5 border border-[#D4DDE8] rounded-lg text-sm bg-white outline-none focus:border-[#0D6E6E] focus:ring-3 focus:ring-[#0D6E6E]/10" onChange={updateScore}>
        <option value="0">— Select —</option>
        {opts.map(([l, v]) => <option key={l} value={v}>{l}</option>)}
      </select>
    </div>
  );

  const modules = [
    { id: 'a', icon: 'A', color: '#0D6E6E', title: 'Financial Profile', sub: 'Turnover · Transactions · Locations · Banking',
      qs: [
        { id: 'a1', label: 'Annual Turnover', hint: 'Primary pricing slab driver', opts: [['Less than ₹1 Crore', 0], ['₹1 Cr – ₹5 Cr', 1], ['₹5 Cr – ₹25 Cr', 2], ['₹25 Cr – ₹100 Cr', 3], ['More than ₹100 Cr', 4]] },
        { id: 'a2', label: 'Number of Bank Accounts', hint: 'Transaction complexity', opts: [['1-2 accounts', 0], ['3-5 accounts', 1], ['6-10 accounts', 2], ['More than 10', 3]] },
        { id: 'a3', label: 'Monthly Transaction Volume', hint: 'Purchase + sales invoices', opts: [['Less than 100', 0], ['100-300', 1], ['300-700', 2], ['More than 700', 3]] },
        { id: 'a4', label: 'Existing Bank Loans/Credit', hint: 'Debt advisory potential', opts: [['No credit facilities', 0], ['Single facility', 1], ['Multiple facilities', 2]] },
        { id: 'a5', label: 'Number of Locations/Branches', hint: 'Multi-location complexity', opts: [['Single location', 0], ['2-3 locations', 1], ['4-10 locations', 2], ['More than 10', 3]] },
      ] },
    { id: 'b', icon: 'B', color: '#1B3A5C', title: 'Compliance Status', sub: 'GST · TDS · ITR · Notices · MSME',
      qs: [
        { id: 'b1', label: 'GST Returns Filed Regularly?', hint: 'GSTR-1 and GSTR-3B timeliness', opts: [['Yes – fully compliant', 0], ['Minor delays', 1], ['Significant backlog', 3]] },
        { id: 'b2', label: 'TDS Deducted and Filed on Time?', hint: 'TDS engagement scope', opts: [['Yes – on time', 0], ['Partial compliance', 1], ['Not done', 2]] },
        { id: 'b3', label: 'Income Tax Returns Up to Date?', hint: 'ITR filing status', opts: [['Yes – all filed', 0], ['1-2 years pending', 1], ['More than 2 years pending', 3]] },
        { id: 'b4', label: 'Tax Notice/Scrutiny/Litigation?', hint: 'Advisory complexity', opts: [['No – clean record', 0], ['Notice received', 1], ['Assessment ongoing', 2], ['Litigation in progress', 3]] },
        { id: 'b5', label: 'Registered Under MSME/Udyam?', hint: 'Scheme eligibility', opts: [['Yes – registered', 0], ['In process', 1], ['Not yet registered', 1]] },
      ] },
    { id: 'c', icon: 'C', color: '#C9952A', title: 'Accounting & Technology', sub: 'Software · Update Frequency · MIS · Inventory',
      qs: [
        { id: 'c1', label: 'Accounting Software Used', hint: 'Integration effort', opts: [['Tally/Busy (current)', 0], ['Zoho/Cloud-based', 1], ['Manual ledger or Excel', 2], ['No accounting software', 3]] },
        { id: 'c2', label: 'How Frequently Are Accounts Updated?', hint: 'Backlog risk', opts: [['Real-time/weekly', 0], ['Monthly', 1], ['Quarterly', 2], ['Not updated', 3]] },
        { id: 'c3', label: 'Do You Receive Monthly MIS?', hint: 'MIS upsell trigger', opts: [['Yes – detailed MIS', 0], ['Yes – basic P&L only', 1], ['No MIS at all', 2]] },
        { id: 'c4', label: 'Who Manages Accounts?', hint: 'Capacity mapping', opts: [['Dedicated internal team', 0], ['Part-time accountant', 1], ['Owner-managed', 2]] },
        { id: 'c5', label: 'Inventory Management System', hint: 'Inventory module', opts: [['Yes – integrated', 0], ['Yes – separate', 1], ['Manual/NA', 2]] },
      ] },
    { id: 'd', icon: 'D', color: '#2d6a8a', title: 'Business Complexity', sub: 'Sector · Payroll · Import/Export · Cash Flow',
      qs: [
        { id: 'd1', label: 'Business Sector', hint: 'Sector-to-package mapping', opts: [['Trading (Wholesale/Retail)', 0], ['Services', 1], ['Manufacturing', 2], ['Healthcare/Hospital', 2], ['Real Estate/Builder', 3], ['Emerging Mid-size/Multi-entity', 3]] },
        { id: 'd2', label: 'Import/Export Activity', hint: 'GST complexity', opts: [['No imports or exports', 0], ['Imports only', 1], ['Exports only', 1], ['Both imports and exports', 2]] },
        { id: 'd3', label: 'Number of Employees on Payroll', hint: 'Payroll, PF/ESI scope', opts: [['No employees (family-run)', 0], ['1-10 employees', 1], ['11-50 employees', 2], ['More than 50', 3]] },
        { id: 'd4', label: 'Ownership Structure', hint: 'vCFO/advisory need', opts: [['Single owner (proprietorship)', 0], ['Family-managed (HUF/partnership)', 1], ['Multiple partners/LLP', 2], ['External investors/PE backed', 3]] },
        { id: 'd5', label: 'Cash Flow Situation', hint: 'Restructuring flag', opts: [['Stable', 0], ['Occasional tightness', 1], ['Regular cash flow gaps', 2], ['Severe – immediate action', 3]] },
      ] },
    { id: 'e', icon: 'E', color: '#6B3FA0', title: 'Growth Intent', sub: 'Funding · Expansion · Advisory Appetite',
      qs: [
        { id: 'e1', label: 'Funding Plans (Next 12 Months)', hint: 'P4 Funding referral flag', opts: [['No funding required', 0], ['Maybe – exploring', 1], ['Yes – bank/NBFC loan', 2], ['Yes – equity/institutional', 3]] },
        { id: 'e2', label: 'Expansion Plans', hint: 'vCFO scope signal', opts: [['No expansion plans', 0], ['Under consideration', 1], ['Active expansion planned', 2], ['Multi-city/new segment', 3]] },
        { id: 'e3', label: 'Would You Value Monthly CA Review Calls?', hint: 'Package tier signal', opts: [['Not needed', 0], ['Occasionally/quarterly', 1], ['Yes – monthly preferred', 2]] },
        { id: 'e4', label: 'Primary Pain Point Today', hint: 'Package positioning', opts: [['No significant pain', 0], ['Compliance burden', 1], ['No MIS/visibility', 2], ['Cash flow management', 2], ['Tax notices/legal', 3]] },
        { id: 'e5', label: 'Current Monthly Spend on Accounting', hint: 'Pricing anchor', opts: [['Less than ₹5,000', 0], ['₹5,000-₹15,000', 1], ['₹15,000-₹30,000', 2], ['More than ₹30,000', 3]] },
      ] },
  ];

  const modKeys2 = ['a','b','c','d','e'];
  const ScoreBar = ({ id, max = 6 }: { id: string; max?: number }) => {
    const val = scores[id as keyof typeof scores] || 0;
    return (
      <div className="flex items-center gap-3 mb-3">
        <span className="w-[130px] text-xs font-medium text-[#1e2d3d]">{modules.find(m => m.id === id)?.title}</span>
        <div className="flex-1 h-2 bg-[#F4F7FA] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(val / max) * 100}%`, background: modules.find(m => m.id === id)?.color }} />
        </div>
        <span className="text-xs font-semibold text-[#6B7C93] w-8 text-right">{val}/{max}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#1a1209]">Client Qualification Engine</h1>
        <p className="text-sm text-[#7a6e5a] mt-1">Score, tier, and recommend engagement packages for prospective clients.</p>
      </div>

      {/* BDM Info */}
      <div className="bg-white border border-[#D4DDE8] rounded-xl p-5 mb-6 grid md:grid-cols-4 gap-4">
        {[
          { label: 'Client / Business Name', key: 'clientName', placeholder: 'e.g. Ravi Enterprises' },
          { label: 'BDM Name', key: 'bdmName', placeholder: 'Your name' },
          { label: 'Date', key: 'date', placeholder: 'DD/MM/YYYY' },
          { label: 'Lead Source', key: 'leadSource', placeholder: 'Referral / Walk-in' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-[11px] font-semibold text-[#6B7C93] uppercase tracking-wider mb-1.5">{f.label}</label>
            <input className="w-full p-2.5 border border-[#D4DDE8] rounded-lg text-sm outline-none focus:border-[#0D6E6E]" placeholder={f.placeholder} value={client[f.key as keyof typeof client]} onChange={e => setClient(c => ({ ...c, [f.key]: e.target.value }))} />
          </div>
        ))}
      </div>

      {/* Module Sections */}
      {modules.map(mod => (
        <div key={mod.id} className="bg-white border border-[#D4DDE8] rounded-xl mb-5 overflow-hidden hover:shadow-md transition-shadow">
          <div className={`flex items-center gap-4 px-6 py-4 cursor-pointer select-none border-b border-transparent ${openSections[mod.id] ? 'border-b-[#D4DDE8] bg-[#f8fbff]' : ''}`}
            onClick={() => toggleSection(mod.id)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: mod.color }}>{mod.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-sm text-[#1B3A5C]">{mod.title}</div>
              <div className="text-xs text-[#6B7C93]">{mod.sub}</div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F7FA] border border-[#D4DDE8] text-[#6B7C93]">
              {isAnswered(mod.qs.map(q => q.id)) ? '✓ Done' : `${answeredCount(mod.qs)}/${mod.qs.length}`}
            </span>
            <span className={`text-[#6B7C93] transition-transform duration-200 ${openSections[mod.id] ? 'rotate-180' : ''}`}>▾</span>
          </div>
          {openSections[mod.id] && (
            <div className="p-6">
              {mod.qs.map(q => <div key={q.id} className="contents">{renderQ(q.id, q.label, q.hint, q.opts as [string, number][])}</div>)}
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      <div className="flex justify-center gap-4 flex-wrap my-8">
        <button onClick={resetForm} className="px-6 py-3 rounded-xl text-sm font-semibold bg-white text-[#1B3A5C] border-2 border-[#D4DDE8] hover:border-[#1B3A5C] transition cursor-pointer">↺ Reset Form</button>
        <button onClick={generateResult} className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#0D6E6E] text-white shadow-md hover:bg-[#0f8080] hover:-translate-y-0.5 transition cursor-pointer">Generate Recommendation →</button>
      </div>

      {/* Result Panel */}
      {showResult && (
        <div id="result-panel" className="mt-4 space-y-6">
          {/* Score Summary */}
          <div className="bg-[#1B3A5C] rounded-xl p-8 text-white grid md:grid-cols-[1fr_220px] gap-6 items-center relative overflow-hidden">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#93b4d0] mb-2">Qualification Report</div>
              <h2 className="font-serif text-xl mb-1">{client.clientName || 'Client'}</h2>
              <div className="text-sm text-[#93b4d0] mb-3">BDM: {client.bdmName || '—'} | Date: {client.date || '—'}</div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${tierChip === 'BASIC' ? 'bg-[#1a7a4a]/25 text-[#6ee0a8] border border-[#1a7a4a]' : tierChip === 'GROWTH' ? 'bg-[#0D6E6E]/25 text-[#7be8d8] border border-[#0D6E6E]' : tierChip === 'ADVANCED' ? 'bg-[#1B3A5C]/40 text-[#a8c8e8] border border-[#4a7aaa]' : 'bg-[#C9952A]/20 text-[#f0b840] border border-[#C9952A]'}`}>{tierChip}</span>
              <div className="text-sm text-[#bcd4e8] mt-2">{tierDesc}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#f0b840]">{totalScore}</div>
              <div className="text-[11px] text-[#93b4d0] uppercase tracking-wider mt-1">/ 30 Complexity Score</div>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="bg-white border border-[#D4DDE8] rounded-xl p-6">
            <h3 className="font-serif text-base text-[#1B3A5C] mb-4">Module Breakdown</h3>
            {modKeys2.map(k => <ScoreBar key={k} id={k} />)}
          </div>

          {/* Recommended Package */}
          {(() => {
            const pkg = PACKAGES[pkgNum];
            return (
              <div className="rounded-xl overflow-hidden border border-[#D4DDE8]">
                <div className="p-6 text-white flex items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${pkg.color}, ${pkg.color}dd)` }}>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest opacity-75 mb-1">Recommended Package</div>
                    <div className="font-serif text-xl">{pkg.name}</div>
                    <div className="text-sm opacity-70 mt-1">{pkg.ideal}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] opacity-70">Monthly Retainer</div>
                    <div className="font-serif text-lg">{pkg.price}</div>
                  </div>
                </div>
                <div className="bg-white p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#6B7C93] mb-2">Services Included</h4>
                    <ul className="space-y-1">{pkg.services.map((s, i) => <li key={i} className="text-xs text-[#1e2d3d] p-2 border-b border-dashed border-[#D4DDE8] last:border-0">{s}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#6B7C93] mb-2">Deliverables</h4>
                    <ul className="space-y-1">{pkg.deliverables.map((d, i) => <li key={i} className="text-xs text-[#1e2d3d] p-2 border-b border-dashed border-[#D4DDE8] last:border-0">✓ {d}</li>)}</ul>
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#6B7C93] mt-4 mb-2">Add-ons</h4>
                    <ul className="space-y-1">{pkg.addons.map((a, i) => <li key={i} className="text-xs text-[#1e2d3d] p-2">+ {a}</li>)}</ul>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Flags */}
          {flags.length > 0 && (
            <div className="bg-white border border-[#D4DDE8] rounded-xl p-6">
              <h3 className="font-serif text-base text-[#1B3A5C] mb-4">⚑ Engagement Flags & Opportunities</h3>
              {flags.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg mb-2 text-sm leading-relaxed ${
                  f.type === 'risk' ? 'bg-[#fef0ef] border-l-3 border-[#e74c3c] text-[#7a1b14]' :
                  f.type === 'warn' ? 'bg-[#fff8e6] border-l-3 border-[#C9952A] text-[#6b4c00]' :
                  'bg-[#eaf7f3] border-l-3 border-[#0D6E6E] text-[#0a4040]'
                }`}>
                  <span className="text-base shrink-0 mt-0.5">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-[#f0f6ff] to-[#e8f4f4] border border-[#D4DDE8] rounded-xl p-6">
            <h3 className="font-serif text-base text-[#1B3A5C] mb-4">→ Recommended Next Actions</h3>
            {['Log this assessment in CRM. Attach this report.','Prepare proposal using selected package template.','Route draft proposal to Senior CA for review.','Dispatch proposal within 24 hours. Follow up on Day 3.'].map((s, i) => (
              <div key={i} className="flex items-start gap-3 mb-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">{i+1}</span>
                <span className="text-[#1e2d3d]">{s}</span>
              </div>
            ))}
          </div>

          {/* Download */}
          <div className="flex justify-center">
            <button onClick={downloadReport} className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#C9952A] text-white shadow-md hover:bg-[#f0b840] transition cursor-pointer">
              ⬇ Download DOC Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
