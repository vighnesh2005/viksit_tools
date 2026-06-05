export interface Partner {
  name: string; rel: string; father: string; age: string;
  address: string; aadhar: string; profit: number;
}
export interface Witness {
  name: string; co: string; address: string; aadhar: string;
}
export interface FirmDetails {
  firmName: string; bizType: string; bizNature: string;
  placeOfBiz: string; dateCommencement: string;
  placeExecution: string; capitalRate: string;
}
export interface BDMInfo {
  clientName: string; bdmName: string; date: string; leadSource: string;
}
export interface ModuleScore { score: number; answered: number; total: number; }
export interface PackageData {
  name: string; colorClass: string; price: string; ideal: string;
  services: string[]; deliverables: string[]; addons: string[];
}
export interface FlagItem { type: 'risk' | 'warn' | 'opp'; icon: string; text: string; }
export interface RequirementItem { icon: string; text: string; note: string; }
export interface SocietyMember {
  name: string; rel: string; father: string; age: string;
  addr: string; desig: string;
}
export interface SocietyWitness {
  name: string; rel: string; father: string; addr: string;
}
export interface CoPartner { name: string; }
export interface Form1Partner {
  name: string; rel: string; father: string; age: string;
  address: string; joining: string;
}
export interface PhotoEntry {
  name: string; rel: string; father: string; address: string;
}
export interface ITRQuestion {
  id: string; group: string; label: string; type: 'yesno' | 'select';
  options?: string[]; parent?: string; parentVal?: string; flag?: string;
}
export interface ITRState {
  associate: { name: string; empId: string; dept: string; clientType: string; };
  sessionDT: string; client: Record<string, string>;
  answers: Record<string, string>; incomeHeads: string[];
  riskFlags: string[]; escalationFlags: string[];
  itrDetermined: string | null; itrReason: string;
  filingReadiness: number; riskScore: number;
}
