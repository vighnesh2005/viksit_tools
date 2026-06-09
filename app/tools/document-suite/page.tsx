'use client';
import { useState } from 'react';
import { formatDateShort, formatDateLong, cls } from '@/lib/utils';
import { downloadDoc } from '@/lib/doc-generator';
import { SOC_DESIGS } from '@/lib/constants';

interface CoPartner { name: string; }
interface Form1Partner { name: string; rel: string; father: string; age: string; address: string; joining: string; }
interface PhotoEntry { name: string; rel: string; father: string; address: string; }
interface SocMember { name: string; rel: string; father: string; age: string; addr: string; desig: string; }
interface SocWitness { name: string; rel: string; father: string; addr: string; }

const inputClass = "w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#7a6e5a] uppercase tracking-wider">{label}{required && <span className="text-[#8b2020] ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

export default function DocumentSuitePage() {
  const [activeModule, setActiveModule] = useState('firm_docs');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-[#1a1209]">Document Suite</h1>
        <p className="text-sm text-[#7a6e5a] mt-1">Generate firm registration documents and society registration paperwork under one roof.</p>
      </div>

      <div className="flex gap-0 border-b-2 border-[#b8860b] bg-[#1a1209] rounded-t-xl overflow-hidden mb-8">
        {[
          { key: 'firm_docs', label: 'Firm Docs', tag: 'Registration' },
          { key: 'society', label: 'Society Registration', tag: 'Act 35/2001' },
        ].map(m => (
          <button key={m.key} onClick={() => setActiveModule(m.key)}
            className={cls(
              'px-5 py-3 text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2',
              activeModule === m.key ? 'text-[#b8860b] border-b-3 border-[#b8860b] bg-[#1a1209]' : 'text-[#7a6e5a] hover:text-[#f5e9c8]'
            )}>
            {m.label}
            <span className="text-[10px] bg-[#b8860b]/20 text-[#b8860b] px-2 py-0.5 rounded-full">{m.tag}</span>
          </button>
        ))}
      </div>

      {activeModule === 'firm_docs' && <FirmDocsModule />}
      {activeModule === 'society' && <SocietyModule />}
    </div>
  );
}

// ─── FIRM DOCS MODULE ───────────────────────────────────────────
function FirmDocsModule() {
  const [activeDoc, setActiveDoc] = useState('affidavit');
  const [cpCount, setCpCount] = useState(2);
  const [f1Count, setF1Count] = useState(2);
  const [pfPC, setPfPC] = useState(2);
  const [pfWC, setPfWC] = useState(1);

  const showDoc = (title: string, html: string) => {
    downloadDoc(html, title.replace(/[^a-zA-Z0-9]/g, '_'));
  };

  return (
    <div>
      <div className="text-sm text-[#7a6e5a] mb-6">Generate supporting documents required for Partnership Firm Registration.</div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { key: 'affidavit', icon: '📜', label: 'Affidavit', desc: "Owner's premises", badge: 'Section 1' },
          { key: 'form1', icon: '📋', label: 'Form No. 1', desc: 'Registration u/s 58', badge: 'IPA 1932' },
          { key: 'photoform', icon: '🪪', label: 'Photo Form', desc: 'Partners & Witnesses KYC', badge: 'KYC' },
        ].map(d => (
          <button key={d.key} onClick={() => setActiveDoc(d.key)}
            className={`relative border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${activeDoc === d.key ? 'border-[#2c4a1e] bg-[#2c4a1e] text-white' : 'border-[#d6c9a0] bg-white hover:border-[#b8860b] hover:bg-[#f5e9c8]'}`}>
            <span className="absolute -top-2.5 right-2 bg-[#b8860b] text-[#1a1209] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{d.badge}</span>
            <div className="text-2xl mb-1">{d.icon}</div>
            <div className="font-serif font-semibold text-sm">{d.label}</div>
            <div className="text-[10px] mt-1 opacity-65">{d.desc}</div>
          </button>
        ))}
      </div>
      {activeDoc === 'affidavit' && <AffidavitPanel cpCount={cpCount} setCpCount={setCpCount} showDoc={showDoc} />}
      {activeDoc === 'form1' && <Form1Panel f1Count={f1Count} setF1Count={setF1Count} showDoc={showDoc} />}
      {activeDoc === 'photoform' && <PhotoFormPanel pfPC={pfPC} setPfPC={setPfPC} pfWC={pfWC} setPfWC={setPfWC} showDoc={showDoc} />}
    </div>
  );
}

function AffidavitPanel({ cpCount, setCpCount, showDoc }: { cpCount: number; setCpCount: (n: number) => void; showDoc: (t: string, h: string) => void }) {
  const [data, setData] = useState({ name: '', rel: 'S/o', father: '', age: '', address: '', firm: '', dateComm: '', officeAddr: '', station: '', signDate: '', premises: 'owner', reg: 'yes' });
  const [cp, setCp] = useState<CoPartner[]>([]);
  const u = (k: string, v: string) => setData(d => ({ ...d, [k]: v }));
  const updateCp = (i: number, v: string) => {
    setCp(c => { const n = [...c]; while (n.length <= i) n.push({ name: '' }); n[i] = { name: v }; return n; });
  };

  const generate = () => {
    const { name, rel, father, age, address, firm, dateComm, officeAddr, station, signDate, premises, reg } = data;
    if (!name || !father || !age || !address || !firm || !dateComm || !officeAddr || !station || !signDate) { alert('Fill all required fields.'); return; }
    const cpList = cp.slice(0, cpCount);
    for (let i = 0; i < cpList.length; i++) { if (!cpList[i]?.name) { alert(`Enter name for Co-Partner ${i + 1}.`); return; } }
    const isOwner = premises === 'owner';
    const hasReg = reg === 'yes';
    const html = `<div><div class="affidavit-title">AFFIDAVIT</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;"><b>${name}</b>, <b>${rel} ${father}</b>, aged <b>${age} years</b> residing at ${address} do hereby affirm and state as follows:</p>
<ol style="font-family:'Bookman Old Style',serif;font-size:13pt;margin:4pt 0 4pt 24pt;">
  <li style="margin-bottom:4pt;">I, <b>${name}</b> have floated a Partnership Firm with ${cpList.map(p => `<b>${p.name}</b>`).join(' , ')} as the partner${cpList.length > 1 ? 's' : ''} to carry on the business under the name and style of <b>"${firm}"</b>.</li>
  <li style="margin-bottom:4pt;">The said Firm commenced the business from ${formatDateLong(dateComm)} and the office of the firm is situated at ${officeAddr} and the said premises belong to me.</li>
  ${hasReg ? `<li style="margin-bottom:4pt;">The said firm has applied for Registration to the Registrar of Firms, ${station}.</li>` : ''}
  ${isOwner ? `<li style="margin-bottom:4pt;">I have no objection and give my consent and acceptance for running the said firm in my building and I am not collecting any rent from the said firm because I am also one of the partners in the firm.</li>` : `<li style="margin-bottom:4pt;">I have no objection and give my consent and acceptance for running the said firm in the said premises.</li>`}
</ol>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin:10pt 0 6pt;">Solemnly affirmed at ${station} on this day ${formatDateShort(signDate)}.</p>
<div style="margin-top:18pt;text-align:right;"><div style="border-bottom:1pt solid #000;display:inline-block;width:160pt;margin-top:8pt;"></div><br><b>DEPONENT</b></div>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${station}</span><span>Date: ${formatDateShort(signDate)}</span></div></div>`;
    showDoc('Affidavit_' + firm, html);
  };

  return (
    <div>
      <div className="bg-[#f5e9c8] border border-[#b8860b] rounded-lg px-4 py-3 text-xs text-[#5a4a00] mb-6">
        This affidavit is made by the <b>property owner-partner</b> declaring the firm&rsquo;s office premises and consent for its use.
      </div>
      <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
        <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">📜 Affidavit</h2>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Deponent<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><Field label="Full Name" required><input className={inputClass} value={data.name} onChange={e => u('name', e.target.value)} /></Field></div>
          <Field label="Relationship">
            <select className={inputClass} value={data.rel} onChange={e => u('rel', e.target.value)}><option value="S/o">S/o</option><option value="D/o">D/o</option><option value="W/o">W/o</option></select>
          </Field>
          <Field label="Father / Husband Name" required><input className={inputClass} value={data.father} onChange={e => u('father', e.target.value)} /></Field>
          <Field label="Age" required><input type="number" className={inputClass} value={data.age} onChange={e => u('age', e.target.value)} min={18} max={99} /></Field>
          <div className="md:col-span-3"><Field label="Residential Address" required><textarea className={`${inputClass} min-h-[60px]`} value={data.address} onChange={e => u('address', e.target.value)} rows={2} /></Field></div>
        </div>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Firm Details<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Firm Name" required><input className={inputClass} value={data.firm} onChange={e => u('firm', e.target.value)} /></Field>
          <Field label="Date of Commencement" required><input type="date" className={inputClass} value={data.dateComm} onChange={e => u('dateComm', e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Office / Premises Address" required><input className={inputClass} value={data.officeAddr} onChange={e => u('officeAddr', e.target.value)} /></Field></div>
        </div>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Co-Partners<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCpCount(Math.max(1, cpCount - 1))} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
          <span className="font-serif text-xl font-semibold text-[#2c4a1e] min-w-[28px] text-center">{cpCount}</span>
          <button onClick={() => setCpCount(cpCount + 1)} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
          <span className="text-xs text-[#7a6e5a]">other partners besides the deponent</span>
        </div>
        {Array.from({ length: cpCount }).map((_, i) => (
          <div key={i} className="border border-[#f5e9c8] rounded-lg p-4 mb-3 bg-gradient-to-br from-[#fffef8] to-[#faf7f0]">
            <div className="font-serif font-semibold text-[#2c4a1e] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2c4a1e] text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              Co-Partner {i + 1}
            </div>
            <Field label="Full Name" required><input className={inputClass} value={cp[i]?.name || ''} onChange={e => updateCp(i, e.target.value)} /></Field>
          </div>
        ))}
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Premises &amp; Affirmation<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Does the deponent own the premises?">
              <div className="flex flex-wrap gap-3">
                {['owner', 'tenant'].map(v => (
                  <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer ${data.premises === v ? 'border-[#2c4a1e] bg-[#f5e9c8] font-semibold' : 'border-[#d6c9a0] bg-white'}`}>
                    <input type="radio" name="aff_premises" value={v} checked={data.premises === v} onChange={() => u('premises', v)} className="accent-[#2c4a1e]" />
                    {v === 'owner' ? 'Yes — Owner (no rent)' : 'No — Rented / Other'}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Signed at (Place)" required><input className={inputClass} value={data.station} onChange={e => u('station', e.target.value)} /></Field>
          <Field label="Date of Signing" required><input type="date" className={inputClass} value={data.signDate} onChange={e => u('signDate', e.target.value)} /></Field>
          <div className="md:col-span-2">
            <Field label="Firm applied for Registration to Registrar of Firms?">
              <div className="flex flex-wrap gap-3">
                {['yes', 'no'].map(v => (
                  <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer ${data.reg === v ? 'border-[#2c4a1e] bg-[#f5e9c8] font-semibold' : 'border-[#d6c9a0] bg-white'}`}>
                    <input type="radio" name="aff_reg" value={v} checked={data.reg === v} onChange={() => u('reg', v)} className="accent-[#2c4a1e]" />
                    {v === 'yes' ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6"><Button variant="gold" onClick={generate}>📜 Generate Affidavit</Button></div>
    </div>
  );
}

function Form1Panel({ f1Count, setF1Count, showDoc }: { f1Count: number; setF1Count: (n: number) => void; showDoc: (t: string, h: string) => void }) {
  const [data, setData] = useState({ firm: '', presentedBy: '', principalPlace: '', otherPlaces: '', nature: '', duration: 'At will', station: '', date: '' });
  const [partners, setPartners] = useState<Form1Partner[]>([]);
  const u = (k: string, v: string) => setData(d => ({ ...d, [k]: v }));
  const updatePartner = (i: number, k: string, v: string) => {
    setPartners(p => { const n = [...p]; while (n.length <= i) n.push({ name: '', rel: 'S/o', father: '', age: '', address: '', joining: '' }); n[i] = { ...n[i], [k]: v }; return n; });
  };

  const generate = () => {
    const { firm, presentedBy, principalPlace, nature, station, date } = data;
    if (!firm || !presentedBy || !principalPlace || !nature || !station || !date) { alert('Fill all required firm fields.'); return; }
    const ps = partners.slice(0, f1Count);
    for (let i = 0; i < ps.length; i++) { if (!ps[i].name || !ps[i].father || !ps[i].age || !ps[i].address || !ps[i].joining) { alert(`Fill all fields for Partner ${i + 1}.`); return; } }
    const tRows = ps.map((p, i) => `<tr><td style="text-align:center;">${i + 1}</td><td>${p.name}</td><td>${formatDateShort(p.joining)}</td><td>${p.address}</td></tr>`).join('');
    const sigs = ps.map(p => `<li style="margin-bottom:6px;">${p.name}</li>`).join('');
    const decls = ps.map(p => `<div class="decl-block"><p>I, <b>${p.name}</b>, <b>${p.rel || 'S/o'} ${p.father}</b>, aged <b>${p.age} Years</b> do hereby declare that the above statement is true and correct to the best of my knowledge and belief.</p><div class="station-row"><span>Date: ${formatDateShort(date)}</span><span>Signature: <span class="sign-line" style="width:130pt;"></span></span></div></div>`).join('');
    const sn = ps.map((p, i) => `${i + 1}. ${p.name.split(' ').map((w, j) => j === 0 ? w[0] + '.' : w).join(' ')}`).join('&nbsp;&nbsp;&nbsp;&nbsp;');
    const html = `<div><div class="form1-title">FORM NO.1</div>
<div style="text-align:center;font-size:13pt;font-weight:bold;margin-bottom:10pt;">THE INDIAN PARTNERSHIP ACT, 1932<br>Registration u/s 58</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Application for the registration of firm by the name <b>"${firm}"</b> presented to the Registrar of Firms by <b>${presentedBy}</b>.</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">We, the undersigned, being the partners of the firm "<b>${firm}</b>", hereby apply for registration of the said firm pursuant to Section 58 of the Indian Partnership Act, 1932.</p>
<div style="font-weight:bold;font-size:13pt;margin:14pt 0 8pt;">Firm Particulars</div>
<table style="border:none;margin:6pt 0;font-size:13pt;">
  <tr><td style="border:none;width:220pt;"><b>The Firm's Name</b></td><td style="border:none;">:&nbsp;&nbsp;<b>${firm}</b></td></tr>
  <tr><td style="border:none;" colspan="2"><b>Place of Business:</b></td></tr>
  <tr><td style="border:none;padding-left:22pt;">(a) Principal Place:</td><td style="border:none;">:&nbsp;&nbsp;${principalPlace}</td></tr>
  <tr><td style="border:none;padding-left:22pt;">(b) Other Places:</td><td style="border:none;">:&nbsp;&nbsp;${data.otherPlaces || '———'}</td></tr>
  <tr><td style="border:none;"><b>Nature of Business</b></td><td style="border:none;">:&nbsp;&nbsp;${nature}</td></tr>
  <tr><td style="border:none;"><b>Duration of the Firm</b></td><td style="border:none;">:&nbsp;&nbsp;${data.duration}</td></tr>
</table>
<p style="margin-left:24pt;font-size:13pt;">${sn}</p>
<div style="font-weight:bold;font-size:13pt;margin:14pt 0 8pt;">Partners Details</div>
<table style="font-size:13pt;"><thead><tr><th style="width:45pt;font-size:13pt;">S.No</th><th style="font-size:13pt;">Name of Partners in full</th><th style="width:120pt;font-size:13pt;">Date of joining the firm</th><th style="font-size:13pt;">Permanent address in full</th></tr></thead><tbody>${tRows}</tbody></table>
<div style="margin-top:16pt;"><div style="text-align:center;font-size:13pt;font-weight:bold;text-decoration:underline;margin-bottom:8pt;">DECLARATION</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">We solemnly and sincerely affirm and state that we, either individually or jointly, are not involved in any activity that offends any rule of law or carrying out any business in contravention of any state or central laws for the time being in force.</p>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><div><p style="font-size:13pt;">Station: ${station}</p><p style="font-size:13pt;">Date: ${formatDateShort(date)}</p></div><div><b style="font-size:13pt;">Signature of the Partners:</b><ul style="list-style:none;margin-top:8pt;">${sigs}</ul></div></div>
<div style="margin-top:20pt;font-size:13pt;">${decls}</div></div></div>`;
    showDoc('Form_No_1_' + firm, html);
  };

  return (
    <div>
      <div className="bg-[#f5e9c8] border border-[#b8860b] rounded-lg px-4 py-3 text-xs text-[#5a4a00] mb-6">
        <b>Form No. 1</b> under The Indian Partnership Act, 1932 (Section 58) — Application for Firm Registration.
      </div>
      <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
        <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">📋 Form No. 1</h2>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Firm Information<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Firm Name" required><input className={inputClass} value={data.firm} onChange={e => u('firm', e.target.value)} /></Field>
          <Field label="Presented By" required><input className={inputClass} value={data.presentedBy} onChange={e => u('presentedBy', e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Principal Place of Business" required><input className={inputClass} value={data.principalPlace} onChange={e => u('principalPlace', e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Other Places of Business"><input className={inputClass} value={data.otherPlaces} onChange={e => u('otherPlaces', e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Nature of Business" required><textarea className={`${inputClass} min-h-[70px]`} value={data.nature} onChange={e => u('nature', e.target.value)} rows={3} /></Field></div>
          <Field label="Duration" required>
            <select className={inputClass} value={data.duration} onChange={e => u('duration', e.target.value)}><option value="At will">At will</option><option value="Fixed term">Fixed term</option></select>
          </Field>
          <Field label="Station" required><input className={inputClass} value={data.station} onChange={e => u('station', e.target.value)} /></Field>
          <Field label="Date" required><input type="date" className={inputClass} value={data.date} onChange={e => u('date', e.target.value)} /></Field>
        </div>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Partners<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setF1Count(Math.max(2, f1Count - 1))} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
          <span className="font-serif text-xl font-semibold text-[#2c4a1e] min-w-[28px] text-center">{f1Count}</span>
          <button onClick={() => setF1Count(f1Count + 1)} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
        </div>
        {Array.from({ length: f1Count }).map((_, i) => (
          <div key={i} className="border border-[#f5e9c8] rounded-lg p-4 mb-3 bg-gradient-to-br from-[#fffef8] to-[#faf7f0]">
            <div className="font-serif font-semibold text-[#2c4a1e] mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#2c4a1e] text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>Partner {i + 1}</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3"><Field label="Full Name" required><input className={inputClass} value={partners[i]?.name || ''} onChange={e => updatePartner(i, 'name', e.target.value)} /></Field></div>
              <Field label="Relationship">
                <select className={inputClass} value={partners[i]?.rel || 'S/o'} onChange={e => updatePartner(i, 'rel', e.target.value)}>
                  <option value="S/o">S/o</option><option value="D/o">D/o</option><option value="W/o">W/o</option>
                </select>
              </Field>
              <Field label="Father / Husband Name" required><input className={inputClass} value={partners[i]?.father || ''} onChange={e => updatePartner(i, 'father', e.target.value)} /></Field>
              <Field label="Age" required><input type="number" className={inputClass} value={partners[i]?.age || ''} onChange={e => updatePartner(i, 'age', e.target.value)} min={18} max={99} /></Field>
              <div className="md:col-span-3"><Field label="Permanent Address" required><textarea className={`${inputClass} min-h-[60px]`} value={partners[i]?.address || ''} onChange={e => updatePartner(i, 'address', e.target.value)} rows={2} /></Field></div>
              <Field label="Date of Joining" required><input type="date" className={inputClass} value={partners[i]?.joining || ''} onChange={e => updatePartner(i, 'joining', e.target.value)} /></Field>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6"><Button variant="gold" onClick={generate}>📋 Generate Form No. 1</Button></div>
    </div>
  );
}

function PhotoFormPanel({ pfPC, setPfPC, pfWC, setPfWC, showDoc }: { pfPC: number; setPfPC: (n: number) => void; pfWC: number; setPfWC: (n: number) => void; showDoc: (t: string, h: string) => void }) {
  const [data, setData] = useState({ firm: '', addr: '' });
  const [partners, setPartners] = useState<PhotoEntry[]>([]);
  const [witnesses, setWitnesses] = useState<PhotoEntry[]>([]);
  const u = (k: string, v: string) => setData(d => ({ ...d, [k]: v }));
  const updatePartner = (i: number, k: string, v: string) => {
    setPartners(p => { const n = [...p]; while (n.length <= i) n.push({ name: '', rel: 'S/o', father: '', address: '' }); n[i] = { ...n[i], [k]: v }; return n; });
  };
  const updateWitness = (i: number, k: string, v: string) => {
    setWitnesses(w => { const n = [...w]; while (n.length <= i) n.push({ name: '', rel: 'W/o', father: '', address: '' }); n[i] = { ...n[i], [k]: v }; return n; });
  };

  const generate = () => {
    if (!data.firm || !data.addr) { alert('Fill Firm Name and Address.'); return; }
    const ps = partners.slice(0, pfPC);
    for (let i = 0; i < ps.length; i++) { if (!ps[i].name || !ps[i].father || !ps[i].address) { alert(`Fill all fields for Partner ${i + 1}.`); return; } }
    const ws = witnesses.slice(0, pfWC);
    for (let i = 0; i < ws.length; i++) { if (!ws[i].name || !ws[i].address) { alert(`Fill all fields for Witness ${i + 1}.`); return; } }
    const pRows = ps.map((p, i) => `<tr><td style="text-align:center;">${i + 1}.</td><td><b>${p.name}, ${p.rel || 'S/o'} ${p.father}</b></td><td>${p.address}</td><td class="photo-cell" style="vertical-align:middle;"><table style="width:105pt;height:135pt;margin:0 auto;border:1pt dashed #bbb;border-collapse:collapse;"><tr><td style="text-align:center;vertical-align:middle;font-size:8pt;color:#bbb;border:none;padding:0;">Photo (Passport)</td></tr></table></td><td class="photo-cell" style="vertical-align:middle;"><table style="width:120pt;height:60pt;margin:0 auto;border:1pt dashed #bbb;border-collapse:collapse;"><tr><td style="text-align:center;vertical-align:middle;font-size:8pt;color:#bbb;border:none;padding:0;">Sign &amp; Thumb</td></tr></table></td></tr>`).join('');
    const wRows = ws.map((w, i) => `<tr><td style="text-align:center;">${i + 1}</td><td><b>${w.name}</b></td><td>${w.address}</td><td class="photo-cell" style="vertical-align:middle;"><table style="width:105pt;height:135pt;margin:0 auto;border:1pt dashed #bbb;border-collapse:collapse;"><tr><td style="text-align:center;vertical-align:middle;font-size:8pt;color:#bbb;border:none;padding:0;">Photo (Passport)</td></tr></table></td><td class="photo-cell" style="vertical-align:middle;"><table style="width:120pt;height:60pt;margin:0 auto;border:1pt dashed #bbb;border-collapse:collapse;"><tr><td style="text-align:center;vertical-align:middle;font-size:8pt;color:#bbb;border:none;padding:0;">Sign &amp; Thumb</td></tr></table></td></tr>`).join('');
    const html = `<div><div style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5pt;margin-bottom:2pt;font-family:'Bookman Old Style',serif;">${data.firm}</div><div style="text-align:center;font-size:15pt;margin-bottom:10pt;font-family:'Bookman Old Style',serif;">${data.addr}</div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 24pt;font-family:'Bookman Old Style',serif;">Partners List with Photo, Signature &amp; Left Thumb Impression</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;width:100%;"><thead><tr><th style="width:28pt;font-size:13pt;">S.No</th><th style="font-size:13pt;">Partners Name &amp; Father Name</th><th style="font-size:13pt;">Address</th><th style="width:120pt;font-size:13pt;">Photo</th><th style="width:130pt;font-size:13pt;">Signature &amp; Thumb</th></tr></thead><tbody>${pRows}</tbody></table>
</div>
<br clear="all" style="page-break-before:always" />
<div><div style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5pt;margin-bottom:2pt;font-family:'Bookman Old Style',serif;">${data.firm}</div><div style="text-align:center;font-size:15pt;margin-bottom:10pt;font-family:'Bookman Old Style',serif;">${data.addr}</div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 24pt;font-family:'Bookman Old Style',serif;">Witness List with Photo, Signature &amp; Left Thumb Impression</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;width:100%;"><thead><tr><th style="width:28pt;font-size:13pt;">S.No</th><th style="font-size:13pt;">Witness Name</th><th style="font-size:13pt;">Address</th><th style="width:120pt;font-size:13pt;">Photo</th><th style="width:130pt;font-size:13pt;">Signature &amp; Thumb</th></tr></thead><tbody>${wRows}</tbody></table></div>`;
    showDoc('Photo_Form_' + data.firm, html);
  };

  return (
    <div>
      <div className="bg-[#f5e9c8] border border-[#b8860b] rounded-lg px-4 py-3 text-xs text-[#5a4a00] mb-6">
        <b>Photo Form</b> — KYC documentation for Registrar of Firms. Print and physically paste photos / affix signatures.
      </div>
      <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
        <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">🪪 Photo Form</h2>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Firm Details<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Firm Name" required><input className={inputClass} value={data.firm} onChange={e => u('firm', e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Firm Address" required><input className={inputClass} value={data.addr} onChange={e => u('addr', e.target.value)} /></Field></div>
        </div>
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Partners<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setPfPC(Math.max(1, pfPC - 1))} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
          <span className="font-serif text-xl font-semibold text-[#2c4a1e] min-w-[28px] text-center">{pfPC}</span>
          <button onClick={() => setPfPC(pfPC + 1)} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
        </div>
        {Array.from({ length: pfPC }).map((_, i) => (
          <div key={`pp-${i}`} className="border border-[#f5e9c8] rounded-lg p-4 mb-3 bg-gradient-to-br from-[#fffef8] to-[#faf7f0]">
            <div className="font-serif font-semibold text-[#2c4a1e] mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#2c4a1e] text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>Partner {i + 1}</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Field label="Full Name" required><input className={inputClass} value={partners[i]?.name || ''} onChange={e => updatePartner(i, 'name', e.target.value)} /></Field></div>
              <Field label="Relationship">
                <select className={inputClass} value={partners[i]?.rel || 'S/o'} onChange={e => updatePartner(i, 'rel', e.target.value)}>
                  <option value="S/o">S/o</option><option value="D/o">D/o</option><option value="W/o">W/o</option>
                </select>
              </Field>
              <Field label="Father / Husband Name" required><input className={inputClass} value={partners[i]?.father || ''} onChange={e => updatePartner(i, 'father', e.target.value)} /></Field>
              <div className="md:col-span-2"><Field label="Address" required><textarea className={`${inputClass} min-h-[60px]`} value={partners[i]?.address || ''} onChange={e => updatePartner(i, 'address', e.target.value)} rows={2} /></Field></div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Witnesses<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setPfWC(Math.max(1, pfWC - 1))} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
          <span className="font-serif text-xl font-semibold text-[#2c4a1e] min-w-[28px] text-center">{pfWC}</span>
          <button onClick={() => setPfWC(pfWC + 1)} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
        </div>
        {Array.from({ length: pfWC }).map((_, i) => (
          <div key={`pw-${i}`} className="border border-[#f5e9c8] rounded-lg p-4 mb-3 bg-gradient-to-br from-[#fffef8] to-[#faf7f0]">
            <div className="font-serif font-semibold text-[#7a6e5a] mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#7a6e5a] text-white flex items-center justify-center text-[10px] font-bold">W{i + 1}</span>Witness {i + 1}</div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" required><input className={inputClass} value={witnesses[i]?.name || ''} onChange={e => updateWitness(i, 'name', e.target.value)} /></Field>
              <Field label="C/o"><input className={inputClass} value={witnesses[i]?.rel || ''} onChange={e => updateWitness(i, 'rel', e.target.value)} /></Field>
              <div className="md:col-span-2"><Field label="Address" required><textarea className={`${inputClass} min-h-[60px]`} value={witnesses[i]?.address || ''} onChange={e => updateWitness(i, 'address', e.target.value)} rows={2} /></Field></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6"><Button variant="gold" onClick={generate}>🪪 Generate Photo Form</Button></div>
    </div>
  );
}

function Button({ variant = 'primary', onClick, children }: { variant?: 'primary' | 'secondary' | 'gold'; onClick: () => void; children: React.ReactNode }) {
  const styles = {
    primary: 'bg-[#2c4a1e] text-white shadow-md hover:bg-[#3d6129]',
    secondary: 'bg-white text-[#7a6e5a] border-2 border-[#d6c9a0] hover:border-[#2c4a1e] hover:text-[#2c4a1e]',
    gold: 'bg-[#b8860b] text-[#1a1209] shadow-md hover:bg-[#d4a017]',
  };
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${styles[variant]}`}>
      {children}
    </button>
  );
}

// ─── SOCIETY REGISTRATION MODULE ────────────────────────────────
function SocietyModule() {
  const [activeDoc, setActiveDoc] = useState('cover');
  const [mcCount, setMcCount] = useState(3);
  const [wcCount, setWcCount] = useState(2);
  const [common, setCommon] = useState({ name: '', addr: '', aims: '', area: '', place: '', date: '', admissionFee: '100', monthlySub: '10' });
  const [owner, setOwner] = useState({ name: '', rel: 'W/o', father: '', age: '', addr: '', relToPres: '' });
  const [members, setMembers] = useState<SocMember[]>([]);
  const [witnesses, setWitnesses] = useState<SocWitness[]>([]);

  const u = (k: string, v: string) => setCommon(d => ({ ...d, [k]: v }));
  const uo = (k: string, v: string) => setOwner(d => ({ ...d, [k]: v }));

  const updateMember = (i: number, k: string, v: string) => {
    setMembers(m => { const n = [...m]; while (n.length <= i) n.push({ name: '', rel: 'S/o', father: '', age: '', addr: '', desig: SOC_DESIGS[i] || 'Member' }); n[i] = { ...n[i], [k]: v }; return n; });
  };
  const updateWitness = (i: number, k: string, v: string) => {
    setWitnesses(w => { const n = [...w]; while (n.length <= i) n.push({ name: '', rel: 'W/o', father: '', addr: '' }); n[i] = { ...n[i], [k]: v }; return n; });
  };

  const validateCommon = (): boolean => {
    for (const k of ['name', 'addr', 'aims', 'area', 'place', 'date'] as const) { if (!common[k]) { alert('Fill all Society common details.'); return false; } }
    const ms = members.slice(0, mcCount);
    for (let i = 0; i < ms.length; i++) { if (!ms[i].name || !ms[i].father || !ms[i].age || !ms[i].addr) { alert(`Fill all fields for Member ${i + 1}.`); return false; } }
    return true;
  };

  const getMembers = () => members.slice(0, mcCount).map((m, i) => ({
    name: m.name, rel: m.rel || 'S/o', father: m.father, age: m.age, addr: m.addr, desig: m.desig || SOC_DESIGS[i] || 'Member'
  }));
  const getWitnesses = () => witnesses.slice(0, wcCount).map(w => ({ name: w.name, rel: w.rel || 'W/o', father: w.father, addr: w.addr }));

  const memberTableRows = (ms: SocMember[]) => ms.map((m, i) =>
    `<tr><td style="text-align:center;">${i + 1}</td><td>${m.name}</td><td>${m.rel} ${m.father}</td><td>${m.addr}</td><td>${m.age} Years</td><td>${m.desig}</td></tr>`
  ).join('');
  const declTableRows = (ms: SocMember[]) => ms.map((m, i) =>
    `<tr><td style="text-align:center;">${i + 1}</td><td>${m.name}</td><td>${m.rel} ${m.father}</td><td>${m.desig}</td><td></td></tr>`
  ).join('');
  const witTableRows = (ws: SocWitness[]) => ws.map((w, i) =>
    `<tr><td style="text-align:center;">${i + 1}</td><td><b>${w.name}</b><br>${w.rel} ${w.father}<br>${w.addr}</td><td></td></tr>`
  ).join('');

  const generateCover = () => {
    if (!validateCommon()) return;
    const ms = getMembers();
    const pres = ms.find(m => m.desig === 'President') || ms[0];
    const html = `<div><div style="text-align:center;font-size:15pt;font-weight:bold;margin-bottom:2pt;font-family:'Bookman Old Style',serif;">${common.name}</div>
<div style="text-align:center;font-size:13pt;margin-bottom:10pt;font-family:'Bookman Old Style',serif;">${common.addr}</div>
<div style="text-align:center;font-size:15pt;font-weight:bold;margin-bottom:10pt;font-family:'Bookman Old Style',serif;">(Registered under Societies Registration Act 35 of 2001)</div>
<div style="margin-top:18pt;font-family:'Bookman Old Style',serif;font-size:13pt;"><b>President</b><br>${pres.name}<br>${pres.rel} ${pres.father},<br>${pres.addr}</div>
<p style="margin-top:18pt;font-family:'Bookman Old Style',serif;font-size:13pt;">To,</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;">The District Registrar of Assurances,<br>The District Registrar Office,<br>${common.place}.</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;">Respected Sir,</p>
<p style="text-indent:36pt;font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;">I am here with enclosing a Memorandum and of the Rules and Regulations of <b>"${common.name}"</b>, Office Address: ${common.addr}, for registration under the Societies Registration Act 35 of 2001. I request that this may kindly be registered under the above said act and issue a necessary certificate of Registration to me. The necessary fee for its registration will be paid in person.</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;">Submitted for necessary action.</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;">Thanking you Sir,</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;">Yours faithfully,</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;"><b>PRESIDENT</b></p>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Enclosures</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;"><li>All members I.D Proofs with photos</li><li>Affidavits – attested by the Notary</li></ul></div>`;
    downloadDoc(html, 'Cover_Letter_' + common.name);
  };

  const generateResolution = () => {
    if (!validateCommon()) return;
    const ms = getMembers();
    const pres = ms.find(m => m.desig === 'President') || ms[0];
    const html = `<div><div style="text-align:center;font-size:15pt;font-weight:bold;text-decoration:underline;margin-bottom:8pt;font-family:'Bookman Old Style',serif;">Copy of Resolution</div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">Resolution to Form and Register the Society</div>
<p style="text-indent:36pt;font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;">We the undersigned resolved to form a Society by name <b>"${common.name}"</b>, Office Address ${common.addr} and get it registered under the Societies Registration Act 35 of 2001 and also resolved to authorize the <b>PRESIDENT — ${pres.name} ${pres.rel} ${pres.father}</b> of the said Association to present the document in the Registrar's Office, ${common.place} and get it registered under the above said Act and receive the necessary certificate.</p>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>
<p style="margin-top:18pt;font-family:'Bookman Old Style',serif;font-size:13pt;"><b>PRESIDENT</b></p>
<div style="margin-top:24pt;">Signature<br><span style="border-bottom:1pt solid #000;display:inline-block;width:160pt;margin-top:8pt;"></span></div>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Annexures</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;"><li>Bye Laws</li><li>ID Proofs</li><li>Affidavit</li></ul></div>`;
    downloadDoc(html, 'Resolution_' + common.name);
  };

  const generateMoA = () => {
    if (!validateCommon()) return;
    const ms = getMembers();
    const ws = getWitnesses();
    const aimsRaw = common.aims;
    const aimItems = aimsRaw.split('\n').filter(a => a.trim()).map(a => `<li>${a.trim()}</li>`).join('');
    const govTableRows = memberTableRows(ms);
    const dRows = declTableRows(ms);
    const wRows = witTableRows(ws);
    const finalSigRows = ms.map((m, i) =>
      `<tr><td style="text-align:center;">${i + 1}</td><td>${m.name}, ${m.rel} ${m.father}</td><td>${m.desig}</td><td></td></tr>`
    ).join('');
    const html = `<div><div style="text-align:center;font-size:13pt;font-weight:bold;font-family:'Bookman Old Style',serif;">MEMORANDUM OF ASSOCIATION OF</div>
<div style="text-align:center;font-size:15pt;font-weight:bold;margin-bottom:2pt;font-family:'Bookman Old Style',serif;">${common.name}</div>
<div style="text-align:center;font-size:13pt;margin-bottom:10pt;font-family:'Bookman Old Style',serif;">${common.addr}</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;margin-bottom:6pt;"><b>Name of the Society:</b> ${common.name}</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;margin-bottom:6pt;"><b>Office Address:</b> ${common.addr}</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Aims And Objectives:</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">${aimItems}</ul>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;"><b>Governing Body:</b> We the following mentioned persons in memorandum of Society have formed into a society and are responsible to run the affairs of the society and are desirous of getting the same registered under, the Societies Registration Act 35 of 2001.</p>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><thead><tr><th style="font-size:13pt;">S.No</th><th style="font-size:13pt;">Name</th><th style="font-size:13pt;">Father / Husband Name</th><th style="font-size:13pt;">Address</th><th style="font-size:13pt;">Age</th><th style="font-size:13pt;">Designation</th></tr></thead><tbody>${govTableRows}</tbody></table>
<div><div style="text-align:center;font-size:15pt;font-weight:bold;text-decoration:underline;margin:16pt 0 8pt;font-family:'Bookman Old Style',serif;">DECLARATION</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><thead><tr><th style="font-size:13pt;">S.No</th><th style="font-size:13pt;">Name</th><th style="font-size:13pt;">Father / Husband Name</th><th style="font-size:13pt;">Designation</th><th style="font-size:13pt;">Signature</th></tr></thead><tbody>${dRows}</tbody></table>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Signatures Of Witnesses and Their Addresses</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><thead><tr><th style="width:46pt;font-size:13pt;">S.No</th><th style="font-size:13pt;">Name, Father/Husband Name &amp; Address</th><th style="font-size:13pt;">Signature</th></tr></thead><tbody>${wRows}</tbody></table>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div></div>

<div><div style="text-align:center;font-size:13pt;font-weight:bold;text-decoration:underline;margin-bottom:8pt;font-family:'Bookman Old Style',serif;">RULES AND REGULATIONS OF THE ASSOCIATION</div>
<div style="text-align:center;font-size:13pt;margin-bottom:10pt;font-family:'Bookman Old Style',serif;">${common.addr}</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;"><b>Name of the Society:</b> ${common.name}</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;"><b>Office Address:</b> ${common.addr}</p>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;"><b>Area of Operation:</b> The area of operation of this ${common.name} shall be ${common.area}.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">4.1. Membership of the Society</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">All the persons who are Indian Nationals and above the Age of 18 Years and are of sound Mind and are eligible to the Members of the Society. Their Membership shall be approved By the Executive Committee on acceptance of Rs.${common.admissionFee}/- as an admission Fee and a Monthly Subscription of Rs.${common.monthlySub}/- each. All subscriptions shall be paid every year i.e., before closing the financial year.</li>
<li style="margin-bottom:4pt;">Every member shall contribute a monthly subscription of Rs.${common.monthlySub}/- if any member fails to pay the subscriptions for 3 continuous months his  name  will be deleted from  the  list  of  members  of  the  society and all members shall be loyal and   faith full to the society.</li>
<li style="margin-bottom:4pt;">The membership of the society shall be opened to all and shall not be restricted to any caste, religion, caste, creed, sex etc.,</li>
<li style="margin-bottom:4pt;">The Society shall maintain an up-to-date Membership register, records and addresses of all the members with the date of admission and date of termination if any.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">4.2. Cessation of Membership</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">Any member shall cease to be a member</li>
<li style="margin-bottom:4pt;">On  the  acceptance  of  his  resignation  approved  by  Governing  body.</li>
<li style="margin-bottom:4pt;">On his/her becoming unsound, mad and suffering from Chronic diseases as per Medical Reports and on his/her death.</li>
<li style="margin-bottom:4pt;">On termination of his/her membership by the Society as provided in the Rules and Regulations or on conviction of  any  Court  of  Law  and  shall  expel  any  member  with  the  approval  of  3/5th of  the  majority  of  the  Executive  Body  on  the  proof   of  the  violation  of  the  Rules  and  Regulations  of  the  Society.</li>
<li style="margin-bottom:4pt;">No person shall be entitled to vote or be counted as a member whose subscription at the relevant time has been in arrears for a period exceeding  three  months. In such cases he or she will automatically cease to be a member and will lose his/her right  to  be  as  a member.</li>
<li style="margin-bottom:4pt;">If  any  member acts  against  the  wishes  of  the  Society  or  fraudulently  indulges  or  violates the aims  and  objects  of  the  Society  his  membership  shall  be  terminated.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">4.3.   Resignation</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Resignation by any  member  shall  be  through  a  notice  served  to  the  President at least one month in advance, the same shall be placed in the next Managing Committee  meeting  and acceptance  of  the  same  shall  be  intimated  within  10 days  of  the  meeting.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">General  Body  and  Function</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The  General  Body  shall  consist  of  the  founders  and  Co-Op.,  members  only. They  must  meet  at  least  once  in  a  year, in  the  month  of  January. A  Quorum  of  the  General  Body  shall  be  3/5th  of  the  membership. The  adjourned  meeting  of  the  General  Body  need  not  have  Quorum. The  annual  general   body  meeting  shall  be  convened  for  the  following  purposes :</p>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">The General Body shall review and approve the annual statement of receipts and expenditure and the audited Balance Sheet of the previous completed year.</li>
<li style="margin-bottom:4pt;">It shall appoint an auditor or auditors for next year to hold office till the conclusion of the next Annual General Body meeting to be fixed by the Board of Trustees from time to time.  The retiring auditor is eligible for re-appointment.</li>
<li style="margin-bottom:4pt;">To set up guidelines for the achievement of the objectives of the Trust.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Managing Committee</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The  complete  Management  and  control  of  the Society shall  rest  on  the Management Committee  of  the  Society. The  Managing  Committee of  the  Society  shall  consist  of  a  President ,a  Secretary , treasurer , and 5 members  total   in  10  members . The  members  of  the  managing  committee  shall be  elected  at  a  General  Body  meeting. The members  of  the  managing  committee shall  hold  the  office  for  a  period  of  5  years  at  a  time  and  that  period  shall  and  always  with  the  conclusion  of  an   Annual  General  Body  Meeting. The  executive committee  shall  be the  authority  for  the  Society  for all  its  functions. The  executive body shall  consist of  not  less than  and  not    more than  9  members. The  managing  committee  shall   meet  at least  4  times  in  a  year  by  a   notice specifying the venue, Agenda, Time  of  meeting, the  notice  shall  be  given  to  all members  at least  10  days in  advance.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Functions of Managing Committee</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">It shall  have  powers  to  employ  persons.</li>
<li style="margin-bottom:4pt;">It  is  responsible  for  the  smooth  running  and  management  of  funds  for advancement  of  the  Society.</li>
<li style="margin-bottom:4pt;">It  shall  receive  Donations either in cash or in kind  ,Grants, Contributions , raise  loans ,etc.</li>
<li style="margin-bottom:4pt;">It  shall  do  such  other  things  as  to  promote  the  cause  of  development  of  people.</li>
<li style="margin-bottom:4pt;">It  shall  make  rules  and  regulations  as  it  thinks  fit  for  the  efficient  management  of  the  affairs  of  the  Society.</li>
<li style="margin-bottom:4pt;">It  shall  give  notice  to  all  General  Body  members  15  days  in  advance  specifying  the  Venue, Agenda, and  time  of  meeting  of  the  General  Body  Meeting .</li>
<li style="margin-bottom:4pt;">It  shall  exercise  direct  control  over  the  following:
<ul style="padding-left:16pt;margin-top:4pt;">
<li style="margin-bottom:4pt;">Personal working in Society administration and discipline.</li>
<li style="margin-bottom:4pt;">Finance, Establishment and Records.</li>
<li style="margin-bottom:4pt;">Transport, Equipment, Machinery and stores.</li>
<li style="margin-bottom:4pt;">Buildings and Contributions.</li>
<li style="margin-bottom:4pt;">All movable and Immovable properties.</li>
</ul>
</li>
<li style="margin-bottom:4pt;">The  Executive  body  may  appoint  from  among  themselves  or from outsiders  other  officers  for  the  efficient  better  management  of  the  organization  and  fix  their  remuneration.</li>
<li style="margin-bottom:4pt;">The  Managing  Committee  can  reserve  for  itself  the   right  to  admit  or   not  to  admit  a  person  who  applies  for  membership.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Meeting of the Executive Committee</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">The  Executive  Committee  shall  meet  ordinarily  once  in  a  year  and  meet  often   for  any  special  purpose  which  may be  fixed,  by  the  Secretary  in consultation  with  the  president  Society.</li>
<li style="margin-bottom:4pt;">The  meeting    shall  be  presided  over  by  the  president  or  in  the  absence  of  the  president,  by  the  Secretary  or  in  the  absence  of  the  President  and  Secretary  by  a  member  elected  from  among  the  member  presents.</li>
<li style="margin-bottom:4pt;">Any  member  of  the  Executive  Committee  who absent  himself  without  Permission  of  the  committee  for  any  three  Executive  meetings   shall  cease  to  be  member  thereof.   But  he  may  for  sufficient  cause,  be  restored  as  a  member  by  the  Executive  Committee.</li>
<li style="margin-bottom:4pt;">Any    vacancy  caused  in  the Executive  Committee  by  the resignation  or  otherwise  shall  be  filled  up  by  co-option  by  the  other members  of  the  Executive  Committee.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Quorum of Executive Committee</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">The  quorum  for  the  meeting  of  the  Executive  Committee shall  by  3/5th  of  the  members.</li>
<li style="margin-bottom:4pt;">All  the  matters and resolutions  of  the  Executive  Committee  shall  be  decided  and  carried  by  a  majority  vote.</li>
<li style="margin-bottom:4pt;">In  case  of  vitas bear  equal  on  both sides, the  president  of  the  meeting shall  exercise  his casting  vote.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Filling The Vacancies</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Vacancies  either  permanent  or  casual  caused in  the Society  can  be  filled  by  the  governing  body  by  Co-option  for  the  unexpired  portion of  the  term  of  the  office.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Budget</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The  managing  committee  shall  present  the  budget  of  Income    and Expenditure  of  the  Society  prepared  by  the  secretary  on  the  aims  and  objects  of  the  Society once  in  a  year  and  get  it  approved  and  adopted.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Functions of the Office Bearers</div>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">President</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The  President  shall  be  the  overall  in charge  of  the  Society  and  shall  preside  overall  meetings  of  the  Society. He  can  also  advice  the  Secretary  to  call  for  emergency  meetings  of  the  managing  committee  at least  by  giving  3  days  prior  notice.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Secretary</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">In  the  absence  of  the  President  or  on  the  authorization  of  President  the  Secretary can  act  as  President.</li>
<li style="margin-bottom:4pt;">The  secretary  can  convene  the  meetings  of  the  executive  committee  as  well  as  meetings  of  general  body</li>
<li style="margin-bottom:4pt;">He or She  shall  maintain  all  the  records  of  the   Society  and   issue  notices  for  all  the  meetings  in  the  end   with consultation of the  President</li>
<li style="margin-bottom:4pt;">The  secretary  shall  also  be  the  member  of  the  governing  body  of the Society. He  shall  present  the  accounts  and  reports  to  the  executive  body  periodically  and  shall  cause  maintenance  of  accounts  and  records  in  close  association  with  the  treasurer. He  shall  be  responsible  for  the  selection  of  staff  of  the  Society  and  shall be  responsible  for  any  disciplinary  action  if  necessary.</li>
<li style="margin-bottom:4pt;">He or she  shall  prepare  the  plans  and  programs  basing  on  the  objectives  of  Society</li>
<li style="margin-bottom:4pt;">He or she shall  be  responsible  for  overall  day  to  day  administration  for  the  smooth  running  of  the  Society</li>
<li style="margin-bottom:4pt;">He or she shall  function  as  the  main  executive  of  the  Society</li>
<li style="margin-bottom:4pt;">The  Secretary   shall  be  entitled  to  borrow  loans  or  take  advances  or  accept either  in  kind  or  cash  on  behalf  of  the  Society for  the  purpose  of  aims  and objects  of  the  Society</li>
<li style="margin-bottom:4pt;">The  Secretary   of  the  Society  shall  be  entitled  to  raise  loans  and  advances from  any  commercial  banks  or  financial  institutions  on  behalf  of  the  Society and  such  funds  should  be  exclusively  used  for  the  purpose  of  achieving  the  main  objects  and  aims  of  the  Society.  He or she  shall  present  the  annual  report  of  the  Society to  general  body .He or she  shall  be  responsible  for  all  kinds  of  activities  that  are  sponsored  by  the  Society.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Treasurer</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">The  treasurer  shall  be  responsible  for  the  maintaining  all  the  accounts  for  the  finances  received  from  the  governing  body</li>
<li style="margin-bottom:4pt;">He or She  shall  attend  to  the  Annual  Audit  and  preparation  of  financial  reports  in  close  association  with  the  secretary</li>
<li style="margin-bottom:4pt;">He or She shall  be  responsible  for  maintenance  of  all  accounts  books  and  shall  represent  the  same  to  all  proper  authorities.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Funds</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Funds  for  the  execution  of  aims  and  objects  of  Society shall  be collected  by  way  of:</p>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">Donations either in cash or in kind</li>
<li style="margin-bottom:4pt;">Contributions</li>
<li style="margin-bottom:4pt;">Gifts  either  in  cash  or  in  kind</li>
<li style="margin-bottom:4pt;">Any  other  funds  raised  or  received  from  the  well-wishers  and such other institutions registered under sec 12 AA of the Income tax Act.</li>
<li style="margin-bottom:4pt;">Any amounts in the form loans and advances from the financial institutions, Nationalized  Banks or such other institutions or from the individuals or concerns.</li>
<li style="margin-bottom:4pt;">The  funds  of  the  Society  so  collected or raised  shall  be  spent  only  for  the  purpose  of  attaining  the  main  objects  and  aims  of the  Society  and  no  portion  thereof  shall  be  paid  or  transferred   either  directly  or  indirectly  to  any  of  its  members  by  any  means.</li>
<li style="margin-bottom:4pt;">The  Society  will  endeavor  to  raise  more  funds  needed  for  the  attainment   of  main  objects  by  other  enterprises  which  may  generate  more  resources to  the  Society, which  can  yield  a  surplus  income  to  be  used  for  the public charitable  purposes  of  the  Society.</li>
<li style="margin-bottom:4pt;">All  the  funds  negotiable  instruments, bank  accounts  and  operations  shall  be  jointly  by  the  President  and  treasurer.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Voting</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Each   member  shall  have  one  vote,  and  the  co-opted  members  do  not have  any  voting  power. However,  they  can  participate  in discussions on invitation.  In  case  of  a  tie, the  President  shall  have  a  casting  vote.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Amendments</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">No  amendments  or  alterations  shall  be  made  for  the purpose  as  mentioned  in  the   Memorandum  of  Association  unless  it  is  voted  by  3/5th  of   the  members  present  at  a  meeting  of  the  general  body  convened   for  the  purpose  and  confirmed  by  3/5th  of  the  members  present  at  a  second  special   meeting  after  an  interval   of  one  month. Any  amendments  to  the  Byelaws  of  the  Society  will  be  carried  out  only  with the prior  approval  of  the  Commissioner/ Director    of  Income  Tax [ Exemptions ] , Hyderabad.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Winding Up</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">In  the  event  of  dissolution  of  the  Society all  the  remaining  funds and  assets  after  the  full  satisfaction  of  the  liabilities  of  the  Society  shall be given to the Society having  similar aims  and  objects and having  Registration  under  Sec 12 AA  of  the  Income  Tax  Act  1961.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Investments</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The  surplus  money  of  Society  shall  be  invested  only  in  securities  referred  to  in  Sec  11 ( 5 ) of  Income  Tax   Act  1961.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Property How Deal With</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">All documents relating to the immovable properties that may be endowed to the society through purchase, gift or lease shall be executed in favour of the society represented by its president for the time being.</li>
<li style="margin-bottom:4pt;">All the society properties are vested in the name of the society who shall hold the same for the use and benefit of the Society.</li>
<li style="margin-bottom:4pt;">The Governing Body does not have any power to alienate or to transfer or to mortgage or to pledge any of the properties standing in the name of the Society that are acquired and in peaceful possession of the Society as held today. The properties that are conveyed in the name of the Society either by way of acquisition or by gift or in kind or in any other mode shall not be transferred during the tenure of the Society either by the Governing Body or their members or by the Board of Members or by any others who hold interest in the Society.</li>
<li style="margin-bottom:4pt;">Further the General Body may accept any immovable / movable properties by way of Gift or in Kind and if such properties are located and if in the opinion of the Board such properties are not manageable because of their location, may and if deem such of those properties may be disposed of by obtaining the approval of majority of the trustees on the board and also duly notifying the Act of Sale in local vernacular language or in a daily English newspaper.</li>
<li style="margin-bottom:4pt;">The conveyance deed or deeds relating to alienation of disposal of the Society property shall be executed by the President of the Society for the time being for and on behalf of the Society.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Disqualifications</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Any member who has been appointed to the General Body shall cease his membership by any of the reasons stated below or any eventual situations that makes him incapable to continue as the Board member or to act as the Council.</p>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">If he or she dies.</li>
<li style="margin-bottom:4pt;">If he or she becomes bankrupt.</li>
<li style="margin-bottom:4pt;">If he or she is found to be lunatic or of an unsound mind.</li>
<li style="margin-bottom:4pt;">If he  or she resign his office.</li>
<li style="margin-bottom:4pt;">If he acts in contravention of the objects of the Society or in a manner determined to the interest of the Society or guilty of misconduct in the opinion of the Society called for the purpose by the three-fourth of the members present.</li>
<li style="margin-bottom:4pt;">If any member in the board of the society fails to attend 3 consecutive meetings irrespective of any factual circumstances, he shall be disqualified to continue or to act as the member of the General Body.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Financial Year</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The society shall follow financial year for preparation of annual accounts (i.e 1st April to 31st March).  The trust shall prepare receipts and payments, Income-Expenditure and Balance Sheet on the financial year ending on 31st March every year.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Audit & Accounts</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">The Society shall follow financial year for the preparation of financial statements.</li>
<li style="margin-bottom:4pt;">The Society shall prepare Receipts and Payments, Income & Expenditure account, Balance Sheet every year.</li>
<li style="margin-bottom:4pt;">The accounts  of the society shall be   audited by a Qualified  Auditor/Chartered Accountant every  year  to  be appointed  by the  Society at  every  annual  general  meeting.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Proxy</div>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">There shall be no voting by proxy.</li>
<li style="margin-bottom:4pt;">The Society   shall not undertake any activity outside India.</li>
<li style="margin-bottom:4pt;">The  Society  formed  by  us  is  a public charitable  one  and  it is  an irrevocable society.</li>
</ul>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Suit</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">The society shall sue or be sued in the name of the president.</p>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 6pt;font-family:'Bookman Old Style',serif;">Property</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;margin-bottom:6pt;">Any  Judgment  for  the  recovery of  the property  shall  be  enforced against  the   property of the society only.</p>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;padding-left:24pt;text-align:justify;">
<li style="margin-bottom:4pt;">All other provisions  of  the ap society  registration  act 35 of 2001 not  specially   mentioned  therein  shall  apply  to this  society.</li>
</ul></div>
<div><div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">Registration Undertaking</div>
<p style="margin-top:14pt;font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;">We, the several members whose signatures are subscribed below desire to bring the above-named society into being within the meaning of Section 35 of 2001 of Societies Registration and we are desirous of getting the above society registered.</p>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><thead><tr><th style="font-size:13pt;">S.No</th><th style="font-size:13pt;">Name &amp; Father / Husband Name</th><th style="font-size:13pt;">Designation</th><th style="font-size:13pt;">Signature &amp; Photo</th></tr></thead><tbody>${finalSigRows}</tbody></table>
<div style="font-weight:bold;font-size:14pt;margin:14pt 0 8pt;font-family:'Bookman Old Style',serif;">Witnesses with their Address &amp; Signatures</div>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><thead><tr><th style="font-size:13pt;">S.No</th><th style="font-size:13pt;">Name &amp; Address</th><th style="font-size:13pt;">Witness Signature</th><th style="font-size:13pt;">Witness Photo</th></tr></thead>
<tbody>${ws.map((w, i) => `<tr><td style="text-align:center;">${i + 1}</td><td><b>${w.name}</b> ${w.rel} ${w.father}<br>${w.addr}</td><td></td><td></td></tr>`).join('')}</tbody></table>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div></div></div></div>`;
    downloadDoc(html, 'Memorandum_of_Association_' + common.name);
  };

  const generateAffidavits = () => {
    if (!validateCommon()) return;
    const ms = getMembers();
    const pres = ms.find(m => m.desig === 'President') || ms[0];
    if (!owner.name || !owner.addr) { alert('Please fill in Premises Owner details.'); return; }
    const memberTableRows2 = ms.map((m, i) =>
      `<tr><td style="text-align:center;">${i + 1}</td><td>${m.name}</td><td>${m.rel} ${m.father}</td><td>${m.addr}</td><td>${m.age} Years</td><td>${m.desig}</td><td></td></tr>`
    ).join('');
    const html = `<div><div class="affidavit-title">AFFIDAVIT — 1</div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">President's Affidavit</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;">I, ${pres.name}, ${pres.rel} ${pres.father}, aged about ${pres.age} years, ${pres.addr}, solemnly affirm and sincerely state as follows:</p>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">
  <li>I am the President of <b>${common.name}</b>, and I know the facts and swear this affidavit on behalf of me and on behalf of other executive members.</li>
  <li>The below persons are the members of the society and formed as a society namely <b>${common.name}</b>, ${common.addr}.</li>
</ul>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;"><b>List of Executive Members along with their Address:</b></p>
<table style="font-size:13pt;font-family:'Bookman Old Style',serif;"><thead><tr><th style="font-size:13pt;">S.No</th><th style="font-size:13pt;">Name</th><th style="font-size:13pt;">Father / Husband Name</th><th style="font-size:13pt;">Address</th><th style="font-size:13pt;">Age</th><th style="font-size:13pt;">Designation</th><th style="font-size:13pt;">Signature</th></tr></thead><tbody>${memberTableRows2}</tbody></table>
<div style="margin-top:24pt;text-align:right;"><b>DEPONENT</b><br><div style="border-bottom:1pt solid #000;display:inline-block;width:160pt;margin-top:8pt;"></div><br><br><b>President</b><br>${pres.name}</div>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div></div>

<div><div style="text-align:center;font-size:15pt;font-weight:bold;text-decoration:underline;margin-bottom:8pt;font-family:'Bookman Old Style',serif;">AFFIDAVIT — 2</div>
<div style="text-align:center;font-weight:bold;font-size:15pt;text-transform:uppercase;margin:18pt 0 10pt;font-family:'Bookman Old Style',serif;">Premises No Objection Certificate (NOC)</div>
<p style="font-family:'Bookman Old Style',serif;font-size:13pt;text-align:justify;">I, ${owner.name}, ${owner.rel} ${owner.father}${owner.age ? ', aged about ' + owner.age + ' years' : ''},${owner.addr ? ` residing at ${owner.addr},` : ''} do hereby state as follows:</p>
<ul style="font-family:'Bookman Old Style',serif;font-size:13pt;">
  <li>I am the owner of the premises situated at ${owner.addr || common.addr}.</li>
  <li>I have no objection to ${pres.name} establishing and operating a society under the name and style of <b>"${common.name}"</b> at the above said premises.</li>
  ${owner.relToPres ? `<li>I further state that ${pres.name}, who is my ${owner.relToPres}, is the President of the said society, and in view of our relationship, I have permitted the society to use my premises free of cost for its office purposes. No rent or any other consideration has been collected or will be collected for the same.</li>` : '<li>I have permitted the society to use the said premises free of cost for its office purposes.</li>'}
  <li>This No Objection Letter is issued willingly for official and registration purposes.</li>
</ul>
<div style="margin-top:24pt;text-align:right;"><b>DEPONENT</b><br>${owner.name}<br><div style="border-bottom:1pt solid #000;display:inline-block;width:160pt;margin-top:8pt;"></div></div>
<div style="display:flex;justify-content:space-between;margin-top:10pt;font-size:13pt;"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>
<div style="margin-top:16pt;text-align:right;font-family:'Bookman Old Style',serif;font-size:13pt;"><b>President</b><br>${pres.name}</div></div>`;
    downloadDoc(html, 'Affidavits_' + common.name);
  };

  return (
    <div>
      <div className="text-sm text-[#7a6e5a] mb-6">Generate all documents required for registration under Societies Registration Act 35 of 2001.</div>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { key: 'cover', icon: '✉️', label: 'Cover Letter', desc: 'To District Registrar', badge: 'Step 1' },
          { key: 'resolution', icon: '📃', label: 'Resolution', desc: 'Copy of Resolution', badge: 'Step 2' },
          { key: 'moa', icon: '📖', label: 'MoA', desc: 'Memorandum of Association', badge: 'Step 3' },
          { key: 'affidavit', icon: '📜', label: 'Affidavits', desc: 'President + NOC', badge: 'Step 4' },
        ].map(d => (
          <button key={d.key} onClick={() => setActiveDoc(d.key)}
            className={`relative border-2 rounded-xl p-3 cursor-pointer text-center transition-all ${activeDoc === d.key ? 'border-[#1e3a5a] bg-[#1e3a5a] text-white' : 'border-[#d6c9a0] bg-white hover:border-[#1e3a5a] hover:bg-[#e8f0fa]'}`}>
            <span className="absolute -top-2.5 right-2 bg-[#b8860b] text-[#1a1209] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{d.badge}</span>
            <div className="text-2xl mb-1">{d.icon}</div>
            <div className="font-serif font-semibold text-sm">{d.label}</div>
            <div className="text-[10px] mt-1 opacity-65">{d.desc}</div>
          </button>
        ))}
      </div>

      {/* Common Data Card */}
      <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8 mb-8">
        <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#e8f0fa] mb-6">Society &amp; Common Details <span className="text-xs font-normal text-[#7a6e5a]">— fill once, used across all documents</span></h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><Field label="Society Name" required><input className={inputClass} value={common.name} onChange={e => u('name', e.target.value)} placeholder="e.g. LAKSHMI NARASIMHA SOCIAL SERVICE SOCIETY" /></Field></div>
          <div className="md:col-span-3"><Field label="Society Office Address" required><input className={inputClass} value={common.addr} onChange={e => u('addr', e.target.value)} /></Field></div>
          <div className="md:col-span-3"><Field label="Aims &amp; Objectives" required><textarea className={`${inputClass} min-h-[100px]`} value={common.aims} onChange={e => u('aims', e.target.value)} rows={5} /></Field></div>
          <Field label="Area of Operation" required><input className={inputClass} value={common.area} onChange={e => u('area', e.target.value)} /></Field>
          <Field label="Place / Station" required><input className={inputClass} value={common.place} onChange={e => u('place', e.target.value)} /></Field>
          <Field label="Date" required><input type="date" className={inputClass} value={common.date} onChange={e => u('date', e.target.value)} /></Field>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8 mb-8">
        <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#e8f0fa] mb-6">Governing Body Members</h2>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setMcCount(Math.max(3, mcCount - 1))} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
          <span className="font-serif text-xl font-semibold text-[#2c4a1e] min-w-[28px] text-center">{mcCount}</span>
          <button onClick={() => setMcCount(mcCount + 1)} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
        </div>
        {Array.from({ length: mcCount }).map((_, i) => (
          <div key={i} className="border border-[#e8f0fa] rounded-lg p-4 mb-3 bg-gradient-to-br from-[#f8fbff] to-[#eef4fa]">
            <div className="font-serif font-semibold text-[#1e3a5a] mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#1e3a5a] text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>Member {i + 1}</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3"><Field label="Full Name" required><input className={inputClass} value={members[i]?.name || ''} onChange={e => updateMember(i, 'name', e.target.value)} /></Field></div>
              <Field label="Relationship">
                <select className={inputClass} value={members[i]?.rel || 'S/o'} onChange={e => updateMember(i, 'rel', e.target.value)}>
                  <option value="S/o">S/o</option><option value="D/o">D/o</option><option value="W/o">W/o</option>
                </select>
              </Field>
              <Field label="Father / Husband / Guardian" required><input className={inputClass} value={members[i]?.father || ''} onChange={e => updateMember(i, 'father', e.target.value)} /></Field>
              <Field label="Age" required><input type="number" className={inputClass} value={members[i]?.age || ''} onChange={e => updateMember(i, 'age', e.target.value)} min={18} max={100} /></Field>
              <Field label="Designation" required>
                <select className={inputClass} value={members[i]?.desig || SOC_DESIGS[i] || 'Member'} onChange={e => updateMember(i, 'desig', e.target.value)}>
                  {SOC_DESIGS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <div className="md:col-span-3"><Field label="Address" required><textarea className={`${inputClass} min-h-[60px]`} value={members[i]?.addr || ''} onChange={e => updateMember(i, 'addr', e.target.value)} rows={2} /></Field></div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic panels */}
      {activeDoc === 'cover' && (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#e8f0fa] mb-6">✉️ Cover Letter to District Registrar</h2>
          <p className="text-xs text-[#7a6e5a] mb-6">A formal letter addressed to the District Registrar requesting registration of the society.</p>
          <div className="flex justify-end"><button onClick={generateCover} className="px-6 py-2.5 rounded-lg bg-[#1e3a5a] text-white text-sm font-semibold shadow-md hover:bg-[#274d78] transition cursor-pointer">✉️ Generate Cover Letter</button></div>
        </div>
      )}

      {activeDoc === 'resolution' && (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#e8f0fa] mb-6">📃 Copy of Resolution</h2>
          <p className="text-xs text-[#7a6e5a] mb-6">Resolution authorising the President to present the document for registration.</p>
          <div className="flex justify-end"><button onClick={generateResolution} className="px-6 py-2.5 rounded-lg bg-[#1e3a5a] text-white text-sm font-semibold shadow-md hover:bg-[#274d78] transition cursor-pointer">📃 Generate Resolution</button></div>
        </div>
      )}

      {activeDoc === 'moa' && (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#e8f0fa] mb-6">📖 Memorandum of Association</h2>
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs text-[#7a6e5a]">Complete MoA with Rules &amp; Regulations, Declaration, and Witness statements.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setWcCount(Math.max(2, wcCount - 1))} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
              <span className="text-xs"><b>{wcCount}</b> Witnesses</span>
              <button onClick={() => setWcCount(wcCount + 1)} className="w-7 h-7 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-base text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
            </div>
          </div>
          {Array.from({ length: wcCount }).map((_, i) => (
            <div key={i} className="border border-[#e8f0fa] rounded-lg p-4 mb-3 bg-gradient-to-br from-[#f8fbff] to-[#eef4fa]">
              <div className="font-serif font-semibold text-[#7a6e5a] mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#7a6e5a] text-white flex items-center justify-center text-[10px] font-bold">W{i + 1}</span>Witness {i + 1}</div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full Name" required><input className={inputClass} value={witnesses[i]?.name || ''} onChange={e => updateWitness(i, 'name', e.target.value)} /></Field>
                <Field label="Relationship">
                  <select className={inputClass} value={witnesses[i]?.rel || 'W/o'} onChange={e => updateWitness(i, 'rel', e.target.value)}>
                    <option value="W/o">W/o</option><option value="S/o">S/o</option><option value="D/o">D/o</option>
                  </select>
                </Field>
                <Field label="Father / Husband Name" required><input className={inputClass} value={witnesses[i]?.father || ''} onChange={e => updateWitness(i, 'father', e.target.value)} /></Field>
                <div className="md:col-span-2"><Field label="Address" required><textarea className={`${inputClass} min-h-[60px]`} value={witnesses[i]?.addr || ''} onChange={e => updateWitness(i, 'addr', e.target.value)} rows={2} /></Field></div>
              </div>
            </div>
          ))}
          <div className="flex justify-end"><button onClick={generateMoA} className="px-6 py-2.5 rounded-lg bg-[#1e3a5a] text-white text-sm font-semibold shadow-md hover:bg-[#274d78] transition cursor-pointer">📖 Generate MoA</button></div>
        </div>
      )}

      {activeDoc === 'affidavit' && (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#e8f0fa] mb-6">📜 Affidavits (President + Premises NOC)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Owner Full Name"><input className={inputClass} value={owner.name} onChange={e => uo('name', e.target.value)} /></Field>
            <Field label="Relationship">
              <select className={inputClass} value={owner.rel} onChange={e => uo('rel', e.target.value)}><option value="W/o">W/o</option><option value="S/o">S/o</option><option value="D/o">D/o</option></select>
            </Field>
            <Field label="Father / Husband Name"><input className={inputClass} value={owner.father} onChange={e => uo('father', e.target.value)} /></Field>
            <Field label="Age"><input type="number" className={inputClass} value={owner.age} onChange={e => uo('age', e.target.value)} min={18} max={100} /></Field>
            <div className="md:col-span-2"><Field label="Owner Address"><input className={inputClass} value={owner.addr} onChange={e => uo('addr', e.target.value)} /></Field></div>
            <div className="md:col-span-3"><Field label="Relationship of Owner to President"><input className={inputClass} value={owner.relToPres} onChange={e => uo('relToPres', e.target.value)} placeholder="e.g. Daughter, Wife, Friend" /></Field></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Field label="Admission Fee (Rs.)"><input type="number" className={inputClass} value={common.admissionFee} onChange={e => u('admissionFee', e.target.value)} /></Field>
            <Field label="Monthly Subscription (Rs.)"><input type="number" className={inputClass} value={common.monthlySub} onChange={e => u('monthlySub', e.target.value)} /></Field>
          </div>
          <div className="flex justify-end mt-6"><button onClick={generateAffidavits} className="px-6 py-2.5 rounded-lg bg-[#1e3a5a] text-white text-sm font-semibold shadow-md hover:bg-[#274d78] transition cursor-pointer">📜 Generate Affidavits</button></div>
        </div>
      )}
    </div>
  );
}
