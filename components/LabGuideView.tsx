
import React, { useState } from 'react';
import { BookOpen, Activity, Terminal, Globe, Search, Lock, PlayCircle, Clock, Eye, FileCode, Key, FileText, Server, X, Zap, ArrowRightLeft, Target, GitCompare, Cloud } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { ViewMode } from '../types';

interface Props {
  onNavigate?: (mode: ViewMode) => void;
}

const LabGuideView: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'STRATEGY' | 'COMPARISON' | 'CDN_VAL' | 'PING' | 'TRACEROUTE' | 'PCAP' | 'HAR' | 'IDENTITY' | 'SSL' | 'DNS' | 'PLATFORM_EVENTS'>('STRATEGY');
  const [searchQuery, setSearchQuery] = useState('');

  const content = {
      STRATEGY: `
# Master Troubleshooting Decision Matrix

When an incident occurs, speed of isolation is everything. Follow this tiered approach to determine which tool to launch first.

### Scenario A: "It's slow" or "It's down" (Connectivity & Network Layer)
**Symptoms:** Request Timeouts, Connection Refused, Intermittent Drops.
1.  **Is it just me?** Run **MTR**. If the path stops at your local gateway, check your router.
2.  **Is it the ISP?** Run **PingPlotter**. Look for a specific hop in the middle of the path that has high latency or packet loss that persists to the destination.
3.  **Is it a global outage?** Run **ThousandEyes**. Check if the site is down from NY, London, and Tokyo simultaneously.

### Scenario B: "The API is failing" (Integration & API Layer)
**Symptoms:** 401 Unauthorized, 500 Internal Server Error, Missing JSON data.
1.  **What's the status?** Run **HAR Analyzer**. Inspect the "Waterfall" to see if the delay is TTFB (Server side) or Content Download (Network side).
2.  **Is it Auth?** Run **Identity Debugger**. Decode the SAML or OAuth token. 90% of "Network Errors" in APIs are actually expired sessions or missing scopes.
3.  **Is it the Gateway?** If the HAR shows a 504 Timeout, move to **ThousandEyes Path Visualization** to see if the request reached the Edge.

### Scenario C: "Edge Gateway & Custom Domain Issues"
**Symptoms:** 504 Timeouts, "Invalid SSL" on custom domain, 403 Forbidden at Edge.
1.  **Check Propagation:** Use **CDN Checker**. Verify the CNAME is correctly pointing to the CDN provider.
2.  **Check Headers:** Inspect the **X-Cache** and **Via** headers. If they are missing, your domain is hitting the origin directly.
3.  **Check SSL:** Use **SSL Shopper** to ensure the Edge Certificate covers your custom domain name (SAN).
      `,
      CDN_VAL: `
# Validating Custom Domains & CDNs

Testing a custom domain requires verifying that traffic is successfully being "Intercepted" by your CDN (Akamai, CloudFront, Cloudflare, etc.).

### Step 1: DNS Validation (The CNAME Check)
Use the command \`dig mydomain.com\` or \`nslookup\`.
- **Success:** You see a CNAME record pointing to a CDN domain (e.g. \`d123.cloudfront.net\`).
- **Failure:** You see an A record pointing directly to your backend IP. Traffic is bypassing the CDN.

### Step 2: HTTP Header Validation
Run \`curl -I https://mydomain.com\`. Look for these signatures:
- **Cloudflare:** \`cf-ray: ...\`, \`cf-cache-status: HIT\`
- **Akamai:** \`X-Cache: TCP_HIT from ...\`, \`X-Akamai-Request-ID\`
- **CloudFront:** \`X-Cache: Hit from cloudfront\`, \`X-Amz-Cf-Id\`

### Step 3: SSL Handshake at the Edge
If your custom domain shows a "Your connection is not private" error:
1.  Check if the CDN's **Edge Certificate** includes your domain in its **SAN (Subject Alternative Name)** list.
2.  Ensure you have uploaded the **Intermediate CA** if using a private cert.
3.  Check for **SNI (Server Name Indication)** support.

### Common Issue: The 504 Timeout
If you get a 504 from a CDN, it means the **CDN reached your origin**, but the origin didn't reply within the (usually) 30-second timeout. This is usually an **App Server / Database bottleneck**, not a network issue.
      `,
      COMPARISON: `
# Tool Comparisons: Which one when?

Understanding the subtle differences prevents "Tool Blindness."

| Feature | MTR / Traceroute | PingPlotter | ThousandEyes |
| :--- | :--- | :--- | :--- |
| **Primary Goal** | Real-time path discovery | Historical latency trends | Global path visualization |
| **Best For** | Identifying a dead hop | Spotting intermittent lag | Monitoring Edge Gateways |
| **Limitation** | ICMP can be rate-limited | Local view only | Requires global agents |

| Feature | HAR Analyzer (L7) | Wireshark / PCAP (L4) | CDN Checker |
| :--- | :--- | :--- | :--- |
| **Visibility** | HTTP Headers, JSON | Raw Bytes, Handshakes | DNS & Edge Headers |
| **Best For** | API Logic | TCP Windowing | Domain Validation |
      `,
      PING: `
# PingPlotter: Identifying Packet Loss Patterns

**PingPlotter** visualizes ICMP Echo Requests over time. It is the gold standard for "Blame the ISP" conversations.

### Strategic Debugging:
- **Vertical Red Bars:** Indicate 100% loss. If these bars line up across ALL hops starting from hop 1, the user's local router/WiFi is the problem.
- **Pattern Recognition:** "Zig-zag" latency patterns often indicate a router's CPU is saturated (bufferbloat).
      `,
      TRACEROUTE: `
# ThousandEyes & MTR (Path Intelligence)

While Ping tells you "if" it's up, **ThousandEyes/MTR** tell you "where" it's failing.

### Troubleshooting Gateway Timeouts:
1.  Run a ThousandEyes Path Visualization.
2.  If the path stops at an ISP node (e.g., Level3 or Cogent), the issue is a **BGP Route Leak** or ISP outage.
3.  If the path reaches the Edge Gateway but the "HTTP Load Time" is high, the gateway is likely healthy, but the **Backend Origin** is slow.
      `,
      PLATFORM_EVENTS: `
# Platform Events & Event Bus (CometD)

**Platform Events** use a Pub/Sub model. This is different from standard REST APIs because it is asynchronous.

### Strategic Debugging:
1.  **Subscriber Lag:** Use the **Event Monitor** to see if events are actually being published. 
2.  **CometD Handshake:** If the handshake fails, check the **Identity Debugger**. The user might have the correct login but lacks the "Streaming API" permission.
      `,
      PCAP: `
# Wireshark: The Ultimate Truth (PCAP)

**PCAP (Packet Capture)** is for when L7 logs (HAR) aren't enough. It's the only way to see what's happening *inside* the TCP session.

### Use Cases:
- **TCP Window Zero:** The server says "Stop sending data, I'm full!" This is an application-level bottleneck.
- **mTLS Failures:** When the browser doesn't even show an error code, just "Connection Closed." Wireshark shows if the server rejected the client certificate.
      `,
      HAR: `
# HAR Analyzer: Performance & Redirects

**HAR (HTTP Archive)** is the best tool for **Frontend vs Backend** isolation.

### The "Strategic Split":
- **Waiting (TTFB):** The server is thinking. Investigate Apex Code, SQL queries, or CPU limits.
- **Content Download:** The pipe is narrow. Investigate Image sizes, JS bundle sizes, or CDN caching.
      `,
      IDENTITY: `
# Identity Debugger (SAML/OAuth)

Auth is often the "hidden" network killer. A slow LDAP/AD server can cause what looks like a network timeout.

### Strategic Debugging:
1.  **Assertion Analysis:** Paste the SAML to check the **NotOnOrAfter** field. If the user's computer clock is 5 minutes fast, they can't log in.
      `,
      SSL: `
# SSL Shopper: Trust & Encryption

SSL is the "Gatekeeper." If the handshake fails, no other tool matters.

### Use Case:
- **Intermittent Mobile Failures:** Often caused by a "Missing Intermediate Certificate." Desktop browsers often "help" by finding the intermediate, but mobile devices are strict and will just fail the connection.
      `,
      DNS: `
# DNS & MX: The Phonebook of the Internet

If DNS fails, the target "doesn't exist." Use **MxToolbox** to see the "Current" propagation across global servers.
      `
  };

  const tutorials = {
    STRATEGY: [
        { id: 1, title: "Troubleshooting Edge Gateways", duration: "10:45", views: "25k", thumbColor: "bg-blue-600", tool: ViewMode.LAB_GUIDE },
        { id: 2, title: "L1 to L7 Diagnosis Flow", duration: "14:20", views: "41k", thumbColor: "bg-indigo-600", tool: ViewMode.DEBUGGING_GUIDE }
    ],
    COMPARISON: [
        { id: 1, title: "MTR vs PingPlotter vs ThousandEyes", duration: "08:15", views: "15k", thumbColor: "bg-slate-700", tool: ViewMode.LAB_GUIDE },
        { id: 2, title: "HAR vs PCAP: The Layer 4/7 Split", duration: "06:30", views: "12k", thumbColor: "bg-slate-600", tool: ViewMode.LAB_GUIDE }
    ],
    CDN_VAL: [
        { id: 1, title: "Validating CNAME Records", duration: "05:40", views: "18k", thumbColor: "bg-blue-500", tool: ViewMode.CDN_CHECKER },
        { id: 2, title: "Interpreting X-Cache Headers", duration: "04:15", views: "9k", thumbColor: "bg-blue-400", tool: ViewMode.CDN_CHECKER }
    ],
    PING: [
      { id: 1, title: "PingPlotter: Identifying Packet Loss Patterns", duration: "05:12", views: "12k", thumbColor: "bg-orange-500", tool: ViewMode.PINGPLOTTER }
    ],
    TRACEROUTE: [
      { id: 1, title: "ThousandEyes: Path Visualization", duration: "08:20", views: "42k", thumbColor: "bg-green-500", tool: ViewMode.THOUSANDEYES }
    ],
    PLATFORM_EVENTS: [
        { id: 1, title: "Salesforce Pub/Sub API Mechanics", duration: "09:45", views: "18k", thumbColor: "bg-yellow-500", tool: ViewMode.PLATFORM_EVENTS }
    ],
    PCAP: [
      { id: 1, title: "Wireshark 101: TCP Filters", duration: "10:15", views: "88k", thumbColor: "bg-blue-600", tool: ViewMode.WIRESHARK }
    ],
    HAR: [
      { id: 1, title: "Chrome DevTools: Waterfall Analysis", duration: "07:45", views: "15k", thumbColor: "bg-pink-600", tool: ViewMode.HAR_ANALYZER }
    ],
    IDENTITY: [
      { id: 1, title: "Debugging SAML Assertions", duration: "09:10", views: "22k", thumbColor: "bg-purple-500", tool: ViewMode.IDENTITY_DEBUGGER }
    ],
    SSL: [
      { id: 1, title: "Fixing Chain Incomplete Errors", duration: "06:15", views: "21k", thumbColor: "bg-emerald-500", tool: ViewMode.SSLSHOPPER }
    ],
    DNS: [
      { id: 1, title: "Troubleshooting DNS Propagation", duration: "03:20", views: "3k", thumbColor: "bg-blue-600", tool: ViewMode.MXTOOL }
    ]
  };

  const menuItems = [
      { id: 'STRATEGY', label: 'Decision Matrix', icon: Target, color: 'indigo', tool: ViewMode.LAB_GUIDE },
      { id: 'COMPARISON', label: 'Tool Comparisons', icon: GitCompare, color: 'slate', tool: ViewMode.LAB_GUIDE },
      { id: 'CDN_VAL', label: 'CDN Validation', icon: Cloud, color: 'blue', tool: ViewMode.CDN_CHECKER },
      { id: 'PING', label: 'PingPlotter', icon: Activity, color: 'orange', tool: ViewMode.PINGPLOTTER },
      { id: 'TRACEROUTE', label: 'ThousandEyes', icon: Globe, color: 'green', tool: ViewMode.THOUSANDEYES },
      { id: 'PLATFORM_EVENTS', label: 'Event Monitoring', icon: Zap, color: 'yellow', tool: ViewMode.PLATFORM_EVENTS },
      { id: 'PCAP', label: 'Wireshark (PCAP)', icon: FileText, color: 'blue', tool: ViewMode.WIRESHARK },
      { id: 'HAR', label: 'HAR Analyzer', icon: FileCode, color: 'pink', tool: ViewMode.HAR_ANALYZER },
      { id: 'IDENTITY', label: 'Identity Debug', icon: Key, color: 'purple', tool: ViewMode.IDENTITY_DEBUGGER },
      { id: 'SSL', label: 'SSL Shopper', icon: Lock, color: 'emerald', tool: ViewMode.SSLSHOPPER },
      { id: 'DNS', label: 'MxToolbox', icon: Search, color: 'orange', tool: ViewMode.MXTOOL },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTool = menuItems.find(m => m.id === activeTab)?.tool;

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-blue-400" />
            Strategic Lab Guide
          </h2>
          <p className="text-slate-400 mt-1">Industrial-level reference for tool selection and isolation strategies.</p>
        </div>
        {activeTool && !['STRATEGY', 'COMPARISON'].includes(activeTab) && (
            <button 
                onClick={() => onNavigate?.(activeTool)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
            >
                <Terminal className="w-4 h-4" /> Launch Interactive Tool
            </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
          <div className="lg:w-64 flex-shrink-0 bg-slate-800/30 p-2 rounded-lg border border-slate-700/50 h-fit space-y-3">
              <div className="relative px-2 pt-2">
                  <Search className="w-4 h-4 text-slate-500 absolute left-5 top-4" />
                  <input 
                    type="text" 
                    placeholder="Search guide..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 text-sm text-slate-200 pl-9 pr-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
              </div>
              
              <div className="space-y-1">
                  {filteredMenu.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all border
                        ${activeTab === item.id 
                            ? `bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-md` 
                            : 'text-slate-400 border-transparent hover:bg-slate-800'}`}
                    >
                        <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`} /> 
                        <span className="font-semibold text-xs">{item.label}</span>
                    </button>
                  ))}
              </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="flex-1 glass-panel rounded-lg p-8 overflow-y-auto custom-scroll relative">
                  {activeTab === 'STRATEGY' && (
                      <div className="absolute top-8 right-8 pointer-events-none opacity-5">
                          <Target className="w-64 h-64" />
                      </div>
                  )}
                  <div className="prose prose-invert max-w-none">
                      <MarkdownRenderer content={content[activeTab] || 'Content not found.'} />
                  </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg flex-shrink-0">
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <PlayCircle className="w-4 h-4 text-indigo-400" /> Training Modules for {activeTab.replace('_', ' ')}
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(tutorials[activeTab] || []).map(video => (
                        <div 
                            key={video.id} 
                            onClick={() => video.tool && onNavigate?.(video.tool)}
                            className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex gap-3 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
                        >
                            <div className={`w-24 h-16 ${video.thumbColor} rounded flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/20"></div>
                                <PlayCircle className="text-white w-8 h-8 opacity-80 z-10" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-slate-200 text-xs line-clamp-2 leading-tight">{video.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                                    <span className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded"><Clock className="w-3 h-3" /> {video.duration}</span>
                                    <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Practice Live</span>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default LabGuideView;
