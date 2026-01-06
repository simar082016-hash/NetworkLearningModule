
import { Module, CaseStudy } from './types';

// Moved MOCK_LOGS above CASE_STUDIES to avoid block-scoped variable usage before declaration error.
export const MOCK_LOGS = `No.     Time           Source                Destination           Protocol Length Info
      1 0.000000       192.168.1.105         203.0.113.5           TCP      66     54322 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256 SACK_PERM
      2 0.024100       203.0.113.5           192.168.1.105         TCP      66     443 → 54322 [SYN, ACK] Seq=0 Ack=1 Win=29200 Len=0 MSS=1412 SACK_PERM
      3 0.024200       192.168.1.105         203.0.113.5           TCP      54     54322 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0
      4 0.250000       192.168.1.105         203.0.113.5           TCP      54     [TCP Retransmission] 54322 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0
      5 5.000000       192.168.1.105         203.0.113.5           TCP      54     [TCP Spurious Retransmission] 54322 → 443 [ACK] Seq=1 Ack=1 Win=64240`;

export const MODULES: Module[] = [
  {
    id: 'salesforce-net',
    title: 'Salesforce Networking',
    description: 'Cloud connectivity, Hyperforce, and API limits.',
    difficulty: 'Expert',
    topics: [
      'Salesforce Edge Network',
      'Express Connect & Private Connect',
      'Hyperforce Architecture',
      'Mutual TLS (mTLS) & Certificates',
      'API Limits & Latency Optimization',
      'Domain Management & CDNs',
      'IP Allowlisting vs. mTLS'
    ],
  },
  {
    id: 'sf-platform-events',
    title: 'Salesforce Platform Events',
    description: 'Event-driven architecture, Pub/Sub, and real-time integration.',
    difficulty: 'Expert',
    topics: [
      'Platform Events vs. PushTopic vs. CDC',
      'Event Bus Architecture & Pub/Sub',
      'CometD & Bayeux Protocol Mechanics',
      'Publishing Events (Apex, Flow, Pub/Sub API)',
      'Subscribing: Triggers vs. Flow vs. LWC',
      'Replaying Events & Event IDs (ReplayId)',
      'Event Limits & High Volume Events',
      'Troubleshooting: Event Publishing Failures'
    ],
  },
  {
    id: 'sf-troubleshooting',
    title: 'SFDC Connectivity & Troubleshooting',
    description: 'Diagnose lag, packet loss, and connection errors.',
    difficulty: 'Intermediate',
    topics: [
      'Ping & Traceroute Analysis',
      'Interpreting Pathping & MTR',
      'Diagnosing Packet Loss & Latency',
      'Isolating ISP vs. Salesforce Issues',
      'TCP Windowing & Throughput',
      'Analyzing Keep-Alive & Timeouts'
    ],
  },
  {
    id: 'cisco-net',
    title: 'Cisco Networking',
    description: 'Industry standard routing, switching, and security.',
    difficulty: 'Intermediate',
    topics: [
      'IOS/IOS-XE Fundamentals',
      'VLANs, Trunks & STP (802.1Q)',
      'OSPF & EIGRP Routing',
      'BGP & MPLS Concepts',
      'Cisco DNA Center & SD-Access',
      'Access Control Lists (ACLs)',
      'NAT/PAT Configuration'
    ],
  },
  {
    id: 'cilax-net',
    title: 'Cilax / ISP Networking',
    description: 'Specialized broadband and access network architectures.',
    difficulty: 'Expert',
    topics: [
      'GPON & XGS-PON Architectures',
      'Access Network Design',
      'Subscriber Management (BNG)',
      'Optical Line Terminals (OLT)',
      'Service Provider QoS',
      'VLAN Stacking (QinQ)',
      'Multicast for IPTV'
    ],
  },
  {
    id: 'net-tools',
    title: 'Networking Tools',
    description: 'Mastering Wireshark, Fiddler, PingPlotter & ThousandEyes.',
    difficulty: 'Beginner',
    topics: [
      'Wireshark: Filters & Color Rules',
      'Wireshark: Identifying Packet Loss',
      'PingPlotter: Interpreting Visual Traces',
      'PingPlotter: Pattern Recognition (Jitter vs Loss)',
      'ThousandEyes: Cloud Agents & Enterprise Agents',
      'ThousandEyes: Path Visualization',
      'CMD: Ping, Tracert & Pathping',
      'Fiddler: HTTP/HTTPS Decryption'
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Advanced Diagnostics',
    description: 'Methodical approaches to complex outages.',
    difficulty: 'Expert',
    topics: [
        'Deep Packet Inspection', 
        'TCP Retransmissions & Windowing', 
        'Digital Experience Monitoring (DEM)',
        'BGP Route Leaks & Hijacks',
        'Performance Tuning'
    ],
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-05',
    title: 'CloudSec: FortiGate / Geneve Flow Verification',
    industry: 'Cloud Infrastructure',
    description: 'An AWS application is failing to reach an external API. Engineers suspect the FortiGate firewall in the Hub VPC is dropping Geneve-encapsulated traffic. Analyze the raw sniffer output to confirm flow health.',
    evidenceType: 'PCAP',
    evidenceData: `ABHFLAWSFGFW-01 # diagnose sniffer packet any 'host 10.21.242.183' 4 0 a -t
2025-12-28 12:17:33.464529 awsgeneve2 in 10.21.242.183.34014 -> 141.163.216.236.443: syn 3743157486
2025-12-28 12:17:33.464599 awsgeneve2 out 10.21.242.183.34014 -> 141.163.216.236.443: syn 3743157486
2025-12-28 12:17:33.480114 awsgeneve2 in 141.163.216.236.443 -> 10.21.242.183.34014: syn 3792241983 ack 3743157487
2025-12-28 12:17:33.481399 awsgeneve2 in 10.21.242.183.34014 -> 141.163.216.236.443: ack 3792241984
2025-12-28 12:17:33.488606 awsgeneve2 in 10.21.242.183.34014 -> 141.163.216.236.443: psh 3743157487 ack 3792241984
2025-12-28 12:17:33.623217 awsgeneve2 in 10.21.242.183.34014 -> 141.163.216.236.443: fin 3743`,
    conceptLink: 'Fortinet Packet Sniffing'
  },
  {
    id: 'cs-04',
    title: 'FinTech: High-Velocity Transaction Monitoring',
    industry: 'FinTech',
    description: 'A credit processing system uses Platform Events to trigger real-time alerts. Suddenly, alerts stop appearing for a subset of transactions. The logs show a CometD handshake failure.',
    evidenceType: 'HAR',
    evidenceData: JSON.stringify({
      log: {
        entries: [
          { startedDateTime: '2025-05-10T14:30:00Z', time: 100, request: { url: 'https://fintech.my.salesforce.com/cometd/58.0', method: 'POST' }, response: { status: 403, content: { text: '{"channel":"/meta/handshake","error":"403::Organization is over its event limit","successful":false}' } } }
        ]
      }
    }),
    conceptLink: 'Platform Event Limits'
  },
  {
    id: 'cs-01',
    title: 'Retail: Peak Season Checkout Latency',
    industry: 'E-commerce',
    description: 'During a Black Friday sale, users report that clicking "Place Order" spins for 10+ seconds. Is it the network, the database, or a 3rd party script?',
    evidenceType: 'HAR',
    evidenceData: JSON.stringify({
      log: {
        entries: [
          { startedDateTime: '2025-11-28T09:00:00Z', time: 150, request: { url: 'https://cdn.retail.com/main.js', method: 'GET' }, response: { status: 200, content: { size: 500000, mimeType: 'application/javascript' } } },
          { startedDateTime: '2025-11-28T09:00:01Z', time: 12000, request: { url: 'https://api.retail.com/v1/checkout', method: 'POST' }, response: { status: 200, content: { size: 1024, mimeType: 'application/json' } } },
          { startedDateTime: '2025-11-28T09:00:02Z', time: 45, request: { url: 'https://analytics.tracker.com/track', method: 'POST' }, response: { status: 200, content: { size: 100, mimeType: 'image/gif' } } }
        ]
      }
    }),
    conceptLink: 'Waterfall Analysis'
  },
  {
    id: 'cs-02',
    title: 'FinServ: Identity Provider Migration Outage',
    industry: 'Banking',
    description: 'After migrating to a new IDP, 30% of employees are unable to access internal apps. Errors indicate "Single Sign-On Failed".',
    evidenceType: 'SAML',
    evidenceData: `<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
      <saml2:Issuer>https://new-idp.banking.com</saml2:Issuer>
      <saml2:Conditions NotBefore="2025-01-01T08:00:00Z" NotOnOrAfter="2025-01-01T08:05:00Z">
        <saml2:AudienceRestriction>
          <saml2:Audience>https://old-app.internal.com</saml2:Audience>
        </saml2:AudienceRestriction>
      </saml2:Conditions>
    </saml2p:Response>`,
    conceptLink: 'SAML Audience Mismatch'
  },
  {
    id: 'cs-03',
    title: 'Logistics: Warehouse TCP Retransmission Loop',
    industry: 'Logistics',
    description: 'Handheld scanners in the warehouse are dropping connections every 5 minutes. Initial logs show "Connection Reset".',
    evidenceType: 'PCAP',
    evidenceData: MOCK_LOGS + `\n6 6.000000 192.168.1.105 203.0.113.5 TCP 54 [TCP Retransmission] Seq=1 Win=0`,
    conceptLink: 'TCP Window Zero & Retransmissions'
  }
];
