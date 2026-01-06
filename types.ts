
export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  topology: string;
  issue: string;
  solution_steps: string[];
  logs?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  industry: string;
  description: string;
  evidenceType: 'HAR' | 'SAML' | 'PCAP' | 'PING';
  evidenceData: string;
  conceptLink: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum ViewMode {
  LEARN = 'LEARN',
  WORKSHOP = 'WORKSHOP',
  ANALYZER = 'ANALYZER',
  SIMULATOR = 'SIMULATOR',
  PINGPLOTTER = 'PINGPLOTTER',
  THOUSANDEYES = 'THOUSANDEYES',
  MXTOOL = 'MXTOOL',
  SSLSHOPPER = 'SSLSHOPPER',
  HAR_ANALYZER = 'HAR_ANALYZER',
  IDENTITY_DEBUGGER = 'IDENTITY_DEBUGGER',
  LAB_GUIDE = 'LAB_GUIDE',
  DEBUGGING_GUIDE = 'DEBUGGING_GUIDE',
  AUDIT_LOG = 'AUDIT_LOG',
  USE_CASES = 'USE_CASES',
  PLATFORM_EVENTS = 'PLATFORM_EVENTS',
  MTR = 'MTR',
  WIRESHARK = 'WIRESHARK',
  CDN_CHECKER = 'CDN_CHECKER',
  DNS_MANAGER = 'DNS_MANAGER',
}

export interface DNSRecord {
  id: string;
  type: 'A' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl: number;
  status: 'Propagated' | 'Pending';
}

export interface AuditLog {
  id: string;
  timestamp: number;
  user: {
    name: string;
    color: string;
  };
  action: string;
  details: string;
  type: 'CHANGE' | 'SECURITY' | 'DIAGNOSTIC' | 'SYSTEM';
}

export interface CertDetails {
  commonName: string;
  sans: string[];
  organization: string;
  organizationUnit: string;
  locality: string;
  state: string;
  country: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
}

export interface Packet {
  no: number;
  time: number;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
  details: {
    ethernet: string;
    ip: string;
    transport: string;
    application?: string;
  };
  bytes: string;
}

export interface AnalysisResult {
  summary: string;
  potentialIssues: string[];
  recommendations: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  certDetails?: CertDetails;
  packets?: Packet[];
}

export interface MxRecord {
  pref: number;
  hostname: string;
  ip: string;
  ttl: string;
}

export interface BlacklistResult {
  server: string;
  status: 'OK' | 'LISTED' | 'TIMEOUT';
}

export interface SSLCheckResult {
  commonName: string;
  issuer: string;
  daysLeft: number;
  validFrom: string;
  validTo: string;
  chain: {
    name: string;
    status: 'Valid' | 'Invalid' | 'Expired';
  }[];
}

export interface HAREntrySummary {
  url: string;
  method: string;
  status: number;
  time: number;
  size: number;
  mimeType: string;
  start: number;
}
