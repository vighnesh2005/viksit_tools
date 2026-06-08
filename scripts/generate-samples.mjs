import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { DATA } from './dummy-data.mjs';

const PORT = 3456;
const BASE = `http://localhost:${PORT}`;
const OUT = join(process.cwd(), 'samples');
const BASE_STYLES = `body{font-family:'Book Antiqua',serif;font-size:12pt;margin:1in;color:#000;line-height:1.5;}
h1,h2{text-align:center;font-weight:bold;}
h1{margin:0 0 6pt;}h2{font-size:13pt;margin:16pt 0 8pt;}
h3{font-weight:bold;margin:14pt 0 6pt;}
p{text-align:justify;margin-bottom:6pt;line-height:1.5;}
.sig-line{border-bottom:1pt solid #000;display:inline-block;width:160pt;margin-top:8pt;}
.station-row{display:flex;justify-content:space-between;margin-top:10pt;font-size:11pt;}
.decl-block{margin:12pt 0;border-left:3pt solid #b8860b;padding:8pt 12pt;}
.deed-title{text-align:center;font-size:16pt;font-weight:bold;text-decoration:underline;margin-bottom:14pt;}
.affidavit-title{text-align:center;font-size:14pt;font-weight:bold;margin-bottom:14pt;}
.form1-title{text-align:center;font-size:14pt;font-weight:bold;margin-bottom:4pt;}
.doc-party{margin-bottom:6pt;}.and-sep{text-align:center;font-weight:bold;margin:4pt 0;}
.photo-cell{text-align:center;vertical-align:middle;}
table{width:100%;border-collapse:collapse;margin:8pt 0;}
td,th{border:1pt solid #000;padding:4pt 6pt;text-align:left;font-size:11pt;}
th{font-weight:bold;text-align:center;background:#f0e8d0;}
`;

let serverProcess;

function startServer() {
  return new Promise((res, rej) => {
    serverProcess = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
      stdio: ['ignore', 'pipe', 'pipe'], shell: true,
      env: { ...process.env, PORT: String(PORT) },
    });
    const t = setTimeout(() => rej(new Error('Server start timeout')), 120000);
    const onData = (d) => { if (d.toString().includes('ready')) { clearTimeout(t); setTimeout(res, 3000); } };
    serverProcess.stdout.on('data', onData);
    serverProcess.stderr.on('data', onData);
    serverProcess.on('error', (e) => { clearTimeout(t); rej(e); });
  });
}

function stopServer() { if (serverProcess) { serverProcess.kill(); serverProcess = null; } }

function wrapHtml(body, fn) {
  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${fn}</title><style>${BASE_STYLES}</style></head><body>${body}</body></html>`;
}

async function saveDoc(dir, name, body) {
  const d = join(OUT, dir);
  if (!existsSync(d)) await mkdir(d, { recursive: true });
  await writeFile(join(d, `${name}.doc`), wrapHtml(body, name));
  console.log(`  ✓ ${name}.doc`);
}

// ─── Helpers ───────────────────────────────

// Find the Nth field container by label text (0-based)
function fieldContainer(page, label, nth = 0) {
  return page.locator('div.flex.flex-col').filter({ hasText: label }).nth(nth);
}

async function fillF(page, label, value, nth = 0) {
  await fieldContainer(page, label, nth).locator('input, select, textarea').fill(value);
}

async function selectF(page, label, value, nth = 0) {
  await fieldContainer(page, label, nth).locator('select').selectOption(value);
}

async function btn(page, text) {
  await page.getByRole('button', { name: text }).click();
}

// Click a radio by name attr and value
async function radio(page, name, value) {
  await page.locator(`input[type="radio"][name="${name}"][value="${value}"]`).check({ force: true });
}

// Click a styled label (used for checkbox-like toggle pills)
async function togglePill(page, text) {
  await page.locator('label').filter({ hasText: text }).first().click();
}

// ─── 1. Partnership Deed ──────────────────

async function genPartnershipDeed(context) {
  console.log('\n📄 Partnership Deed...');
  const page = await context.newPage();
  const d = DATA.partnershipDeed;
  await page.goto(`${BASE}/tools/partnership-deed`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1000);

  // Step 1 — Firm
  await fillF(page, 'BUSINESS / FIRM NAME', d.firm.firmName);
  await fillF(page, 'TYPE OF BUSINESS', d.firm.bizType);
  await fillF(page, 'NATURE / FULL DESCRIPTION', d.firm.bizNature);
  await fillF(page, 'REGISTERED / PRINCIPAL PLACE', d.firm.placeOfBiz);
  await fillF(page, 'DATE OF COMMENCEMENT', d.firm.dateCommencement);
  await fillF(page, 'PLACE OF EXECUTION', d.firm.placeExecution);
  await selectF(page, 'CAPITAL INTEREST RATE', d.firm.capitalRate);
  await btn(page, 'Next: Partner Details');
  await page.waitForTimeout(300);

  // Step 2 — Partners
  for (let i = 0; i < d.partners.length; i++) {
    await fillF(page, 'FULL NAME', d.partners[i].name, i);
    await selectF(page, 'RELATIONSHIP', d.partners[i].rel, i);
    await fillF(page, "FATHER'S / HUSBAND'S NAME", d.partners[i].father, i);
    await fillF(page, 'AGE (YEARS)', d.partners[i].age, i);
    await fillF(page, 'RESIDENTIAL ADDRESS', d.partners[i].address, i);
    await fillF(page, 'AADHAR NUMBER', d.partners[i].aadhar, i);
  }
  await btn(page, 'Next: Business Terms');
  await page.waitForTimeout(300);

  // Step 3 — Profit sharing
  for (let i = 0; i < d.partners.length; i++) {
    await page.locator('input[placeholder="%"]').nth(i).fill(String(d.profitInputs[i]));
  }
  // Working partners — toggle pills
  for (const wi of d.workingIdxs) {
    await togglePill(page, d.partners[wi].name);
  }
  await btn(page, 'Next: Operations');
  await page.waitForTimeout(300);

  // Step 4 — Banking & Operations
  await radio(page, 'bankMode', d.bankMode);
  await radio(page, 'loanAuth', d.loanAuth);
  await radio(page, 'remu', d.remu);
  await btn(page, 'Next: Witnesses');
  await page.waitForTimeout(300);

  // Step 5 — Witnesses
  await selectF(page, 'NUMBER OF WITNESSES', d.numWitnesses);
  await page.waitForTimeout(300);
  for (let i = 0; i < d.witnesses.length; i++) {
    await fillF(page, 'FULL NAME', d.witnesses[i].name, i);
    await fillF(page, 'C/O', d.witnesses[i].co, i);
    await fillF(page, 'ADDRESS', d.witnesses[i].address, i);
    await fillF(page, 'AADHAR NUMBER', d.witnesses[i].aadhar, i);
  }

  // 1a. Affidavit — expand section
  await page.locator('div.cursor-pointer').filter({ hasText: "Affidavit (Owner's" }).click();
  await page.waitForTimeout(200);
  await fillF(page, 'OFFICE / PREMISES ADDRESS', d.affData.officeAddr);
  await fillF(page, 'DATE OF SIGNING', d.affData.signDate);
  await radio(page, 'aff_premises', d.affData.premises);
  await radio(page, 'aff_reg', d.affData.reg);
  await downloadOrCapture(page, 'Generate Affidavit', 'partnership-deed', 'Affidavit');

  // 1b. Form No. 1
  // Find the Form No. 1 section header and click it
  const form1Headers = page.locator('div.cursor-pointer').filter({ hasText: 'Form No. 1' });
  if (await form1Headers.count() > 0) await form1Headers.first().click();
  await page.waitForTimeout(200);
  await fillF(page, 'PRESENTED BY', d.f1Data.presentedBy);
  await fillF(page, 'OTHER PLACES OF BUSINESS', d.f1Data.otherPlaces);
  await selectF(page, 'DURATION', d.f1Data.duration);
  await fillF(page, 'DATE', d.f1Data.date, 0); // the Date inside Form 1 panel
  // There may be multiple "DATE" fields; pick the one inside the Form 1 section
  await downloadOrCapture(page, 'Generate Form No. 1', 'partnership-deed', 'Form_No_1');

  // 1c. Partnership Deed (main) — shows DocPreview
  await btn(page, 'Generate Partnership Deed');
  await page.waitForTimeout(500);
  const deedHtml = await page.locator('.doc-content').first().innerHTML();
  await saveDoc('partnership-deed', 'Partnership_Deed', deedHtml);

  // Back to step 5 via Edit
  await btn(page, 'Edit');
  await page.waitForTimeout(300);

  // 1d. Photo Form
  const photoHeaders = page.locator('div.cursor-pointer').filter({ hasText: 'Photo Form' });
  if (await photoHeaders.count() > 0) {
    if (!(await photoHeaders.first().getAttribute('class'))?.includes('open')) {
      await photoHeaders.first().click();
      await page.waitForTimeout(200);
    }
  }
  await downloadOrCapture(page, 'Generate Photo Form', 'partnership-deed', 'Photo_Form');
  await page.close();
}

// ─── 2. Doc Suite — Firm ───────────────────

async function genDocSuiteFirm(context) {
  console.log('\n📄 Doc Suite — Firm...');
  const page = await context.newPage();
  const fd = DATA.documentSuite.firmDocs;
  await page.goto(`${BASE}/tools/document-suite`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(500);

  // 2a. Affidavit
  await btn(page, 'Affidavit');
  await page.waitForTimeout(300);
  const aff = fd.affData;
  await fillF(page, 'FULL NAME', aff.name);
  await selectF(page, 'RELATIONSHIP', aff.rel);
  await fillF(page, 'FATHER / HUSBAND NAME', aff.father);
  await fillF(page, 'AGE', aff.age);
  await fillF(page, 'RESIDENTIAL ADDRESS', aff.address);
  await fillF(page, 'FIRM NAME', aff.firm);
  await fillF(page, 'DATE OF COMMENCEMENT', aff.dateComm);
  await fillF(page, 'OFFICE / PREMISES ADDRESS', aff.officeAddr);
  await fillF(page, 'SIGNED AT (PLACE)', aff.station);
  await fillF(page, 'DATE OF SIGNING', aff.signDate);
  await radio(page, 'aff_premises', aff.premises);
  await radio(page, 'aff_reg', aff.reg);
  // Co-partner (nth=0 since only 1)
  await fillF(page, 'FULL NAME', aff.coPartners[0], 1);
  await downloadOrCapture(page, 'Generate Affidavit', 'document-suite', 'Affidavit');

  // 2b. Form No. 1
  await btn(page, 'Form No. 1');
  await page.waitForTimeout(300);
  const f1 = fd.form1Data;
  await fillF(page, 'FIRM NAME', f1.firm);
  await fillF(page, 'PRESENTED BY', f1.presentedBy);
  await fillF(page, 'PRINCIPAL PLACE OF BUSINESS', f1.principalPlace);
  await fillF(page, 'OTHER PLACES OF BUSINESS', f1.otherPlaces || '');
  await fillF(page, 'NATURE OF BUSINESS', f1.nature);
  await selectF(page, 'DURATION', f1.duration);
  await fillF(page, 'STATION', f1.station);
  await fillF(page, 'DATE', f1.date);
  for (let i = 0; i < f1.partners.length; i++) {
    await fillF(page, 'FULL NAME', f1.partners[i].name, i);
    await selectF(page, 'RELATIONSHIP', f1.partners[i].rel, i);
    await fillF(page, 'FATHER / HUSBAND NAME', f1.partners[i].father, i);
    await fillF(page, 'AGE', f1.partners[i].age, i);
    await fillF(page, 'PERMANENT ADDRESS', f1.partners[i].address, i);
    await fillF(page, 'DATE OF JOINING', f1.partners[i].joining, i);
  }
  await downloadOrCapture(page, 'Generate Form No. 1', 'document-suite', 'Form_No_1');

  // 2c. Photo Form
  await btn(page, 'Photo Form');
  await page.waitForTimeout(300);
  const ph = fd.photoData;
  await fillF(page, 'FIRM NAME', ph.firm);
  await fillF(page, 'FIRM ADDRESS', ph.addr);
  for (let i = 0; i < f1.partners.length; i++) {
    await fillF(page, 'FULL NAME', f1.partners[i].name, i);
    await selectF(page, 'RELATIONSHIP', f1.partners[i].rel, i);
    await fillF(page, 'FATHER / HUSBAND NAME', f1.partners[i].father, i);
    await fillF(page, 'ADDRESS', f1.partners[i].address, i);
  }
  await downloadOrCapture(page, 'Generate Photo Form', 'document-suite', 'Photo_Form');
  await page.close();
}

// ─── 3. Doc Suite — Society ────────────────

async function genDocSuiteSociety(context) {
  console.log('\n📄 Doc Suite — Society...');
  const page = await context.newPage();
  const soc = DATA.documentSuite.society;
  await page.goto(`${BASE}/tools/document-suite`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(500);

  // Switch to Society tab
  await btn(page, 'Society Registration');
  await page.waitForTimeout(500);

  // Common data
  await fillF(page, 'SOCIETY NAME', soc.common.name);
  await fillF(page, 'SOCIETY OFFICE ADDRESS', soc.common.addr);
  await fillF(page, 'AIMS & OBJECTIVES', soc.common.aims);
  await fillF(page, 'AREA OF OPERATION', soc.common.area);
  await fillF(page, 'PLACE / STATION', soc.common.place);
  await fillF(page, 'DATE', soc.common.date);

  // Members — 7 members (3 extra default as Member)
  for (let i = 0; i < soc.members.length; i++) {
    await fillF(page, 'FULL NAME', soc.members[i].name, i);
    await selectF(page, 'RELATIONSHIP', soc.members[i].rel, i);
    await fillF(page, 'FATHER / HUSBAND / GUARDIAN', soc.members[i].father, i);
    await fillF(page, 'AGE', soc.members[i].age, i);
    await selectF(page, 'DESIGNATION', soc.members[i].desig, i);
    await fillF(page, 'ADDRESS', soc.members[i].addr, i);
  }

  // Cover Letter
  await btn(page, 'Cover Letter');
  await page.waitForTimeout(200);
  await downloadOrCapture(page, 'Generate Cover Letter', 'society', 'Cover_Letter');

  // Resolution
  await btn(page, 'Resolution');
  await page.waitForTimeout(200);
  await downloadOrCapture(page, 'Generate Resolution', 'society', 'Resolution');

  // MoA — fill witnesses first
  await btn(page, 'MoA');
  await page.waitForTimeout(200);
  for (let i = 0; i < soc.witnesses.length; i++) {
    await fillF(page, 'FULL NAME', soc.witnesses[i].name, i);
    await selectF(page, 'RELATIONSHIP', soc.witnesses[i].rel, i);
    await fillF(page, 'FATHER / HUSBAND NAME', soc.witnesses[i].father, i);
    await fillF(page, 'ADDRESS', soc.witnesses[i].addr, i);
  }
  await downloadOrCapture(page, 'Generate MoA', 'society', 'Memorandum_of_Association');

  // Affidavits
  await btn(page, 'Affidavits');
  await page.waitForTimeout(200);
  await fillF(page, 'OWNER FULL NAME', soc.owner.name);
  await selectF(page, 'RELATIONSHIP', soc.owner.rel);
  await fillF(page, 'FATHER / HUSBAND NAME', soc.owner.father);
  await fillF(page, 'AGE', soc.owner.age);
  await fillF(page, 'OWNER ADDRESS', soc.owner.addr);
  await fillF(page, 'RELATIONSHIP OF OWNER TO PRESIDENT', soc.owner.relToPres);
  await downloadOrCapture(page, 'Generate Affidavits', 'society', 'Affidavits');
  await page.close();
}

// ─── 4. ITR Assessment ─────────────────────

async function genITRAssessment(context) {
  console.log('\n📄 ITR Assessment...');
  const page = await context.newPage();
  const d = DATA.itrAssessment;
  await page.goto(`${BASE}/tools/itr-assessment`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(500);

  // Login
  await fillF(page, 'ASSOCIATE NAME', d.login.name);
  await fillF(page, 'EMPLOYEE ID', d.login.empId);
  await selectF(page, 'DEPARTMENT', d.login.dept);
  await selectF(page, 'CLIENT CATEGORY', d.login.clientType);
  await btn(page, 'Begin Assessment Session');
  await page.waitForTimeout(500);

  // Step 1 — Client Info
  await fillF(page, 'CLIENT FULL NAME', d.client.name);
  await fillF(page, 'PAN NUMBER', d.client.pan);
  await selectF(page, 'STATE', d.client.state);
  await selectF(page, 'ENTITY TYPE', d.client.entityType);
  await selectF(page, 'RESIDENTIAL STATUS', d.client.residentialStatus);
  await selectF(page, 'PRIOR YEAR ITR FILED', d.client.priorYear);
  await btn(page, 'Continue to Questionnaire');
  await page.waitForTimeout(500);

  // Step 2 — Answer questionnaire
  // Questions render in DOM order. Each has Yes / No buttons.
  // We iterate through the answers map and click the correct button
  // by matching on the badge prefix (first 8 chars of qid without "q_").
  for (const [qid, ans] of Object.entries(d.answers)) {
    const badge = qid.split('_').slice(1).join(' ').slice(0, 8).toLowerCase();
    const cards = page.locator('div.border.rounded-lg.p-4').filter({ hasText: badge });
    if (await cards.count() > 0) {
      const label = ans === 'yes' ? 'Yes' : 'No / N/A';
      const btns = cards.first().getByRole('button', { name: label });
      if (await btns.isVisible().catch(() => false)) {
        await btns.click();
        await page.waitForTimeout(80);
      }
    }
  }
  await page.waitForTimeout(400);
  await btn(page, 'Analyse & Determine ITR');
  await page.waitForTimeout(500);

  // Step 3 → 4 → 5
  await btn(page, 'Continue to Requirements');
  await page.waitForTimeout(300);
  await btn(page, 'View Dashboard');
  await page.waitForTimeout(500);

  // Download
  await downloadOrCapture(page, 'Download DOC Report', 'itr-assessment', 'ITR_Assessment_Report');
  await page.close();
}

// ─── 5. BDM Qualification ──────────────────

async function genBDMQualification(context) {
  console.log('\n📄 BDM Qualification...');
  const page = await context.newPage();
  const d = DATA.bdmQualification;
  await page.goto(`${BASE}/tools/bdm-qualification`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(500);

  // Client info bar
  await fillF(page, 'CLIENT / BUSINESS NAME', d.client.clientName);
  await fillF(page, 'BDM NAME', d.client.bdmName);
  await fillF(page, 'DATE', d.client.date);
  await fillF(page, 'LEAD SOURCE', d.client.leadSource);

  // Expand each module accordion and fill selects
  for (const mod of ['a', 'b', 'c', 'd', 'e']) {
    const hdr = page.locator('div.cursor-pointer').filter({ hasText: mod.toUpperCase() }).first();
    if (await hdr.isVisible().catch(() => false)) {
      await hdr.click();
      await page.waitForTimeout(200);
    }
    for (const [qid, answer] of Object.entries(d[mod])) {
      const sel = page.locator(`select[id="${qid}"]`);
      if (await sel.isVisible().catch(() => false)) {
        await sel.selectOption({ label: answer });
      }
    }
  }

  await btn(page, 'Generate Recommendation');
  await page.waitForTimeout(500);
  await downloadOrCapture(page, 'Download DOC Report', 'bdm-qualification', 'BDM_Qualification_Report');
  await page.close();
}

// ─── Download ───────────────────────────────

async function downloadOrCapture(page, buttonText, dir, name) {
  const d = join(OUT, dir);
  if (!existsSync(d)) await mkdir(d, { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const [dl] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }),
        page.getByRole('button', { name: buttonText }).click(),
      ]);
      await dl.saveAs(join(d, `${name}.doc`));
      console.log(`  ✓ ${name}.doc`);
      return;
    } catch {
      // Maybe it shows preview first — try clicking Download DOC after
      try {
        const [dl2] = await Promise.all([
          page.waitForEvent('download', { timeout: 8000 }),
          page.getByText('Download DOC').click(),
        ]);
        await dl2.saveAs(join(d, `${name}.doc`));
        console.log(`  ✓ ${name}.doc`);
        return;
      } catch {
        // fall through to next attempt
      }
    }
  }
  console.log(`  ✗ ${name}.doc — download failed`);
}

// ─── Main ───────────────────────────────────

async function main() {
  console.log('Starting Next.js dev server...');
  try { await startServer(); } catch (e) { console.error('Failed:', e.message); process.exit(1); }
  console.log(`Ready at ${BASE}`);

  const browser = await chromium.launch({ headless: true });
  try {
    await genPartnershipDeed(await browser.newContext());
    await genDocSuiteFirm(await browser.newContext());
    await genDocSuiteSociety(await browser.newContext());
    await genITRAssessment(await browser.newContext());
    await genBDMQualification(await browser.newContext());
    console.log('\n✅ Done — samples in samples/');
  } catch (e) {
    console.error('\n❌', e.message);
  } finally {
    await browser.close();
    stopServer();
  }
}

main();
