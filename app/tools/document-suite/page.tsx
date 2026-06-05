'use client';
import { useState } from 'react';
import { formatDateShort } from '@/lib/utils';
import { downloadDoc } from '@/lib/doc-generator';
import { SOC_DESIGS } from '@/lib/constants';

interface SocMember { name: string; rel: string; father: string; age: string; addr: string; desig: string; }
interface SocWitness { name: string; rel: string; father: string; addr: string; }

export default function SocietyRegistrationPage() {
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
    const html = `<div class="firm-hdr">${common.name}</div>
<div class="firm-addr">${common.addr}</div>
<div class="firm-addr">(Registered under Societies Registration Act 35 of 2001)</div>
<div style="margin-top:18px;"><b>President</b><br>${pres.name}<br>${pres.rel} ${pres.father},<br>${pres.addr}</div>
<p style="margin-top:18px;">To</p>
<p>The District Registrar of Assurances,<br>The District Registrar Office,<br>${common.place}.</p>
<p>Respected Sir,</p>
<p style="text-indent:36px;">I am here with enclosing a Memorandum and of the Rules and Regulations of <b>"${common.name}"</b>, Office Address: ${common.addr}, for registration under the Societies Registration Act 35 of 2001. I request that this may kindly be registered under the above said act and issue a necessary certificate of Registration to me. The necessary fee for its registration will be paid in person.</p>
<p>Submitted for necessary action</p>
<p>Thanking you Sir,</p>
<p>Yours faithfully,</p>
<p><b>PRESIDENT</b></p>
<div class="station-row"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>
<p style="margin-top:10px;">Enclosed: All members I.D Proofs with photos<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Affidavits – attested by the Notary.</p>`;
    downloadDoc(html, 'Cover_Letter_' + common.name);
  };

  const generateResolution = () => {
    if (!validateCommon()) return;
    const ms = getMembers();
    const pres = ms.find(m => m.desig === 'President') || ms[0];
    const html = `<h1>COPY OF RESOLUTION</h1>
<p style="text-indent:36px;">We the undersigned resolved to form a Society by name <b>"${common.name}"</b>, Office Address ${common.addr} and get it registered under the Societies Registration Act 35 of 2001 and also resolved to authorize the <b>PRESIDENT — ${pres.name} ${pres.rel} ${pres.father}</b> of the said Association to present the document in the Registrar's Office, ${common.place} and get it registered under the above said Act and receive the necessary certificate.</p>
<div class="station-row"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>
<p style="margin-top:18px;"><b>PRESIDENT</b></p>
<ul style="list-style:none;margin-top:8px;">
  <li>Bye laws</li><li>ID Proofs</li><li>Affidavit</li>
</ul>`;
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
    const html = `<div style="text-align:center;margin-bottom:6px;">MEMORANDUM OF ASSOCIATION OF</div>
<div class="firm-hdr">${common.name}</div>
<div class="firm-addr">${common.addr}</div>
<ul style="list-style:none;margin:14px 0 18px;">
  <li><b>Name of the Society:</b> ${common.name}</li>
  <li style="margin-top:6px;"><b>Office Address:</b> ${common.addr}</li>
  <li style="margin-top:10px;"><b>Aims and Objectives:</b><ul style="margin-top:6px;">${aimItems}</ul></li>
  <li style="margin-top:10px;"><b>Governing Body:</b> We the following mentioned persons have formed into a society and are responsible to run the affairs of the society and are desirous of getting the same registered under the Societies Registration Act 35 of 2001.</li>
</ul>
<table><thead><tr><th>S.no</th><th>Name</th><th>Father / Husband Name</th><th>Address</th><th>Age</th><th>Designation</th></tr></thead><tbody>${govTableRows}</tbody></table>
<p style="margin-top:14px;font-weight:bold;">DECLARATION</p>
<p>We the undersigned desirous to form a committee and get it registered under the society's registration act 35 of 2001.</p>
<table><thead><tr><th>S.no</th><th>Name</th><th>Father / Husband Name</th><th>Designation</th><th>Signature</th></tr></thead><tbody>${dRows}</tbody></table>
<p style="margin-top:14px;font-weight:bold;">Signatures Of Witnesses and Their Addresses</p>
<table><thead><tr><th style="width:46px;">S.no</th><th>Name, Father/Husband Name &amp; Address</th><th>Signature</th></tr></thead><tbody>${wRows}</tbody></table>
<div class="station-row"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>

<div style="margin-top:36px;text-align:center;font-weight:bold;font-size:13pt;text-decoration:underline;">RULES AND REGULATIONS OF THE ASSOCIATION</div>
<div class="firm-hdr" style="margin-top:10px;">${common.name}</div>
<div class="firm-addr">${common.addr}</div>
<div class="rules-section">
<h3>1. Name of the Society</h3><p>${common.name}</p>
<h3>2. Office Address</h3><p>${common.addr}</p>
<h3>3. Area of Operation</h3><p>The area of operation of this ${common.name} shall be ${common.area}.</p>
<h3>4. Membership</h3>
<ul>
  <li>All persons who are Indian Nationals and above the Age of 18 Years and of sound mind are eligible to be Members. Their Membership shall be approved by the Executive Committee on acceptance of Rs.${common.admissionFee}/- as admission fee and a Monthly Subscription of Rs.${common.monthlySub}/- each.</li>
  <li>Every member shall contribute a monthly subscription of Rs.${common.monthlySub}/-. If any member fails to pay for 3 continuous months, their name will be deleted from the list of members.</li>
  <li>The membership shall be open to all and shall not be restricted to any caste, religion, creed, sex etc.</li>
  <li>The Society shall maintain an up-to-date Membership register with addresses and dates of admission and termination.</li>
</ul>
<h3>5. Cessation of Membership</h3>
<ul><li>On acceptance of resignation approved by the Governing Body.</li><li>On becoming unsound, suffering from chronic diseases, or on death.</li><li>On termination by the Society with approval of 3/5th of the Executive Body majority on proof of violation of Rules and Regulations.</li></ul>
<h3>6. Managing Committee</h3>
<p>The Managing Committee shall consist of a President, Secretary, Treasurer and members. Members shall be elected at a General Body meeting and shall hold office for 5 years. The Committee shall meet at least 4 times a year with 10 days' notice specifying venue, agenda and time.</p>
<h3>7. Financial Year</h3>
<p>The Society shall follow the financial year (1st April to 31st March) for preparation of annual accounts, receipts &amp; payments, Income-Expenditure and Balance Sheet.</p>
<h3>8. Audit &amp; Accounts</h3>
<p>The accounts shall be audited by a Qualified Auditor / Chartered Accountant every year, appointed at the Annual General Meeting.</p>
<h3>9. Amendments</h3>
<p>No amendments shall be made unless voted by 3/5th of the members present at a General Body meeting and confirmed by 3/5th at a second special meeting after one month. Amendments to Byelaws require prior approval of the Commissioner/Director of Income Tax (Exemptions), Hyderabad.</p>
<h3>10. Winding Up</h3>
<p>In the event of dissolution, all remaining funds and assets after satisfying liabilities shall be given to a Society having similar aims and objects registered under Sec 12AA of the Income Tax Act 1961.</p>
</div>
<p style="margin-top:16px;">We, the several members whose signatures are subscribed below desire to bring the above-named society into being within the meaning of Section 35 of 2001 of Societies Registration and we are desirous of getting the above society registered.</p>
<table><thead><tr><th>S.no</th><th>Name &amp; Father / Husband Name</th><th>Designation</th><th>Signature &amp; Photo</th></tr></thead><tbody>${finalSigRows}</tbody></table>
<p style="margin-top:14px;font-weight:bold;">Witnesses with their address &amp; signatures:</p>
<table><thead><tr><th>S.no</th><th>Name &amp; Address</th><th>Witness Signature</th><th>Witness Photo</th></tr></thead>
<tbody>${ws.map((w, i) => `<tr><td style="text-align:center;">${i + 1}</td><td><b>${w.name}</b> ${w.rel} ${w.father}<br>${w.addr}</td><td></td><td></td></tr>`).join('')}</tbody></table>
<div class="station-row"><span>Place: ${common.place}</span><span>Date: ${formatDateShort(common.date)}</span></div>`;
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
    const html = `<h1>AFFIDAVIT — 1</h1>
<p>I, ${pres.name}, ${pres.rel} ${pres.father}, aged about ${pres.age} years, ${pres.addr}, solemnly affirm and sincerely state as follows:</p>
<ul>
  <li>I am the President of <b>${common.name}</b>, and I know the facts and swear this affidavit on behalf of me and on behalf of other executive members.</li>
  <li>The below persons are the members of the society and formed as a society namely <b>${common.name}</b>, ${common.addr}.</li>
</ul>
<p><b>List of Executive Members along with their Address:</b></p>
<table><thead><tr><th>S.no</th><th>Name</th><th>Father / Husband Name</th><th>Address</th><th>Age</th><th>Designation</th><th>Signature</th></tr></thead><tbody>${memberTableRows2}</tbody></table>
<div style="margin-top:18px;text-align:right;"><span class="sign-line"></span><br><b>DEPONENT</b><br><br><b>President</b><br>${pres.name}</div>

<div style="margin-top:48px;border-top:2px solid #ccc;padding-top:24px;"></div>
<h1>AFFIDAVIT — 2 (Premises NOC)</h1>
<p>I, ${owner.name}, ${owner.rel} ${owner.father}${owner.age ? ', aged about ' + owner.age + ' years' : ''},${owner.addr ? ` residing at ${owner.addr},` : ''} do hereby state as follows:</p>
<ul>
  <li>I am the owner of the premises situated at ${owner.addr || common.addr}.</li>
  <li>I have no objection to ${pres.name} establishing and operating a society under the name and style of <b>"${common.name}"</b> at the above said premises.</li>
  ${owner.relToPres ? `<li>I further state that ${pres.name}, who is my ${owner.relToPres}, is the President of the said society, and in view of our relationship, I have permitted the society to use my premises free of cost for its office purposes. No rent or any other consideration has been collected or will be collected for the same.</li>` : '<li>I have permitted the society to use the said premises free of cost for its office purposes.</li>'}
  <li>This No Objection Letter is issued willingly for official and registration purposes.</li>
</ul>
<div style="margin-top:28px;"><p>Place: ${common.place}</p><p>Date: ${formatDateShort(common.date)}</p></div>
<div style="margin-top:20px;text-align:right;"><span class="sign-line"></span><br><b>DEPONENT</b><br>${owner.name}</div>
<div style="margin-top:24px;text-align:right;"><b>President</b><br>${pres.name}</div>`;
    downloadDoc(html, 'Affidavits_' + common.name);
  };

  const inputClass = "w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-[#1a1209]">Society Registration</h1>
        <p className="text-sm text-[#7a6e5a] mt-1">Generate all documents required for registration under Societies Registration Act 35 of 2001.</p>
      </div>

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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#7a6e5a] uppercase tracking-wider">{label}{required && <span className="text-[#8b2020] ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
