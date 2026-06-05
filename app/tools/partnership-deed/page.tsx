'use client';
import { useState, useCallback } from 'react';
import { ordinal, numWords, formatDateLong, formatDateShort, cls } from '@/lib/utils';
import { downloadDoc } from '@/lib/doc-generator';

interface Partner { name: string; rel: string; father: string; age: string; address: string; aadhar: string; profit: number; }
interface Witness { name: string; co: string; address: string; aadhar: string; }

export default function PartnershipDeedPage() {
  const [step, setStep] = useState(1);
  const [numPartners, setNumPartners] = useState(2);
  const [numWitnesses, setNumWitnesses] = useState('');
  const [firm, setFirm] = useState({ firmName:'', bizType:'', bizNature:'', placeOfBiz:'', dateCommencement:'', placeExecution:'', capitalRate:'12' });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [profitInputs, setProfitInputs] = useState<number[]>([]);
  const [workingIdxs, setWorkingIdxs] = useState<number[]>([]);
  const [bankMode, setBankMode] = useState('');
  const [bankGroups, setBankGroups] = useState<number[][]>([]);
  const [loanAuth, setLoanAuth] = useState('same');
  const [loanIdxs, setLoanIdxs] = useState<number[]>([]);
  const [remu, setRemu] = useState('act');
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [docHtml, setDocHtml] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openSup, setOpenSup] = useState<Record<string, boolean>>({});
  const [affData, setAffData] = useState({ officeAddr: '', signDate: '', premises: 'owner', reg: 'yes' });
  const [f1Data, setF1Data] = useState({ presentedBy: '', otherPlaces: '', duration: 'At will', date: '' });

  const updateFirm = (k: keyof typeof firm, v: string) => setFirm(f => ({ ...f, [k]: v }));

  const changePartners = (delta: number) => {
    setNumPartners(p => Math.max(2, p + delta));
    setBankGroups([]);
  };

  const updatePartner = (i: number, k: keyof Partner, v: string) => {
    setPartners(p => { const n = [...p]; while (n.length <= i) n.push({ name:'', rel:'S/o', father:'', age:'', address:'', aadhar:'', profit:0 }); n[i] = { ...n[i], [k]: v }; return n; });
    if (k === 'name' && profitInputs.length <= i) {
      setProfitInputs(pi => { const n = [...pi]; n[i] = 0; return n; });
    }
  };

  const profitTotal = profitInputs.reduce((a, b) => a + (b || 0), 0);

  const toggleWorking = (i: number) => {
    setWorkingIdxs(w => w.includes(i) ? w.filter(x => x !== i) : [...w, i]);
  };

  const togglePartnerInGroup = (gi: number, pi: number) => {
    setBankGroups(groups => {
      const g = groups.map(gr => [...gr]);
      const idx = g[gi].indexOf(pi);
      if (idx === -1) g[gi].push(pi); else g[gi].splice(idx, 1);
      return g;
    });
  };

  const addGroup = () => setBankGroups(g => [...g, []]);
  const removeGroup = (gi: number) => setBankGroups(g => g.length > 1 ? g.filter((_, i) => i !== gi) : [[...g[0]]]);

  const toggleLoanPartner = (i: number) => {
    setLoanIdxs(l => l.includes(i) ? l.filter(x => x !== i) : [...l, i]);
  };

  const updateWitness = (i: number, k: keyof Witness, v: string) => {
    setWitnesses(w => { const n = [...w]; while (n.length <= i) n.push({ name:'', co:'', address:'', aadhar:'' }); n[i] = { ...n[i], [k]: v }; return n; });
  };

  const validate = useCallback((s: number): boolean => {
    setErrors({});
    if (s === 1) {
      const req = ['firmName','bizType','bizNature','placeOfBiz','dateCommencement','placeExecution'] as const;
      for (const k of req) { if (!firm[k]) { setAlertMsg(`Fill in ${k}`); return false; } }
      if (numPartners < 2) { setAlertMsg('Min 2 partners'); return false; }
    }
    if (s === 2) {
      for (let i = 0; i < numPartners; i++) {
        const p = partners[i] || { name:'', father:'', age:'', address:'' };
        if (!p.name || !p.father || !p.age || !p.address) { setAlertMsg(`Fill all fields for Partner ${i+1}`); return false; }
      }
    }
    if (s === 3) {
      if (Math.abs(profitTotal - 100) > 0.01) { setAlertMsg('Profit sharing must total 100%'); return false; }
      if (workingIdxs.length === 0) { setAlertMsg('Select at least one working partner'); return false; }
    }
    if (s === 4) {
      if (!bankMode) { setAlertMsg('Select bank operation mode'); return false; }
      if (bankMode === 'groups') {
        const gs = bankGroups.filter(g => g.length > 0);
        if (gs.length === 0) { setAlertMsg('Add at least one bank group'); return false; }
        for (let i = 0; i < gs.length; i++) if (gs[i].length < 2) { setAlertMsg(`Group ${i+1} needs min 2 partners`); return false; }
      }
    }
    return true;
  }, [firm, numPartners, partners, profitTotal, workingIdxs, bankMode, bankGroups]);

  const goStep = (n: number) => { if (n <= step + 1 || n === 1) { setStep(n); setAlertMsg(''); window.scrollTo(0, 0); } };
  const nextStep = (s: number) => { if (validate(s)) { setStep(s + 1); setAlertMsg(''); window.scrollTo(0, 0); }
    if (s === 1) {
      const p = []; for (let i = 0; i < numPartners; i++) p.push(partners[i] || { name:'', rel:'S/o', father:'', age:'', address:'', aadhar:'', profit:0 });
      setPartners(p);
    }
    if (s === 2) { 
      const pi = []; for (let i = 0; i < numPartners; i++) pi.push(partners[i]?.profit || 0);
      setProfitInputs(pi.length ? pi : new Array(numPartners).fill(0));
    }
    if (s === 3) { setWorkingIdxs(w => w); }
  };

  const generateDeed = () => {
    const nw = parseInt(numWitnesses);
    if (!nw) { setAlertMsg('Select number of witnesses'); return; }
    for (let i = 0; i < nw; i++) {
      const w = witnesses[i] || { name:'', address:'' };
      if (!w.name || !w.address) { setAlertMsg(`Fill witness ${i+1} details`); return; }
    }

    const n = numPartners;
    const { firmName, bizNature, placeOfBiz, dateCommencement, placeExecution, capitalRate } = firm;
    const dateComm = formatDateLong(dateCommencement);
    const ps = partners.slice(0, n).map((p, i) => ({ ...p, profit: profitInputs[i] || 0 }));
    const wpNames = workingIdxs.map(i => `<b>${ps[i].name}</b>`).join(', ');
    const workingText = workingIdxs.map(i => `Party of the ${ordinal(i)} Part namely <b>${ps[i].name}</b>`).join(' and ');

    let bankOpText = '';
    if (bankMode === 'individual') bankOpText = 'Any one of the partners is individually authorized to manage and operate the bank accounts of the firm.';
    else if (bankMode === 'all_joint') {
      bankOpText = ps.map((p, i) => `Party of the ${ordinal(i)} Part namely <b>${p.name}</b>`).join(', ') + ' are all jointly authorized to manage and operate the bank accounts of the firm.';
    } else {
      const groups = bankGroups.filter(g => g.length > 0);
      const assigned = new Set(groups.flat());
      const unassigned: number[] = [];
      for (let i = 0; i < n; i++) if (!assigned.has(i)) unassigned.push(i);
      const gTexts = groups.map((g, gi) => {
        const names = g.map(i => `Party of the ${ordinal(i)} Part namely <b>${ps[i].name}</b>`).join(' and ');
        return `${names} ${g.length > 1 ? 'are jointly' : 'is individually'} authorized to operate Account ${gi+1}`;
      });
      if (unassigned.length > 0) {
        const uNames = unassigned.map(i => `Party of the ${ordinal(i)} Part namely <b>${ps[i].name}</b>`).join(' and ');
        gTexts.push(`${uNames} ${unassigned.length > 1 ? 'are' : 'is'} individually authorized to operate bank accounts`);
      }
      bankOpText = 'Bank accounts shall be operated as follows: ' + gTexts.join('; ') + '.';
    }

    let loanText = '';
    if (loanAuth === 'same') {
      if (bankMode === 'individual') loanText = 'Any one of the partners is authorized individually to raise any loans and advances on behalf of the firm from any Nationalized Banks or Financial Institutions.';
      else if (bankMode === 'all_joint') {
        loanText = ps.map((p, i) => `Party of the ${ordinal(i)} Part namely <b>${p.name}</b>`).join(', ') + ' are jointly authorized to raise loans and advances on behalf of the firm.';
      } else loanText = 'Persons authorized to operate bank accounts are also authorized to raise loans and advances on behalf of the firm.';
    } else {
      if (loanIdxs.length === 0) loanText = 'Loans shall be raised as mutually decided.';
      else {
        const lNames = loanIdxs.map(i => `Party of the ${ordinal(i)} Part namely <b>${ps[i].name}</b>`).join(' and ');
        loanText = `${lNames} ${loanIdxs.length > 1 ? 'are' : 'is'} authorized to raise loans and advances on behalf of the firm.`;
      }
    }

    const remuText = remu === 'act'
      ? 'The Remuneration payable to the Working Partners as decided by all the Partners from time to time and not to exceed the maximum permissible limit U/s. 40(b) of the Income-tax Act, 1961 as Amended from time to time.'
      : 'The Remuneration payable to the Working Partners shall be as mutually decided by all the Partners from time to time.';

    const ws = witnesses.slice(0, nw);
    const partyParas = ps.map((p, i) =>
      `<div class="doc-party">• <b>${p.name}</b>, <b>${p.rel} ${p.father}</b>, aged <b>${p.age}</b> years, residing at ${p.address}${p.aadhar ? ' (Aadhar: '+p.aadhar+')' : ''}<br>(Hereinafter referred as the party of the ${ordinal(i)} part)</div>${i < n-1 ? '<div class="and-sep">AND</div>' : ''}`
    ).join('');
    const profitLines = ps.map((p, i) => `${i+1}. <b>${p.name}</b> — <b>${p.profit}%</b>`).join('&nbsp;&nbsp;&nbsp;');
    const initRow = ps.map((p, i) => `${i+1}. ${p.name}`).join('&nbsp;&nbsp;&nbsp;&nbsp;');
    const witBlock = ws.map((w, i) => `<div style="margin-bottom:14px;">${i+1}. ${w.name}${w.co ? '<br>'+w.co : ''}<br>${w.address}${w.aadhar ? '<br>(Aadhar: '+w.aadhar+')' : ''}</div>`).join('');
    const capText = capitalRate === 'As mutually decided' ? 'as mutually decided' : capitalRate + '% per annum or as prescribed';
    const allOrd = ps.map((_, i) => ordinal(i)).join(', ');

    const html = `<h1>PARTNERSHIP DEED</h1>
<p>This Partnership Deed is entered and executed on this ${dateComm} out of free will and mutual consent by and between:</p>
<div class="doc-parties">${partyParas}</div>
<p>All ${numWords(n)} Parties herein called parties of the ${allOrd} as <b>PARTNERS</b> which term shall mean and include their Heirs, Legal Representatives, Executors, Administrators and Assignees. And whereas the partners have expressed their intention to operate the business in the name and style of <b>"${firmName}"</b> to ${bizNature}.</p>
<div class="initials-row">${initRow}</div>
<p><b>Now this deed witness is as follows: —</b></p>
<ol class="deed-ol">
<li><b>Name and Nature of the Firm:</b> That the business of the Partnership Shall be to ${bizNature}. The name of the firm shall be <b>${firmName}</b>.</li>
<li><b>Place of Business:</b> The registered office is situated at ${placeOfBiz}.</li>
<li><b>Date of Commencement:</b> The partnership shall come into effect from the ${dateComm} and shall continue till determined or as mutually decided by the partners.</li>
<li><b>Capital Contribution:</b><ol type="i" style="margin-left:22px;margin-top:5px;"><li>Capital shall be contributed by the partners as per the requirement of the business as mutually decided from time to time.</li><li>Interest at the rate of ${capText} U/s. 40(b)(iv) of the Income Tax Act, 1961 shall be payable to the partners on the amounts standing to their credit, credited at the close of each accounting year.</li></ol></li>
<li><b>Books of Accounts:</b> Proper Books of Accounts shall be maintained by the Working Partners ${wpNames}. All records shall be kept at the Principal Place of Business and shall be open for inspection by all partners. Accounts shall be closed on 31st March every year.</li>
<li><b>Remuneration:</b> ${remuText}</li>
</ol>
<div class="initials-row">${initRow}</div>
<ol class="deed-ol" start="7">
<li><b>Profit / Loss:</b><ol type="i" style="margin-left:22px;margin-top:5px;"><li>Profit and Loss shall be ascertained after deducting all expenses, charges and providing for such reserves as the partners may think fit.</li><li>Profit and Losses shall be shared in the following ratios:<br><br><b>${profitLines}</b></li></ol></li>
<li><b>Working Partners:</b> ${workingText} shall be the working partner(s) and shall take an active part in day-to-day conduct of the business affairs.</li>
<li><b>Operation of Bank Accounts:</b> Bank accounts shall be established in the name of the firm. ${bankOpText}</li>
<li><b>Advances and Loans:</b> ${loanText}</li>
<li><b>Contracts:</b> All business contracts shall be made in the name of the Firm namely <b>"${firmName}"</b>.</li>
<li><b>Duration:</b> The Duration of the Partnership Business shall be at will.</li>
<li><b>Death:</b> In the event of the demise of any partner, the eldest male child or, alternatively, the spouse or other legal heir shall step into the shoes of the deceased as a partner, to which the surviving partners shall have no objection.</li>
</ol>
<div class="initials-row">${initRow}</div>
<ol class="deed-ol" start="14">
<li><b>Disputes:</b> Any disputes arising between the parties shall be resolved through arbitration under the Indian Arbitration Act of 1940.</li>
<li><b>Retirement:</b> Partners are at liberty to retire by giving at least 30 days' notice. The retiring partner is not entitled to any share in the Goodwill.</li>
<li><b>Amendments:</b> Any terms may be altered with mutual consent of all parties. The Indian Partnership Act, 1932 shall apply to matters not expressly provided herein.</li>
<li><b>Drawings:</b> Partners may withdraw capital only with others' consent but may freely draw their share of profits credited to their accounts annually.</li>
<li><b>Dissolution:</b> The Partnership is at will and may be dissolved by mutual decision. On dissolution, net assets excluding goodwill shall be shared after adjusting excess investments.</li>
</ol>
<div class="deed-place">In witness whereof the said partners put their hands to this deed of partnership at ${placeExecution}.</div>
<table class="sig-table"><tr>
  <td><b>Signature of the Witnesses:</b><br><br>${witBlock}</td>
  <td><b>Signature of the Partners:</b><br><br>${ps.map((p, i) => `<div style="margin-bottom:22px;">${i+1}. <span class="sig-line"></span><br>&nbsp;&nbsp;&nbsp;${p.name}</div>`).join('')}</td>
</tr></table>`;

    setDocHtml(html);
    setDocTitle('⚖ Partnership Deed — ' + firmName);
    setAlertMsg('');
    setStep(0);
  };

  const generateAffidavit = () => {
    const ps = partners.slice(0, numPartners);
    const deponent = ps[0];
    if (!deponent?.name) { alert('Fill partner details first.'); return; }
    if (!affData.officeAddr || !affData.signDate) { alert('Fill Office Address and Sign Date.'); return; }
    const cpList = ps.slice(1).filter(p => p.name);
    const html = `<h1>AFFIDAVIT</h1>
<p>I, <b>${deponent.name}</b>, <b>${deponent.rel} ${deponent.father}</b>, aged <b>${deponent.age} years</b> residing at ${deponent.address} do hereby affirm and state as follows:</p>
<ul>
  <li>I, <b>${deponent.name}</b> have floated a Partnership Firm with ${cpList.map(p => `<b>${p.name}</b>`).join(' , ')} as the partner${cpList.length > 1 ? 's' : ''} to carry on the business under the name and style of <b>"${firm.firmName}"</b>.</li>
  <li>The said Firm commenced the business from ${formatDateLong(firm.dateCommencement)} and the office of the firm is situated at ${affData.officeAddr} and the said premises belong to me.</li>
  ${affData.reg === 'yes' ? `<li>The said firm has applied for Registration to the Registrar of Firms, ${firm.placeExecution}.</li>` : ''}
  ${affData.premises === 'owner' ? `<li>I have no objection and give my consent and acceptance for running the said firm in my building and I am not collecting any rent from the said firm because I am also one of the partners in the firm.</li>` : `<li>I have no objection and give my consent and acceptance for running the said firm in the said premises.</li>`}
</ul>
<p style="margin-top:16px;">Solemnly affirm and state that the above statement is true and fair to the best of my knowledge and signed at ${firm.placeExecution} on ${formatDateShort(affData.signDate)}.</p>
<div style="text-align:right;margin-top:36px;"><span class="sign-line"></span><br><b>DEPONENT</b></div>`;
    downloadDoc(html, 'Affidavit_' + firm.firmName);
  };

  const generateForm1 = () => {
    const ps = partners.slice(0, numPartners).filter(p => p.name);
    if (!f1Data.presentedBy || !f1Data.date) { alert('Fill Presented By and Date fields.'); return; }
    const ps2 = ps.filter(p => p.name && p.father && p.age);
    const tRows = ps2.map((p, i) => `<tr><td style="text-align:center;">${i + 1}</td><td>${p.name}</td><td>—</td><td>${p.address}</td></tr>`).join('');
    const sigs = ps2.map(p => `<li style="margin-bottom:6px;">${p.name}</li>`).join('');
    const decls = ps2.map(p => `<div class="decl-block"><p>I, <b>${p.name}</b>, <b>${p.rel} ${p.father}</b>, aged <b>${p.age} Years</b> do hereby declare that the above statement is true and correct to the best of my knowledge and belief.</p><div class="station-row"><span>Date: ${formatDateShort(f1Data.date)}</span><span>Signature: <span class="sign-line" style="width:130px;"></span></span></div></div>`).join('');
    const sn = ps2.map((p, i) => `${i + 1}. ${p.name.split(' ').map((w, j) => j === 0 ? w[0] + '.' : w).join(' ')}`).join('&nbsp;&nbsp;&nbsp;&nbsp;');
    const html = `<h1>FORM NO.1</h1><h2>THE INDIAN PARTNERSHIP ACT 1932</h2>
<p>Application for the registration of firm by the name <b>"${firm.firmName}"</b> presented to the Registrar of Firms by <b>${f1Data.presentedBy}</b>.</p>
<p>We, the undersigned, being the partners of the firm "<b>${firm.firmName}</b>", hereby apply for registration of the said firm pursuant to Section 58 of the Indian Partnership Act, 1932.</p>
<table style="border:none;margin:10px 0;">
  <tr><td style="border:none;width:240px;"><b>The Firm's Name</b></td><td style="border:none;">:&nbsp;&nbsp;<b>${firm.firmName}</b></td></tr>
  <tr><td style="border:none;" colspan="2"><b>Place of Business:</b></td></tr>
  <tr><td style="border:none;padding-left:22px;">(a) Principal Place:</td><td style="border:none;">:&nbsp;&nbsp;${firm.placeOfBiz}</td></tr>
  <tr><td style="border:none;padding-left:22px;">(b) Other Places:</td><td style="border:none;">:&nbsp;&nbsp;${f1Data.otherPlaces || '———'}</td></tr>
  <tr><td style="border:none;"><b>Nature of Business</b></td><td style="border:none;">:&nbsp;&nbsp;${firm.bizNature}</td></tr>
</table>
<p style="margin-left:24px;">${sn}</p>
<table><thead><tr><th style="width:45px;">S.No</th><th>Name</th><th style="width:120px;">Date of Joining</th><th>Permanent Address</th></tr></thead><tbody>${tRows}</tbody></table>
<p><b>Duration of the Firm:</b>&nbsp;&nbsp;${f1Data.duration}</p>
<p style="margin-top:18px;font-weight:bold;">DECLARATION</p>
<p>We solemnly and sincerely affirm and state that we, either individually or jointly, are not involved in any activity that offends any rule of law or carrying out any business in contravention of any state or central laws for the time being in force.</p>
<div class="station-row"><div><p>Station: ${firm.placeExecution}</p><p>Date: ${formatDateShort(f1Data.date)}</p></div><div><b>Signature of the Partners:</b><ul style="list-style:none;margin-top:8px;">${sigs}</ul></div></div>
<div style="margin-top:24px;">${decls}</div>`;
    downloadDoc(html, 'Form_No_1_' + firm.firmName);
  };

  const generatePhotoForm = () => {
    const ps = partners.slice(0, numPartners).filter(p => p.name);
    const ws = witnesses.slice(0, parseInt(numWitnesses) || 0).filter(w => w.name);
    if (!ps.length) { alert('No partners to include.'); return; }
    const pRows = ps.map((p, i) => `<tr><td style="text-align:center;">${i + 1}.</td><td><b>${p.name}, ${p.rel} ${p.father}</b></td><td>${p.address}</td><td class="photo-cell"><div style="border:1px dashed #bbb;width:68px;height:68px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#bbb;">Photo</div></td><td class="photo-cell" style="width:120px;"><div style="border:1px dashed #bbb;width:98px;height:68px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#bbb;text-align:center;">Sign &amp; Thumb</div></td></tr>`).join('');
    const wRows = ws.map((w, i) => `<tr><td style="text-align:center;">${i + 1}</td><td><b>${w.name}</b></td><td>${w.address}</td><td class="photo-cell"><div style="border:1px dashed #bbb;width:68px;height:68px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#bbb;">Photo</div></td><td class="photo-cell" style="width:120px;"><div style="border:1px dashed #bbb;width:98px;height:68px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#bbb;text-align:center;">Sign &amp; Thumb</div></td></tr>`).join('');
    const html = `<div class="firm-hdr">${firm.firmName}</div><div class="firm-addr">${firm.placeOfBiz}</div>
<div class="section-hdr">PARTNERS LIST WITH PHOTO, SIGNATURE AND LEFT THUMB IMPRESSION</div>
<table><thead><tr><th style="width:46px;">S.No</th><th>Partners Name &amp; Father Name</th><th>Address</th><th style="width:96px;">Photo</th><th style="width:126px;">Signature &amp; Thumb</th></tr></thead><tbody>${pRows}</tbody></table>
<div style="margin-top:32px;"></div>
<div class="firm-hdr">${firm.firmName}</div><div class="firm-addr">${firm.placeOfBiz}</div>
<div class="section-hdr">WITNESS LIST WITH PHOTO, SIGNATURE AND LEFT THUMB IMPRESSION</div>
<table><thead><tr><th style="width:46px;">S.No</th><th>Witness Name</th><th>Address</th><th style="width:96px;">Photo</th><th style="width:126px;">Signature &amp; Thumb</th></tr></thead><tbody>${wRows}</tbody></table>`;
    downloadDoc(html, 'Photo_Form_' + firm.firmName);
  };

  const inputClass = "w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10";

  const stepDots = [
    { n: 1, label: 'Firm Details' }, { n: 2, label: 'Partners' },
    { n: 3, label: 'Business Terms' }, { n: 4, label: 'Operations' },
    { n: 5, label: 'Witnesses & Review' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-[#1a1209]">Partnership Deed</h1>
        <p className="text-sm text-[#7a6e5a] mt-1">Generate a legally structured partnership deed under the Indian Partnership Act, 1932.</p>
      </div>

      {step > 0 && (
        <>
          <div className="h-1.5 bg-[#d6c9a0] rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2c4a1e] to-[#b8860b] transition-all duration-300 rounded-full" style={{ width: `${step * 20}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {stepDots.map(s => (
              <button key={s.n} onClick={() => goStep(s.n)}
                className={cls(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                  step === s.n && 'bg-[#2c4a1e] text-white border-[#2c4a1e]',
                  step > s.n && 'bg-[#f5e9c8] text-[#2c4a1e] border-[#b8860b]',
                  step < s.n && 'bg-white text-[#7a6e5a] border-[#d6c9a0]'
                )}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-current text-white shrink-0">{step > s.n ? '✓' : s.n}</span>
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {alertMsg && (
        <div className="mb-6 p-3 rounded-lg bg-[#fdf0f0] border border-[#e8b8b8] text-[#8b2020] text-sm">{alertMsg}</div>
      )}

      {step === 0 && docHtml ? (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#1a1209] text-[#faf7f0] px-6 py-3 flex items-center justify-between gap-3">
            <span className="font-serif text-sm">{docTitle}</span>
            <div className="flex gap-2">
              <button onClick={() => downloadDoc(docHtml, `Partnership_Deed_${firm.firmName.replace(/\s+/g, '_')}`)}
                className="bg-[#b8860b] text-[#1a1209] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#d4a017] transition cursor-pointer">
                ⬇ Download DOC
              </button>
              <button onClick={() => { setStep(5); setDocHtml(''); }}
                className="bg-transparent text-[#faf7f0] border border-white/20 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/10 transition cursor-pointer">
                ✎ Edit
              </button>
            </div>
          </div>
          <div className="doc-content p-10" dangerouslySetInnerHTML={{ __html: docHtml }} />
        </div>
      ) : step === 1 ? (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">Step 1 — Firm &amp; Business Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Business / Firm Name" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={firm.firmName} onChange={e => updateFirm('firmName', e.target.value)} placeholder="e.g. VIJAYA ICU" /></Field>
            <Field label="Type of Business" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={firm.bizType} onChange={e => updateFirm('bizType', e.target.value)} placeholder="e.g. Hospital / ICU" /></Field>
            <div className="md:col-span-2"><Field label="Nature / Full Description" required><textarea className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10 min-h-[70px]" value={firm.bizNature} onChange={e => updateFirm('bizNature', e.target.value)} rows={3} /></Field></div>
            <div className="md:col-span-2"><Field label="Registered / Principal Place of Business" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={firm.placeOfBiz} onChange={e => updateFirm('placeOfBiz', e.target.value)} /></Field></div>
            <Field label="Date of Commencement" required><input type="date" className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={firm.dateCommencement} onChange={e => updateFirm('dateCommencement', e.target.value)} /></Field>
            <Field label="Place of Execution" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={firm.placeExecution} onChange={e => updateFirm('placeExecution', e.target.value)} placeholder="e.g. Kurnool" /></Field>
            <Field label="Capital Interest Rate" required>
              <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={firm.capitalRate} onChange={e => updateFirm('capitalRate', e.target.value)}>
                <option value="12">12% p.a. (Standard u/s 40(b))</option>
                <option value="As mutually decided">As mutually decided</option>
              </select>
            </Field>
          </div>
          <div className="flex items-center gap-4 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Number of Partners<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => changePartners(-1)} className="w-8 h-8 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-lg text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">−</button>
              <span className="font-serif text-2xl font-semibold text-[#2c4a1e] min-w-[32px] text-center">{numPartners}</span>
              <button onClick={() => changePartners(1)} className="w-8 h-8 rounded-lg border-2 border-[#d6c9a0] flex items-center justify-center font-bold text-lg text-[#2c4a1e] hover:bg-[#f5e9c8] cursor-pointer">+</button>
            </div>
            <span className="text-xs text-[#7a6e5a]">partners · Min 2, no upper limit</span>
          </div>
          <div className="flex justify-end mt-8"><Button onClick={() => nextStep(1)}>Next: Partner Details →</Button></div>
        </div>
      ) : step === 2 ? (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">Step 2 — Partner Details</h2>
          {Array.from({ length: numPartners }).map((_, i) => (
            <div key={i} className="border border-[#f5e9c8] rounded-xl p-5 mb-4 bg-gradient-to-br from-[#fffef8] to-[#faf7f0]">
              <div className="font-serif font-semibold text-[#2c4a1e] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#2c4a1e] text-white flex items-center justify-center text-xs font-bold">{i+1}</span>
                Partner {i+1} — <em className="font-normal">{ordinal(i)} Party</em>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-3"><Field label="Full Name" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={partners[i]?.name || ''} onChange={e => updatePartner(i, 'name', e.target.value)} placeholder="As per official records" /></Field></div>
                <Field label="Relationship">
                  <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={partners[i]?.rel || 'S/o'} onChange={e => updatePartner(i, 'rel', e.target.value)}>
                    <option value="S/o">S/o (Son of)</option><option value="D/o">D/o (Daughter of)</option><option value="W/o">W/o (Wife of)</option>
                  </select>
                </Field>
                <Field label="Father's / Husband's Name" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={partners[i]?.father || ''} onChange={e => updatePartner(i, 'father', e.target.value)} /></Field>
                <Field label="Age (years)" required><input type="number" className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={partners[i]?.age || ''} onChange={e => updatePartner(i, 'age', e.target.value)} min={18} max={99} /></Field>
                <div className="md:col-span-3"><Field label="Residential Address" required><textarea className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10 min-h-[60px]" value={partners[i]?.address || ''} onChange={e => updatePartner(i, 'address', e.target.value)} rows={2} /></Field></div>
                <Field label="Aadhar Number"><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={partners[i]?.aadhar || ''} onChange={e => updatePartner(i, 'aadhar', e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} /></Field>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => goStep(1)}>← Back</Button>
            <Button onClick={() => nextStep(2)}>Next: Business Terms →</Button>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">Step 3 — Business Terms</h2>
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Profit / Loss Sharing Ratio<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          {Array.from({ length: numPartners }).map((_, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_20px] gap-3 items-center mb-3">
              <span className="text-sm font-medium">{partners[i]?.name || `Partner ${i+1}`}</span>
              <input type="number" className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={profitInputs[i] || ''} onChange={e => { const pi = [...profitInputs]; pi[i] = parseFloat(e.target.value) || 0; setProfitInputs(pi); }} placeholder="%" min={0} max={100} step={0.01} />
              <span className="text-xs text-[#7a6e5a]">%</span>
            </div>
          ))}
          <div className={`text-right text-sm font-semibold py-2 ${Math.abs(profitTotal - 100) > 0.01 ? 'text-[#8b2020]' : 'text-[#2c4a1e]'}`}>Total: {profitTotal.toFixed(2)}%</div>
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Working Partners<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: numPartners }).map((_, i) => (
              <label key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-all ${workingIdxs.includes(i) ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#7a6e5a] border-[#d6c9a0]'}`}>
                <input type="checkbox" checked={workingIdxs.includes(i)} onChange={() => toggleWorking(i)} className="hidden" />
                {partners[i]?.name || `Partner ${i+1}`}
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => goStep(2)}>← Back</Button>
            <Button onClick={() => nextStep(3)}>Next: Operations →</Button>
          </div>
        </div>
      ) : step === 4 ? (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">Step 4 — Operations &amp; Banking</h2>
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Bank Account Operation Mode<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          <div className="flex flex-wrap gap-3">
            {['individual', 'all_joint', 'groups'].map(m => (
              <label key={m} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all ${bankMode === m ? 'border-[#2c4a1e] bg-[#f5e9c8] text-[#2c4a1e] font-semibold' : 'bg-white border-[#d6c9a0] text-[#7a6e5a]'}`}>
                <input type="radio" name="bankMode" value={m} checked={bankMode === m} onChange={() => { setBankMode(m); if (m === 'groups' && bankGroups.length === 0) setBankGroups([[]]); }} className="accent-[#2c4a1e]" />
                {m === 'individual' ? 'Any one partner individually' : m === 'all_joint' ? 'All partners jointly' : 'Custom groups'}
              </label>
            ))}
          </div>
          {bankMode === 'groups' && (
            <div className="mt-6">
              {bankGroups.map((group, gi) => (
                <div key={gi} className="border border-[#d6c9a0] rounded-lg p-4 mb-3 bg-[#faf7f0]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[#2c4a1e] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#b8860b] text-[#1a1209] flex items-center justify-center text-[10px] font-bold">{gi+1}</span>
                      Account Group {gi+1} <span className="text-[11px] text-[#7a6e5a] font-normal">({group.length} partners)</span>
                    </span>
                    {bankGroups.length > 1 && (
                      <button onClick={() => removeGroup(gi)} className="text-[11px] bg-[#fdf0f0] text-[#8b2020] px-2 py-1 rounded border border-[#e8b8b8] hover:bg-[#f8d8d8] cursor-pointer">✕ Remove</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: numPartners }).map((_, i) => (
                      <button key={i} onClick={() => togglePartnerInGroup(gi, i)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${group.includes(i) ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#7a6e5a] border-[#d6c9a0]'}`}>
                        {partners[i]?.name || `Partner ${i+1}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addGroup} className="w-full py-3 border-2 border-dashed border-[#d6c9a0] rounded-lg text-sm text-[#7a6e5a] hover:border-[#2c4a1e] hover:text-[#2c4a1e] hover:bg-[#f5e9c8] transition cursor-pointer">+ Add Another Account Group</button>
            </div>
          )}
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Loans &amp; Advances Authority<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          <div className="flex flex-wrap gap-3">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all ${loanAuth === 'same' ? 'border-[#2c4a1e] bg-[#f5e9c8] text-[#2c4a1e] font-semibold' : 'bg-white border-[#d6c9a0] text-[#7a6e5a]'}`}>
              <input type="radio" name="loanAuth" value="same" checked={loanAuth === 'same'} onChange={() => setLoanAuth('same')} className="accent-[#2c4a1e]" />
              Same as bank operators
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all ${loanAuth === 'specific' ? 'border-[#2c4a1e] bg-[#f5e9c8] text-[#2c4a1e] font-semibold' : 'bg-white border-[#d6c9a0] text-[#7a6e5a]'}`}>
              <input type="radio" name="loanAuth" value="specific" checked={loanAuth === 'specific'} onChange={() => setLoanAuth('specific')} className="accent-[#2c4a1e]" />
              Specify separately
            </label>
          </div>
          {loanAuth === 'specific' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: numPartners }).map((_, i) => (
                <label key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-all ${loanIdxs.includes(i) ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#7a6e5a] border-[#d6c9a0]'}`}>
                  <input type="checkbox" checked={loanIdxs.includes(i)} onChange={() => toggleLoanPartner(i)} className="hidden" />
                  {partners[i]?.name || `Partner ${i+1}`}
                </label>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Remuneration<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          <div className="flex flex-wrap gap-3">
            {['act', 'decided'].map(r => (
              <label key={r} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all ${remu === r ? 'border-[#2c4a1e] bg-[#f5e9c8] text-[#2c4a1e] font-semibold' : 'bg-white border-[#d6c9a0] text-[#7a6e5a]'}`}>
                <input type="radio" name="remu" value={r} checked={remu === r} onChange={() => setRemu(r)} className="accent-[#2c4a1e]" />
                {r === 'act' ? 'As per IT Act 1961 — Sec 40(b)' : 'As mutually decided'}
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => goStep(3)}>← Back</Button>
            <Button onClick={() => nextStep(4)}>Next: Witnesses →</Button>
          </div>
        </div>
      ) : step === 5 ? (
        <div className="bg-white border-2 border-[#d6c9a0] rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold text-[#1a1209] pb-3 border-b-2 border-[#f5e9c8] mb-6">Step 5 — Witnesses &amp; Final Review</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Field label="Number of Witnesses" required>
              <select className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={numWitnesses} onChange={e => setNumWitnesses(e.target.value)}>
                <option value="">— Select —</option>
                <option value="1">1</option><option value="2">2</option><option value="3">3</option>
              </select>
            </Field>
          </div>
          {numWitnesses && Array.from({ length: parseInt(numWitnesses) }).map((_, i) => (
            <div key={i} className="border border-[#f5e9c8] rounded-xl p-4 mb-3 bg-gradient-to-br from-[#fffef8] to-[#faf7f0]">
              <div className="font-serif font-semibold text-[#7a6e5a] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7a6e5a] text-white flex items-center justify-center text-[10px] font-bold">W{i+1}</span>
                Witness {i+1}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full Name" required><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={witnesses[i]?.name || ''} onChange={e => updateWitness(i, 'name', e.target.value)} /></Field>
                <Field label="C/o"><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={witnesses[i]?.co || ''} onChange={e => updateWitness(i, 'co', e.target.value)} /></Field>
                <div className="md:col-span-2"><Field label="Address" required><textarea className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10 min-h-[60px]" value={witnesses[i]?.address || ''} onChange={e => updateWitness(i, 'address', e.target.value)} rows={2} /></Field></div>
                <Field label="Aadhar Number"><input className="w-full p-2.5 border border-[#d6c9a0] rounded-lg text-sm bg-white outline-none focus:border-[#b8860b] focus:ring-3 focus:ring-[#b8860b]/10" value={witnesses[i]?.aadhar || ''} onChange={e => updateWitness(i, 'aadhar', e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} /></Field>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-wider text-[#d6c9a0]"><span className="flex-1 h-px bg-[#d6c9a0]" />Summary<span className="flex-1 h-px bg-[#d6c9a0]" /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <SummaryItem label="Firm Name" value={firm.firmName} />
            <SummaryItem label="Business Type" value={firm.bizType} />
            <SummaryItem label="Place of Business" value={firm.placeOfBiz} />
            <SummaryItem label="Date of Commencement" value={formatDateLong(firm.dateCommencement)} />
            <SummaryItem label="Partners" value={partners.slice(0, numPartners).map(p => p.name).join(' · ')} />
            <SummaryItem label="Bank Operation" value={bankMode === 'individual' ? 'Any one individually' : bankMode === 'all_joint' ? 'All jointly' : 'Custom groups'} />
          </div>

          {/* Supporting Registration Documents */}
          <div className="mt-8 pt-6 border-t-2 border-[#f5e9c8]">
            <h3 className="font-serif text-base font-semibold text-[#1a1209] mb-1">Registration Documents</h3>
            <p className="text-xs text-[#7a6e5a] mb-4">Generate supporting documents for firm registration using the data above.</p>

            {/* Affidavit */}
            <div className="border border-[#d6c9a0] rounded-xl mb-3 overflow-hidden">
              <div onClick={() => setOpenSup(s => ({ ...s, aff: !s.aff }))} className="flex items-center gap-3 px-5 py-3 cursor-pointer bg-[#faf7f0] hover:bg-[#f5e9c8] transition-colors">
                <span className="text-lg">📜</span>
                <span className="flex-1 text-sm font-semibold text-[#1a1209]">Affidavit (Owner's Premises)</span>
                <span className={`text-[#7a6e5a] transition-transform ${openSup.aff ? 'rotate-180' : ''}`}>▾</span>
              </div>
              {openSup.aff && (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-[#7a6e5a]">Affidavit by <b>Partner 1 — {partners[0]?.name || '(fill partner details)'}</b> as deponent. Fill additional fields below.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Office / Premises Address" required><input className={inputClass} value={affData.officeAddr} onChange={e => setAffData(d => ({ ...d, officeAddr: e.target.value }))} /></Field>
                    <Field label="Date of Signing" required><input type="date" className={inputClass} value={affData.signDate} onChange={e => setAffData(d => ({ ...d, signDate: e.target.value }))} /></Field>
                    <div className="md:col-span-2">
                      <Field label="Premises Ownership">
                        <div className="flex flex-wrap gap-3">
                          {['owner', 'tenant'].map(v => (
                            <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer ${affData.premises === v ? 'border-[#2c4a1e] bg-[#f5e9c8] font-semibold' : 'border-[#d6c9a0] bg-white'}`}>
                              <input type="radio" name="aff_premises" value={v} checked={affData.premises === v} onChange={() => setAffData(d => ({ ...d, premises: v }))} className="accent-[#2c4a1e]" />
                              {v === 'owner' ? 'Yes — Owner (no rent)' : 'No — Rented / Other'}
                            </label>
                          ))}
                        </div>
                      </Field>
                    </div>
                    <Field label="Registration Applied?">
                      <div className="flex flex-wrap gap-3">
                        {['yes', 'no'].map(v => (
                          <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer ${affData.reg === v ? 'border-[#2c4a1e] bg-[#f5e9c8] font-semibold' : 'border-[#d6c9a0] bg-white'}`}>
                            <input type="radio" name="aff_reg" value={v} checked={affData.reg === v} onChange={() => setAffData(d => ({ ...d, reg: v }))} className="accent-[#2c4a1e]" />
                            {v === 'yes' ? 'Yes' : 'No'}
                          </label>
                        ))}
                      </div>
                    </Field>
                  </div>
                  <div className="flex justify-end"><button onClick={generateAffidavit} className="px-5 py-2 rounded-lg bg-[#2c4a1e] text-white text-xs font-semibold hover:bg-[#3d6129] transition cursor-pointer">📜 Generate Affidavit</button></div>
                </div>
              )}
            </div>

            {/* Form No. 1 */}
            <div className="border border-[#d6c9a0] rounded-xl mb-3 overflow-hidden">
              <div onClick={() => setOpenSup(s => ({ ...s, f1: !s.f1 }))} className="flex items-center gap-3 px-5 py-3 cursor-pointer bg-[#faf7f0] hover:bg-[#f5e9c8] transition-colors">
                <span className="text-lg">📋</span>
                <span className="flex-1 text-sm font-semibold text-[#1a1209]">Form No. 1 (Registration u/s 58)</span>
                <span className={`text-[#7a6e5a] transition-transform ${openSup.f1 ? 'rotate-180' : ''}`}>▾</span>
              </div>
              {openSup.f1 && (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-[#7a6e5a]">Application for registration of the firm under IPA 1932.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Presented By" required><input className={inputClass} value={f1Data.presentedBy} onChange={e => setF1Data(d => ({ ...d, presentedBy: e.target.value }))} placeholder="e.g. Partner 1 name or Authorised Rep" /></Field>
                    <Field label="Other Places of Business"><input className={inputClass} value={f1Data.otherPlaces} onChange={e => setF1Data(d => ({ ...d, otherPlaces: e.target.value }))} /></Field>
                    <Field label="Duration">
                      <select className={inputClass} value={f1Data.duration} onChange={e => setF1Data(d => ({ ...d, duration: e.target.value }))}>
                        <option value="At will">At will</option><option value="Fixed term">Fixed term</option>
                      </select>
                    </Field>
                    <Field label="Date" required><input type="date" className={inputClass} value={f1Data.date} onChange={e => setF1Data(d => ({ ...d, date: e.target.value }))} /></Field>
                  </div>
                  <div className="flex justify-end"><button onClick={generateForm1} className="px-5 py-2 rounded-lg bg-[#2c4a1e] text-white text-xs font-semibold hover:bg-[#3d6129] transition cursor-pointer">📋 Generate Form No. 1</button></div>
                </div>
              )}
            </div>

            {/* Photo Form */}
            <div className="border border-[#d6c9a0] rounded-xl overflow-hidden">
              <div onClick={() => setOpenSup(s => ({ ...s, photo: !s.photo }))} className="flex items-center gap-3 px-5 py-3 cursor-pointer bg-[#faf7f0] hover:bg-[#f5e9c8] transition-colors">
                <span className="text-lg">🪪</span>
                <span className="flex-1 text-sm font-semibold text-[#1a1209]">Photo Form (KYC)</span>
                <span className={`text-[#7a6e5a] transition-transform ${openSup.photo ? 'rotate-180' : ''}`}>▾</span>
              </div>
              {openSup.photo && (
                <div className="p-5">
                  <p className="text-xs text-[#7a6e5a] mb-4">Generates a table with <b>{partners.slice(0, numPartners).filter(p => p.name).length} partners</b> and <b>{witnesses.slice(0, parseInt(numWitnesses) || 0).filter(w => w.name).length} witnesses</b>. Photo and signature placeholders included for printing.</p>
                  <div className="flex justify-end"><button onClick={generatePhotoForm} className="px-5 py-2 rounded-lg bg-[#2c4a1e] text-white text-xs font-semibold hover:bg-[#3d6129] transition cursor-pointer">🪪 Generate Photo Form</button></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => goStep(4)}>← Back</Button>
            <Button variant="gold" onClick={generateDeed}>⚖ Generate Partnership Deed</Button>
          </div>
        </div>
      ) : null}
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#faf7f0] rounded-lg p-3 border border-[#d6c9a0]">
      <div className="text-[10px] font-semibold text-[#7a6e5a] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-medium">{value || '—'}</div>
    </div>
  );
}
