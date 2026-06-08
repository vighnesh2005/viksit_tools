export const DATA = {
  partnershipDeed: {
    firm: {
      firmName: 'VIJAYA ICU AND MEDICAL SERVICES',
      bizType: 'Hospital / ICU Services',
      bizNature: 'Operating a multi-speciality hospital and intensive care unit providing medical, surgical, and emergency healthcare services to the general public.',
      placeOfBiz: 'Door No. 15-237, Main Road, Kurnool, Andhra Pradesh 518001',
      dateCommencement: '2025-04-01',
      placeExecution: 'Kurnool',
      capitalRate: '12',
    },
    partners: [
      { name: 'Dr. S. Venkata Reddy', rel: 'S/o', father: 'S. Ramaiah', age: '45', address: 'H.No. 3-127, RTC Colony, Kurnool - 518001', aadhar: '1234 5678 9012' },
      { name: 'Mrs. P. Sunitha Devi', rel: 'W/o', father: 'P. Raghava Rao', age: '38', address: 'H.No. 8-97, SBI Colony, Kurnool - 518002', aadhar: '3456 7890 1234' },
    ],
    profitInputs: [60, 40],
    workingIdxs: [0],
    bankMode: 'individual',
    loanAuth: 'same',
    remu: 'act',
    numWitnesses: '2',
    witnesses: [
      { name: 'K. Srinivasulu', co: 'S/o K. Venkatappa', address: '12-345, Gandhi Nagar, Kurnool - 518001', aadhar: '5678 9012 3456' },
      { name: 'M. Hari Babu', co: 'S/o M. Peddaiah', address: '7-89, RTC Bus Stand Road, Kurnool - 518003', aadhar: '7890 1234 5678' },
    ],
    affData: { officeAddr: 'Door No. 15-237, Main Road, Kurnool, Andhra Pradesh 518001', signDate: '2025-06-15', premises: 'owner', reg: 'yes' },
    f1Data: { presentedBy: 'Dr. S. Venkata Reddy', otherPlaces: 'Branch: Door No. 4-56, Nandyal Road', duration: 'At will', date: '2025-06-15' },
  },

  documentSuite: {
    firmDocs: {
      affData: {
        name: 'Dr. S. Venkata Reddy', rel: 'S/o', father: 'S. Ramaiah', age: '45',
        address: 'H.No. 3-127, RTC Colony, Kurnool - 518001',
        firm: 'VIJAYA ICU AND MEDICAL SERVICES', dateComm: '2025-04-01',
        officeAddr: 'Door No. 15-237, Main Road, Kurnool, Andhra Pradesh 518001',
        station: 'Kurnool', signDate: '2025-06-15', premises: 'owner', reg: 'yes',
        coPartners: ['Mrs. P. Sunitha Devi'],
      },
      form1Data: {
        firm: 'VIJAYA ICU AND MEDICAL SERVICES', presentedBy: 'Dr. S. Venkata Reddy',
        principalPlace: 'Door No. 15-237, Main Road, Kurnool',
        otherPlaces: 'Branch: Door No. 4-56, Nandyal Road',
        nature: 'Operating a multi-speciality hospital and intensive care unit providing medical, surgical, and emergency healthcare services.',
        duration: 'At will', station: 'Kurnool', date: '2025-06-15',
        partners: [
          { name: 'Dr. S. Venkata Reddy', rel: 'S/o', father: 'S. Ramaiah', age: '45', address: 'H.No. 3-127, RTC Colony, Kurnool - 518001', joining: '2025-04-01' },
          { name: 'Mrs. P. Sunitha Devi', rel: 'W/o', father: 'P. Raghava Rao', age: '38', address: 'H.No. 8-97, SBI Colony, Kurnool - 518002', joining: '2025-04-01' },
        ],
      },
      photoData: { firm: 'VIJAYA ICU AND MEDICAL SERVICES', addr: 'Door No. 15-237, Main Road, Kurnool' },
    },
    society: {
      common: {
        name: 'LAKSHMI NARASIMHA SOCIAL SERVICE SOCIETY',
        addr: 'H.No. 6-89, Temple Street, Kurnool, Andhra Pradesh - 518001',
        aims: 'To promote education among rural and underprivileged children through scholarship programs.\nTo organise health awareness camps and free medical check-up drives in remote villages.\nTo support environmental conservation through tree plantation and awareness programs.\nTo assist elderly and differently-abled persons with basic necessities and financial aid.',
        area: 'Kurnool District, Andhra Pradesh',
        place: 'Kurnool',
        date: '2025-06-15',
        admissionFee: '100',
        monthlySub: '10',
      },
      members: [
        { name: 'Sri. K. Narasimha Rao', rel: 'S/o', father: 'K. Venkata Subbaiah', age: '52', addr: 'H.No. 5-23, Gandhi Nagar, Kurnool - 518001', desig: 'President' },
        { name: 'Sri. P. Raghava Reddy', rel: 'S/o', father: 'P. Pedda Reddy', age: '48', addr: 'H.No. 12-45, RTC Colony, Kurnool - 518002', desig: 'Vice President' },
        { name: 'Sri. M. Srinivasulu', rel: 'S/o', father: 'M. Venkatappa', age: '42', addr: 'H.No. 8-97, SBI Colony, Kurnool - 518003', desig: 'Secretary' },
        { name: 'Sri. T. Ramesh Babu', rel: 'S/o', father: 'T. Subba Rao', age: '40', addr: 'H.No. 3-67, Bhavani Nagar, Kurnool - 518004', desig: 'Treasurer' },
        { name: 'Smt. L. Anitha', rel: 'W/o', father: 'L. Naga Raju', age: '36', addr: 'H.No. 15-78, Patel Nagar, Kurnool - 518001', desig: 'Member' },
        { name: 'Sri. G. Venkateswarlu', rel: 'S/o', father: 'G. Pedda Krishna', age: '44', addr: 'H.No. 9-34, Ashok Nagar, Kurnool - 518002', desig: 'Member' },
        { name: 'Smt. B. Radha', rel: 'W/o', father: 'B. Chandra Sekhar', age: '39', addr: 'H.No. 21-67, Ram Nagar, Kurnool - 518003', desig: 'Member' },
      ],
      witnesses: [
        { name: 'K. Sudhakar', rel: 'S/o', father: 'K. Narasaiah', addr: 'H.No. 1-234, Venkateswara Colony, Kurnool - 518001' },
        { name: 'M. Naga Raju', rel: 'S/o', father: 'M. Pedda Kondaiah', addr: 'H.No. 4-56, RTC Bus Stand Road, Kurnool - 518002' },
      ],
      owner: { name: 'Smt. K. Lakshmi Devi', rel: 'W/o', father: 'K. Narasimha Rao', age: '48', addr: 'H.No. 5-23, Gandhi Nagar, Kurnool - 518001', relToPres: 'Wife' },
    },
  },

  itrAssessment: {
    login: { name: 'P. Ravi Kumar', empId: 'EMP-2025-0087', dept: 'P2 — Tax & Compliance', clientType: 'new' },
    client: {
      name: 'Sri. M. Venkata Rama Reddy', pan: 'ABCDT1234K', state: 'Andhra Pradesh',
      entityType: 'Individual', residentialStatus: 'Resident (ROR)', priorYear: 'Yes — Filed on time',
    },
    answers: {
      q_salary: 'yes', q_salary_multi: 'yes', q_salary_arrears: 'yes',
      q_pension: 'no',
      q_property_own: 'yes', q_property_letout: 'yes', q_property_homeloan: 'yes',
      q_cg: 'yes', q_cg_equity: 'yes', q_cg_property: 'yes', q_cg_crypto: 'no', q_cg_fo: 'no',
      q_business: 'yes', q_business_partner: 'no',
      q_interest: 'yes', q_dividend: 'no', q_lottery: 'no', q_gift: 'no',
      q_foreign_income: 'no', q_foreign_asset: 'no',
      q_agri: 'yes', q_agri_above_5k: 'yes',
      q_it_notice: 'no', q_high_cash: 'no',
    },
  },

  bdmQualification: {
    client: { clientName: 'Ravi Enterprises', bdmName: 'P. Ravi Kumar', date: '15/06/2025', leadSource: 'Referral - ICICI Bank RM' },
    a: { a1: '₹5 Cr – ₹25 Cr', a2: '3-5 accounts', a3: '100-300', a4: 'Multiple facilities', a5: '2-3 locations' },
    b: { b1: 'Minor delays', b2: 'Yes – on time', b3: 'Yes – all filed', b4: 'No – clean record', b5: 'In process' },
    c: { c1: 'Tally/Busy (current)', c2: 'Monthly', c3: 'Yes – basic P&L only', c4: 'Part-time accountant', c5: 'Yes – separate' },
    d: { d1: 'Manufacturing', d2: 'No imports or exports', d3: '11-50 employees', d4: 'Family-managed (HUF/partnership)', d5: 'Occasional tightness' },
    e: { e1: 'Yes – bank/NBFC loan', e2: 'Active expansion planned', e3: 'Yes – monthly preferred', e4: 'No MIS/visibility', e5: '₹5,000-₹15,000' },
  },
};
