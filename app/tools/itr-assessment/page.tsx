'use client';
import { useState, useCallback } from 'react';
import { downloadDoc } from '@/lib/doc-generator';

interface ITRQuestion { id: string; group: string; label: string; parent?: string; parentVal?: string; }
const QS: ITRQuestion[] = [
  { id:'q_salary', group:'Salary & Employment', label:'Does the client receive salary, wages, pension, or any income from employment?' },
  { id:'q_salary_multi', group:'Salary & Employment', label:'Did the client have MORE THAN ONE employer during FY 2025-26?', parent:'q_salary', parentVal:'yes' },
  { id:'q_salary_arrears', group:'Salary & Employment', label:'Has the client received salary arrears (relating to earlier years)?', parent:'q_salary', parentVal:'yes' },
  { id:'q_pension', group:'Salary & Employment', label:'Does the client receive any pension?' },
  { id:'q_property_own', group:'House Property', label:'Does the client own any residential or commercial property?' },
  { id:'q_property_letout', group:'House Property', label:'Is any property let out?', parent:'q_property_own', parentVal:'yes' },
  { id:'q_property_homeloan', group:'House Property', label:'Does the client have a home loan on any property?', parent:'q_property_own', parentVal:'yes' },
  { id:'q_cg', group:'Capital Gains', label:'Has the client sold or redeemed any investments or property during FY 2025-26?' },
  { id:'q_cg_equity', group:'Capital Gains', label:'Equity shares or equity-oriented mutual funds sold?', parent:'q_cg', parentVal:'yes' },
  { id:'q_cg_property', group:'Capital Gains', label:'Immovable property (land, house, commercial) sold?', parent:'q_cg', parentVal:'yes' },
  { id:'q_cg_crypto', group:'Capital Gains', label:'Cryptocurrency or other Virtual Digital Assets sold?', parent:'q_cg', parentVal:'yes' },
  { id:'q_cg_fo', group:'Capital Gains', label:'Any Futures & Options trading?', parent:'q_cg', parentVal:'yes' },
  { id:'q_business', group:'Business & Profession', label:'Does the client run any business or have professional income?' },
  { id:'q_business_turnover', group:'Business & Profession', label:'What is approximate annual turnover?', parent:'q_business', parentVal:'yes' },
  { id:'q_business_presumptive', group:'Business & Profession', label:'Is the client opting for Presumptive Taxation (Sec 44AD/44ADA/44AE)?', parent:'q_business', parentVal:'yes' },
  { id:'q_business_partner', group:'Business & Profession', label:'Is the client a Partner in any Firm or LLP?' },
  { id:'q_interest', group:'Other Sources', label:'Does the client have FD/RD/Savings bank interest income?' },
  { id:'q_dividend', group:'Other Sources', label:'Does the client receive dividends?' },
  { id:'q_lottery', group:'Other Sources', label:'Any winnings from lottery, online games, or horse racing?' },
  { id:'q_gift', group:'Other Sources', label:'Gifts received from non-relatives exceeding ₹50,000?' },
  { id:'q_foreign_income', group:'Foreign Income & Assets', label:'Does the client have any income earned outside India?' },
  { id:'q_foreign_asset', group:'Foreign Income & Assets', label:'Does the client hold any foreign bank accounts or assets?' },
  { id:'q_agri', group:'Agricultural Income', label:'Does the client have any agricultural income?' },
  { id:'q_agri_above_5k', group:'Agricultural Income', label:'Is agricultural income exceeding ₹5,000?', parent:'q_agri', parentVal:'yes' },
  { id:'q_it_notice', group:'Tax Notices & Special', label:'Has the client received any Income Tax notice or demand?' },
  { id:'q_high_cash', group:'Tax Notices & Special', label:'Were there any cash deposits > ₹10 lakh in the year?' },
];

const G = [...new Set(QS.map(q => q.group))];

function getLabel(id: string): string { return QS.find(q => q.id === id)?.label || id; }

export default function ITRAssessmentPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [login, setLogin] = useState({ name:'', empId:'', dept:'', clientType:'' });
  const [client, setClient] = useState({ name:'', pan:'', state:'', entityType:'', residentialStatus:'', priorYear:'' });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [itrResult, setItrResult] = useState<string | null>(null);
  const [itrReason, setItrReason] = useState('');
  const [heads, setHeads] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [escalations, setEscalations] = useState<string[]>([]);
  const [readiness, setReadiness] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [mandatoryDocs, setMandatoryDocs] = useState<string[]>([]);
  const [conditionalDocs, setConditionalDocs] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const updateClient = (k: keyof typeof client, v: string) => setClient(c => ({ ...c, [k]: v }));

  const setAns = (id: string, val: string) => {
    setAnswers(a => ({ ...a, [id]: val }));
    setStep(2);
  };

  const getVal = (id: string): string => answers[id] || '';

  const runEngine = useCallback(() => {
    const A = answers;
    const h: string[] = [], r: string[] = [], e: string[] = [];

    if (A.q_salary === 'yes') h.push('Salary Income');
    if (A.q_pension === 'yes') h.push('Pension Income');
    if (A.q_salary_multi === 'yes') r.push('Multiple employers — aggregate TDS risk');
    if (A.q_salary_arrears === 'yes') r.push('Salary arrears — Section 89 relief required');
    if (A.q_property_own === 'yes') h.push('House Property Income');
    if (A.q_property_letout === 'yes') h.push('Rental Income');
    if (A.q_cg === 'yes') h.push('Capital Gains');
    if (A.q_cg_equity === 'yes') h.push('LTCG/STCG — Equity MF & Shares');
    if (A.q_cg_property === 'yes') { h.push('Capital Gains — Property'); r.push('Section 50C circle rate check required'); }
    if (A.q_cg_crypto === 'yes') { h.push('VDA / Cryptocurrency'); e.push('CRYPTO — Mandatory escalation: Schedule VDA, 30% flat tax, ITR-2 or ITR-3 required'); }
    if (A.q_cg_fo === 'yes') { h.push('F&O Trading Income'); e.push('F&O — Business income: ITR-3 mandatory, books required, possible tax audit'); }
    if (A.q_business === 'yes') h.push('Business / Professional Income');
    if (A.q_business_presumptive === 'yes') h.push('Presumptive Taxation (44AD/44ADA)');
    if (A.q_business_partner === 'yes') r.push('Partner in firm — share of profit to be included');
    if (A.q_interest === 'yes') h.push('Interest Income (FD/RD/Savings)');
    if (A.q_dividend === 'yes') h.push('Dividend Income');
    if (A.q_lottery === 'yes') { h.push('Lottery / Online Game Winnings'); r.push('Winnings: 30% flat tax u/s 115BB'); }
    if (A.q_gift === 'yes') { h.push('Gift Income (Taxable)'); r.push('Gift from non-relative > ₹50,000 fully taxable'); }
    if (A.q_foreign_income === 'yes') { h.push('Foreign Income'); e.push('Foreign income — ITR-2 minimum, Schedule FSI, L3 Reviewer mandatory'); }
    if (A.q_foreign_asset === 'yes') { h.push('Foreign Assets'); e.push('Foreign assets — Schedule FA mandatory, L3 Reviewer mandatory'); }
    if (A.q_agri_above_5k === 'yes') { h.push('Agricultural Income (> ₹5,000)'); r.push('Agri income > ₹5,000 used for rate computation'); }
    if (A.q_it_notice === 'yes') e.push('Pending IT notice — Reviewer must clear before filing');
    if (A.q_high_cash === 'yes') e.push('High-value cash deposits > ₹10L — SFT reported in AIS');

    setHeads(h); setRisks(r); setEscalations(e);

    // ITR Determination
    const entity = client.entityType;
    const residency = client.residentialStatus;
    let itr = '', reason = '';

    if (entity === 'company') { itr = 'ITR-6'; reason = 'Companies file ITR-6.'; }
    else if (entity === 'llp') { itr = 'ITR-5'; reason = 'LLPs and firms file ITR-5.'; }
    else if (entity === 'firm') {
      itr = A.q_business_presumptive === 'yes' ? 'ITR-4' : 'ITR-5';
      reason = itr === 'ITR-4' ? 'Firm opting for presumptive taxation.' : 'Firm with actual books.';
    } else {
      const cg = A.q_cg === 'yes', business = A.q_business === 'yes', fo = A.q_cg_fo === 'yes';
      const crypto = A.q_cg_crypto === 'yes', foreign = A.q_foreign_income === 'yes' || A.q_foreign_asset === 'yes';
      const nri = residency === 'nri' || residency === 'rnor';
      const partner = A.q_business_partner === 'yes';

      if (fo) { itr = 'ITR-3'; reason = 'F&O transactions treated as business income. ITR-3 mandatory.'; }
      else if (business && !A.q_business_presumptive) { itr = 'ITR-3'; reason = 'Business income with actual books requires ITR-3.'; }
      else if (A.q_business_turnover === 'Above Rs.3 Cr') { itr = 'ITR-3'; reason = 'Turnover exceeds ₹3Cr — presumptive not applicable.'; }
      else if (A.q_business_presumptive && !nri && !foreign && !cg && !crypto) { itr = 'ITR-4'; reason = 'Presumptive taxation eligible for ITR-4.'; if (crypto) { itr = 'ITR-3'; reason = 'Crypto disqualifies ITR-4.'; } }
      else if (!cg && !business && !partner && !nri && !foreign && !crypto && !fo) { itr = 'ITR-1'; reason = 'Only salary/pension and interest — all ITR-1 conditions met.'; }
      else { itr = 'ITR-2'; reason = 'Complex income profile requiring ITR-2.'; }
    }

    setItrResult(itr);
    setItrReason(reason);

    // Readiness
    const qFilled = Object.keys(A).length;
    const totalQ = QS.length;
    let rsk = 0;
    if (A.q_cg_property === 'yes') rsk += 2; if (A.q_cg_crypto === 'yes') rsk += 3; if (A.q_cg_fo === 'yes') rsk += 3;
    if (A.q_foreign_income === 'yes' || A.q_foreign_asset === 'yes') rsk += 4;
    if (A.q_it_notice === 'yes') rsk += 3; if (A.q_high_cash === 'yes') rsk += 2;
    rsk = Math.min(rsk, 10);
    setRiskScore(rsk);

    const read = Math.max(0, Math.min(100, Math.round((qFilled / totalQ) * 100) - rsk * 3));
    setReadiness(read);

    // Document requirements
    const md: string[] = [], cd: string[] = [];
    md.push('PAN Card copy', 'Aadhaar Card copy');
    if (A.q_salary === 'yes') {
      md.push('Form 16 — Part A & B from employer', 'Salary Slips — Apr 2025 to Mar 2026');
      if (A.q_salary_multi === 'yes') cd.push('Form 16 from ALL employers (previous + current)');
      if (A.q_salary_arrears === 'yes') cd.push('Arrears breakup from HR (for Sec 89 Form 10E)');
    }
    if (A.q_property_homeloan === 'yes') cd.push('Home Loan Interest Certificate from bank', 'Property Registration Documents');
    if (A.q_property_letout === 'yes') cd.push('Rental Agreement(s)', 'Municipal Tax Receipt');
    if (A.q_cg === 'yes') {
      md.push('Annual Information Statement (AIS) — AY 2026-27');
      if (A.q_cg_equity === 'yes') md.push('Capital Gains Statement from Broker', 'CAMS/KFintech Consolidated MF Statement');
      if (A.q_cg_property === 'yes') md.push('Property Sale Deed (registered)');
      if (A.q_cg_crypto === 'yes') md.push('Crypto exchange transaction history (ALL exchanges)');
      if (A.q_cg_fo === 'yes') md.push('F&O trade statement from broker (full year)');
    }
    if (A.q_business === 'yes') {
      md.push('Bank Statements — all accounts (Apr 2025 to Mar 2026)');
      if (!A.q_business_presumptive) md.push('Profit & Loss Account (FY 2025-26)', 'Balance Sheet as at 31 Mar 2026');
    }
    if (A.q_interest === 'yes') cd.push('FD/RD Interest Certificates from all banks');
    if (A.q_foreign_income === 'yes' || A.q_foreign_asset === 'yes') {
      md.push('Foreign bank account statements', 'Form 67 (foreign tax credit claim)');
    }
    if (A.q_it_notice === 'yes') md.push('Copy of all pending IT Notices / Demand Orders');
    md.push('Bank account details (all accounts) with IFSC', 'Challan 280 (if advance tax paid)');

    setMandatoryDocs(md);
    setConditionalDocs(cd);
    setShowDashboard(true);
    setStep(4);
  }, [answers, client]);

  const downloadReport = () => {
    const html = `<div><div style="text-align:center;font-size:15pt;font-weight:bold;font-family:'Bookman Old Style',serif;margin-bottom:2pt;">Viksit Consulting</div>
<div style="text-align:center;font-size:13pt;font-family:'Bookman Old Style',serif;margin-bottom:8pt;">Kurnool Delivery Centre — Internal Tax Assessment Tool</div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">ITR Assessment Report — AY 2026-27</div>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Document Control</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><tr><th colspan="2" style="font-size:13pt;">Assessment Details</th></tr>
<tr><td style="width:180pt;">Client Name</td><td>${client.name || '—'}</td></tr>
<tr><td>PAN</td><td>${client.pan || '—'}</td></tr>
<tr><td>Entity Type</td><td>${client.entityType || '—'}</td></tr>
<tr><td>Residential Status</td><td>${client.residentialStatus || '—'}</td></tr>
<tr><td>Assessed By</td><td>${login.name} (${login.empId})</td></tr>
</table></div>

<div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">ITR Form Determination</div>
<div style="background:#1a1209;color:#faf7f0;text-align:center;padding:24pt;margin:14pt 0;"><div style="font-size:15pt;font-weight:bold;font-family:'Bookman Old Style',serif;">${itrResult || '—'}</div></div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;">${itrReason}</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Assessment Scores</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><tr><th style="font-size:13pt;">Indicator</th><th style="width:100pt;font-size:13pt;">Value</th></tr>
<tr><td>Filing Readiness</td><td><b>${readiness}%</b></td></tr>
<tr><td>Risk Score</td><td><b>${riskScore}/10</b></td></tr>
<tr><td>Escalation Alerts</td><td>${escalations.length}</td></tr>
<tr><td>Income Heads Identified</td><td>${heads.length}</td></tr>
</table></div>

<div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">Income Heads Identified</div>
${heads.length ? `<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">${heads.map(h => `<li>${h}</li>`).join('')}</ul>` : '<p style="font-family:\'Bookman Old Style\',serif;font-size:13pt;">None identified.</p>'}
${escalations.length ? `<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Escalation Alerts</div>${escalations.map(e => `<div style="background:#fdf0f0;border-left:4pt solid #8b2020;padding:6pt 10pt;margin:4pt 0;font-size:10.5pt;"><b>ESCALATION:</b> ${e}</div>`).join('')}` : ''}
${risks.length ? `<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Risk Flags</div><ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">${risks.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
</div>

<div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">Document Requirement List</div>
${mandatoryDocs.length ? `<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Mandatory Documents</div><ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">${mandatoryDocs.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
${conditionalDocs.length ? `<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Conditional / Situation-Specific</div><ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">${conditionalDocs.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
</div>

<div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">Filing Action Plan</div>
<ol style="font-family:'Bookman Old Style',serif;font-size:13pt;"><li>Collect all mandatory documents</li><li>Download AIS + Form 26AS</li><li>Reconcile AIS with all documents</li><li>Compute income head-by-head</li><li>Verify TDS against 26AS</li><li>Prepare ITR draft on portal</li><li>Submit to Checker (L2) with complete file</li><li>Obtain client written approval</li><li>Pay outstanding tax via Challan 280</li><li>File and e-verify via Aadhaar OTP</li></ol>
<p style="margin-top:24pt;text-align:center;font-size:13pt;font-family:'Bookman Old Style',serif;"><i>Confidential — Internal Use Only | Viksit Management Consultancy | Kurnool Delivery Centre</i></p></div>`;
    downloadDoc(html, `ITR_Assessment_${client.name.replace(/\s+/g, '_')}_AY2627`);
  };

  const reset = () => {
    setLogin({ name:'', empId:'', dept:'', clientType:'' });
    setClient({ name:'', pan:'', state:'', entityType:'', residentialStatus:'', priorYear:'' });
    setAnswers({}); setShowDashboard(false); setItrResult(null); setLoggedIn(false);
    setHeads([]); setRisks([]); setEscalations([]); setStep(1);
  };

  if (!loggedIn) return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1B3A6B] rounded-xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-4">V</div>
          <h1 className="font-serif text-2xl text-[#1B3A6B]">Viksit Consulting</h1>
          <p className="text-xs text-[#6B7C93] mt-1">Internal Tax Assessment Tool — AY 2026-27</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2"><Field2 label="Associate Name" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={login.name} onChange={e => setLogin(l => ({ ...l, name: e.target.value }))} /></Field2></div>
          <Field2 label="Employee ID" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={login.empId} onChange={e => setLogin(l => ({ ...l, empId: e.target.value }))} /></Field2>
          <Field2 label="Department">
            <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={login.dept} onChange={e => setLogin(l => ({ ...l, dept: e.target.value }))}>
              <option value="">Select</option>
              <option>P2 — Tax & Compliance</option><option>P1 — Financial Foundation</option>
              <option>P3 — Business Advisory</option><option>P4 — Capital & Value Creation</option>
            </select>
          </Field2>
          <Field2 label="Client Category" required>
            <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={login.clientType} onChange={e => setLogin(l => ({ ...l, clientType: e.target.value }))}>
              <option value="">Select</option><option value="new">New Client</option><option value="existing">Existing Client</option>
            </select>
          </Field2>
        </div>
        <button onClick={() => { if (login.name && login.empId && login.clientType) setLoggedIn(true); else alert('Fill required fields'); }}
          className="w-full py-3 rounded-xl bg-[#1B3A6B] text-white font-semibold text-sm hover:bg-[#2A4F8F] transition cursor-pointer">▶ Begin Assessment Session</button>
        <p className="text-center text-[10px] text-[#6B7C93] mt-6">Confidential — Internal Use Only | Kurnool Delivery Centre | Version 1.0</p>
      </div>
    </div>
  );

  const navSteps = ['Client Info', 'Questionnaire', 'ITR Result', 'Requirements', 'Dashboard'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {navSteps.map((l, i) => (
          <button key={l} onClick={() => { if (i <= step) setStep(i + 1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
              step === i + 1 ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' :
              step > i + 1 ? 'bg-[#EDF7F1] text-[#217A3C] border-[#217A3C]' :
              'bg-white text-[#6B7C93] border-[#E2E8F0]'
            }`}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-current text-white">{step > i + 1 ? '✓' : i + 1}</span>
            {l}
          </button>
        ))}
        <span className="ml-auto text-xs font-semibold text-[#1B3A6B]">{login.name} | {login.empId}</span>
      </div>

      {/* STEP 1: Client Info */}
      {step === 1 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2A4F8F] px-6 py-4 text-white flex items-center gap-3">
            <span className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg">👤</span>
            <div><div className="font-semibold">Step 1 — Client Basic Information</div><div className="text-xs text-white/65">Capture client profile to begin</div></div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Field2 label="Client Full Name" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={client.name} onChange={e => updateClient('name', e.target.value)} /></Field2></div>
              <Field2 label="PAN Number" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10 uppercase" maxLength={10} placeholder="ABCDT1234K" value={client.pan} onChange={e => updateClient('pan', e.target.value)} /></Field2>
              <Field2 label="State"><select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={client.state} onChange={e => updateClient('state', e.target.value)}><option value="">Select</option><option>Andhra Pradesh</option><option>Telangana</option><option>Karnataka</option><option>Tamil Nadu</option><option>Maharashtra</option><option>Other</option></select></Field2>
              <Field2 label="Entity Type" required>
                <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={client.entityType} onChange={e => updateClient('entityType', e.target.value)}>
                  <option value="">Select entity</option><option value="individual">Individual</option><option value="huf">HUF</option>
                  <option value="firm">Firm / Partnership</option><option value="llp">LLP</option><option value="company">Private/Public Company</option>
                </select>
              </Field2>
              <Field2 label="Residential Status (FY 2025-26)" required>
                <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={client.residentialStatus} onChange={e => updateClient('residentialStatus', e.target.value)}>
                  <option value="">Select</option><option value="resident">Resident (ROR)</option><option value="rnor">RNOR</option><option value="nri">NRI</option>
                </select>
              </Field2>
              <Field2 label="Prior Year ITR Filed? (AY 2025-26)">
                <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={client.priorYear} onChange={e => updateClient('priorYear', e.target.value)}>
                  <option value="">Select</option><option value="yes">Yes — Filed on time</option><option value="late">Yes — Filed late</option><option value="no">No</option><option value="na">First time</option>
                </select>
              </Field2>
            </div>
            <button onClick={() => { if (client.name && client.pan && client.entityType && client.residentialStatus) setStep(2); else alert('Fill required fields'); }}
              className="mt-6 px-6 py-2.5 rounded-lg bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#2A4F8F] transition cursor-pointer">Continue to Questionnaire →</button>
          </div>
        </div>
      )}

      {/* STEP 2: Questionnaire */}
      {step === 2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2A4F8F] px-6 py-4 text-white flex items-center gap-3">
            <span className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg">📋</span>
            <div><div className="font-semibold">Step 2 — Income &amp; Transaction Interview</div><div className="text-xs text-white/65">Ask each question during client call</div></div>
          </div>
          <div className="p-6">
            {G.map(group => (
              <div key={group}>
                <div className="flex items-center gap-3 my-4 text-[11px] uppercase tracking-wider text-[#94A3B8]"><span className="flex-1 h-px bg-[#E2E8F0]" /><span className="font-semibold">{group}</span><span className="flex-1 h-px bg-[#E2E8F0]" /></div>
                {QS.filter(q => q.group === group && !q.parent).map(q => {
                  const isAnswered = answers[q.id];
                  const children = QS.filter(c => c.parent === q.id);
                  return (
                    <div key={q.id} className={`border rounded-lg p-4 mb-3 transition-colors ${isAnswered ? 'border-[#B8EED1] bg-[#F6FEFC]' : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'}`}>
                      <div className="text-sm font-semibold text-[#334155] mb-3 flex items-start gap-2">
                        <span className="bg-[#1B3A6B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5">{q.id.split('_').slice(1).join(' ').slice(0, 8)}</span>
                        {q.label}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setAns(q.id, 'yes')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${answers[q.id] === 'yes' ? 'bg-[#0E7C7B] text-white border-[#0E7C7B]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0E7C7B]'}`}>Yes</button>
                        <button onClick={() => setAns(q.id, 'no')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${answers[q.id] === 'no' ? 'bg-[#C00000] text-white border-[#C00000]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#C00000]'}`}>No / N/A</button>
                      </div>
                      {children.length > 0 && answers[q.id] === 'yes' && (
                        <div className="mt-4 pl-4 border-l-2 border-[#0E7C7B]">
                          {children.map(c => (
                            <div key={c.id} className="mb-3">
                              <div className="text-xs font-semibold text-[#334155] mb-1.5">{c.label}</div>
                              <div className="flex gap-2">
                                <button onClick={() => setAns(c.id, 'yes')} className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer ${answers[c.id] === 'yes' ? 'bg-[#0E7C7B] text-white border-[#0E7C7B]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}>Yes</button>
                                <button onClick={() => setAns(c.id, 'no')} className={`px-3 py-1 rounded text-xs font-semibold border transition cursor-pointer ${answers[c.id] === 'no' ? 'bg-[#C00000] text-white border-[#C00000]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}>No</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border-2 border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:border-[#1B3A6B] transition cursor-pointer">← Back</button>
              <button onClick={runEngine} className="px-6 py-2.5 rounded-lg bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#2A4F8F] transition cursor-pointer">Analyse &amp; Determine ITR →</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ITR Result */}
      {step === 3 && itrResult && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0E7C7B] px-6 py-4 text-white flex items-center gap-3">
            <span className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg">⚡</span>
            <div><div className="font-semibold">Step 3 — ITR Applicability Determination</div><div className="text-xs text-white/65">Rule-based engine result for AY 2026-27</div></div>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0E7C7B] rounded-xl p-8 text-white text-center mb-6 shadow-lg">
              <div className="text-5xl font-bold tracking-tight">{itrResult}</div>
              <div className="text-sm text-white/70 mt-2">Applicable ITR Form — AY 2026-27</div>
              <div className="mt-4 text-xs text-white/80 bg-white/10 rounded-lg p-3 text-left">{itrReason}</div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <ScoreBox value={`${readiness}%`} label="Filing Readiness" color={readiness >= 70 ? '#217A3C' : readiness >= 40 ? '#C55A11' : '#C00000'} />
              <ScoreBox value={`${riskScore}/10`} label="Risk Score" color={riskScore >= 7 ? '#C00000' : riskScore >= 4 ? '#C55A11' : '#217A3C'} />
              <ScoreBox value={String(escalations.length)} label="Escalation Alerts" color={escalations.length > 0 ? '#C55A11' : '#217A3C'} />
            </div>
            {heads.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#1B3A6B] mb-3 pb-2 border-b-2 border-[#0E7C7B]">📋 Income Heads Identified</h3>
                <div className="flex flex-wrap gap-2">{heads.map(h => <span key={h} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0E7C7B] text-white">✓ {h}</span>)}</div>
              </div>
            )}
            {risks.length > 0 && (
              <div className="mb-6">{risks.map((r, i) => <div key={i} className="flex gap-3 p-3 rounded-lg mb-2 bg-[#FFF4EC] border-l-4 border-[#C55A11] text-xs text-[#7A3910]">⚠ {r}</div>)}</div>
            )}
            {escalations.length > 0 && (
              <div className="mb-6">{escalations.map((e, i) => <div key={i} className="flex gap-3 p-3 rounded-lg mb-2 bg-[#FDECEA] border-l-4 border-[#C00000] text-xs text-[#7A0000]"><b>🚨 Escalation:</b> {e}</div>)}</div>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg border-2 border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:border-[#1B3A6B] transition cursor-pointer">← Back</button>
              <button onClick={() => setStep(4)} className="px-6 py-2.5 rounded-lg bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#2A4F8F] transition cursor-pointer">Continue to Requirements →</button>
            </div>
          </div>
        </div>
      )}
      {step === 3 && !itrResult && <p className="text-center text-sm text-[#6B7C93] py-8">Run the analysis first</p>}

      {/* STEP 4: Requirements */}
      {step === 4 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2A4F8F] px-6 py-4 text-white flex items-center gap-3">
            <span className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg">📁</span>
            <div><div className="font-semibold">Step 4 — Document Requirement List</div><div className="text-xs text-white/65">Generated based on income profile</div></div>
          </div>
          <div className="p-6">
            {mandatoryDocs.length > 0 && <DocSection title="🔴 Mandatory Documents" items={mandatoryDocs} />}
            {conditionalDocs.length > 0 && <DocSection title="🟡 Conditional / Situation-Specific" items={conditionalDocs} />}
            <DocSection title="🟢 Optional / Deduction-Related" items={['Investment proofs (LIC, PPF, ELSS)','Health insurance premium receipts','NPS statement — Tier I','Education loan interest certificate','Donation receipts with institution PAN']} />
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg border-2 border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:border-[#1B3A6B] transition cursor-pointer">← Back</button>
              <button onClick={() => setStep(5)} className="px-6 py-2.5 rounded-lg bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#2A4F8F] transition cursor-pointer">View Dashboard →</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Dashboard */}
      {step === 5 && showDashboard && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2A4F8F] px-6 py-4 text-white flex items-center gap-3">
              <span className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg">📊</span>
              <div><div className="font-semibold">Final Assessment Dashboard</div><div className="text-xs text-white/65">Complete summary ready for filing</div></div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#1B3A6B] mb-3 pb-2 border-b-2 border-[#0E7C7B]">👤 Client Summary</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {[['Client Name', client.name], ['PAN', client.pan], ['Entity', client.entityType], ['Residency', client.residentialStatus], ['Assessed By', `${login.name} (${login.empId})`], ['Category', login.clientType === 'new' ? 'New Client' : 'Existing Client']].map(([k, v]) => (
                  <div key={k} className="flex justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs"><span className="text-[#64748B] font-medium">{k}</span><span className="text-[#1E293B] font-semibold">{v || '—'}</span></div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0E7C7B] rounded-xl p-8 text-white text-center mb-6 shadow-lg">
                <div className="text-5xl font-bold tracking-tight">{itrResult}</div>
                <div className="text-sm text-white/70 mt-2">Applicable ITR Form — AY 2026-27</div>
                <div className="mt-4 text-xs text-white/80 bg-white/10 rounded-lg p-3 text-left">{itrReason}</div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <ScoreBox value={`${readiness}%`} label="Filing Readiness" color={readiness >= 70 ? '#217A3C' : readiness >= 40 ? '#C55A11' : '#C00000'} />
                <ScoreBox value={`${riskScore}/10`} label="Risk Score" color={riskScore >= 7 ? '#C00000' : riskScore >= 4 ? '#C55A11' : '#217A3C'} />
                <ScoreBox value={escalations.length > 0 ? `🚨 ${escalations.length}` : '✓ Nil'} label="Escalations" color={escalations.length > 0 ? '#C55A11' : '#217A3C'} />
              </div>
              <div className="mb-6"><h3 className="text-sm font-bold text-[#1B3A6B] mb-3 pb-2 border-b-2 border-[#0E7C7B]">📋 Income Heads</h3><div className="flex flex-wrap gap-2">{heads.length ? heads.map(h => <span key={h} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0E7C7B] text-white">✓ {h}</span>) : <span className="text-xs text-[#6B7C93]">None identified</span>}</div></div>
              {escalations.length > 0 && <div className="mb-6">{escalations.map((e, i) => <div key={i} className="flex gap-3 p-3 rounded-lg mb-2 bg-[#FDECEA] border-l-4 border-[#C00000] text-xs text-[#7A0000]"><b>🚨</b> {e}</div>)}</div>}
              <h3 className="text-sm font-bold text-[#1B3A6B] mb-3 pb-2 border-b-2 border-[#0E7C7B]">📅 Filing Action Plan</h3>
              <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] mb-6">
                <table className="w-full text-xs">
                  <thead><tr className="bg-[#1B3A6B] text-white"><th className="p-2 text-left">Step</th><th className="p-2 text-left">Action</th><th className="p-2 text-left">Owner</th></tr></thead>
                  <tbody>
                    {[['1', 'Collect all mandatory documents', 'L1 Associate'], ['2', 'Download AIS + Form 26AS', 'L1 Associate'], ['3', 'Reconcile AIS with all documents', 'L1 Associate'], ['4', 'Compute income head-by-head', 'L1 Associate'], ['5', 'Verify TDS against 26AS', 'L1 Associate'], ['6', 'Prepare ITR draft on portal', 'L1 Associate'], ['7', 'Submit to Checker (L2) with complete file', 'L2 Checker'], ['8', 'Obtain client written approval', 'L1 + L2'], ['9', 'Pay outstanding tax via Challan 280', 'L1 + Client'], ['10', 'File & e-verify via Aadhaar OTP', 'L2 Checker']].map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#F8FAFC]' : ''}><td className="p-2 border-t border-[#E2E8F0]">{r[0]}</td><td className="p-2 border-t border-[#E2E8F0]">{r[1]}</td><td className="p-2 border-t border-[#E2E8F0]">{r[2]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                <button onClick={downloadReport} className="px-6 py-3 rounded-xl bg-[#0E7C7B] text-white text-sm font-semibold shadow-md hover:bg-[#13A8A7] transition cursor-pointer">⬇ Download DOC Report</button>
                <button onClick={reset} className="px-6 py-3 rounded-xl bg-[#C55A11] text-white text-sm font-semibold shadow-md hover:bg-[#A84A0D] transition cursor-pointer">↺ New Assessment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field2({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold text-[#64748B]">{label}{required && <span className="text-[#C00000] ml-0.5">*</span>}</label>{children}</div>;
}

function ScoreBox({ value, label, color }: { value: string; label: string; color: string }) {
  return <div className="bg-white rounded-xl p-4 border-2 border-[#E2E8F0] text-center"><div className="text-2xl font-bold" style={{ color }}>{value}</div><div className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-wider mt-1">{label}</div></div>;
}

function DocSection({ title, items }: { title: string; items: string[] }) {
  return <div className="mb-5"><h4 className="text-[11px] font-bold uppercase tracking-wider bg-[#FDECEA] text-[#C00000] px-2.5 py-1 rounded mb-2 inline-block">{title}</h4><div className="space-y-1">{items.map((d, i) => <div key={i} className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155]">{d}</div>)}</div></div>;
}
