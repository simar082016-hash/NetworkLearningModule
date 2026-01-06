
import React from 'react';
import { Network, Globe, Lock, Mail, FileCode, Terminal, AlertCircle, Cloud, Server, Users, Key, Zap } from 'lucide-react';

const DebuggingStrategyView: React.FC = () => {
  const scenarios = [
    {
      title: "Platform Event Delivery Issues",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      desc: "Subscribers are not receiving events, or receiving them with high latency.",
      details: [
        "403 Forbidden: Daily delivery limit exceeded for the Salesforce org.",
        "ReplayID Mismatch: Subscriber is using an invalid or expired ReplayId (retention is only 24-72 hours).",
        "Apex Limits: Event Trigger failed due to DML limits or CPU timeouts in the subscriber logic."
      ],
      tools: [
        { name: "HAR Analyzer", reason: "Inspect the CometD handshake and 'long polling' response for error codes." },
        { name: "Identity Debugger", reason: "Ensure the integration user has 'Read' permission on the Platform Event object." }
      ]
    },
    {
      title: "Salesforce API Integration Failures",
      icon: <Cloud className="w-6 h-6 text-blue-400" />,
      desc: "API calls to Salesforce are failing with 401, 403, or 503 errors.",
      details: [
        "401 Unauthorized: Session ID expired or invalid OAuth token.",
        "403 Forbidden: IP restriction (Network Access) or Profile missing API Enabled permission.",
        "Unable to Lock Row: Record locking contention due to parallel updates on the same parent record."
      ],
      tools: [
        { name: "Identity Debugger", reason: "Decode the OAuth error response (invalid_grant)." },
        { name: "Log Analyzer", reason: "Check for 'Login History' failures or API Event logs." }
      ]
    },
    {
      title: "SSO Login Fails (SAML)",
      icon: <Key className="w-6 h-6 text-purple-400" />,
      desc: "Users get 'Single Sign-On Error' or redirected back to login loop.",
      details: [
        "Audience Mismatch: The Entity ID in IDP does not match SP.",
        "Clock Skew: Server times are out of sync (NotBefore / NotOnOrAfter).",
        "Signature: Certificate mismatch between IDP metadata and Salesforce config."
      ],
      tools: [
        { name: "Identity Debugger", reason: "Paste the base64 SAMLResponse to check Audience and Validity dates." },
        { name: "HAR Analyzer", reason: "Capture the redirect flow to grab the SAML payload." }
      ]
    },
    {
      title: "Email Deliverability (Spam/Bounce)",
      icon: <Mail className="w-6 h-6 text-orange-400" />,
      desc: "Emails sent from Salesforce/Marketing Cloud end up in Spam folders.",
      details: [
        "SPF Fail: The IP sending mail is not listed in your DNS TXT record.",
        "DKIM Fail: The cryptographic signature header was altered or key is missing.",
        "DMARC: Policy set to 'reject' causes bounces if SPF/DKIM fail."
      ],
      tools: [
        { name: "MxTool Simulator", reason: "Run a Blacklist check and verify TXT records." },
        { name: "Diagnostic Sim", reason: "Use nslookup to query current SPF records." }
      ]
    },
    {
      title: "Server-to-Server Mutual TLS (mTLS)",
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      desc: "Two-way SSL handshake fails between middleware and backend.",
      details: [
        "Certificate Untrusted: Client cert CA is not in the server's truststore.",
        "CN Mismatch: Certificate Subject doesn't match the hostname.",
        "Expired: Client certificate validity date has passed."
      ],
      tools: [
        { name: "Identity Debugger", reason: "Decode the PEM certificate to check chain and expiration." },
        { name: "PCAP Analyzer", reason: "Look for 'Certificate Request' and 'Certificate' messages in TLS Handshake." }
      ]
    },
    {
      title: "Website / Client Performance",
      icon: <FileCode className="w-6 h-6 text-pink-400" />,
      desc: "Pages load slowly, white screens, or frozen UI.",
      details: [
        "High TTFB: Server processing time is high (DB queries, Apex CPU).",
        "Large Payload: Downloading 5MB+ images or JS bundles.",
        "Render Blocking: Scripts pausing the DOM construction."
      ],
      tools: [
        { name: "HAR Analyzer", reason: "Waterfall analysis to find the longest bar (Waiting vs Content Download)." },
        { name: "ThousandEyes", reason: "Rule out ISP latency vs Server processing." }
      ]
    },
    {
      title: "General Network Connectivity",
      icon: <Network className="w-6 h-6 text-slate-400" />,
      desc: "Cannot reach a host, timeouts, or intermittent packet loss.",
      details: [
        "Firewall Drop: Packets sent but no ACK received (Retransmissions).",
        "Routing Loop: TTL Expired in Transit.",
        "DNS Failure: Cannot resolve hostname to IP."
      ],
      tools: [
        { name: "Ping & Traceroute", reason: "Isolate where traffic stops." },
        { name: "PingPlotter", reason: "Visualize where packet loss begins in the path." }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-yellow-400" />
            Advanced Debugging Strategy
          </h2>
          <p className="text-slate-400 mt-1">Scenario-based guide for Salesforce, Integrations, and Security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pb-6 custom-scroll">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 flex flex-col shadow-lg hover:shadow-xl hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-sm">
                {scenario.icon}
              </div>
              <div>
                  <h3 className="font-bold text-lg text-white leading-tight">{scenario.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{scenario.desc}</p>
              </div>
            </div>
            
            <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Common Root Causes</h4>
                <ul className="list-disc pl-5 space-y-1">
                    {scenario.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-sm text-slate-300">{detail}</li>
                    ))}
                </ul>
            </div>
            
            <div className="mt-auto pt-4 flex gap-3">
              {scenario.tools.map((tool, tIdx) => (
                <div key={tIdx} className="flex-1 bg-slate-900/50 rounded p-2 border border-slate-800">
                  <div className="text-xs font-bold text-blue-300 mb-0.5">{tool.name}</div>
                  <div className="text-[10px] text-slate-500 leading-snug">{tool.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Pro Tip Card */}
        <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 p-4 bg-slate-900 rounded-full border border-slate-700">
                <Terminal className="w-8 h-8 text-blue-400" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-white mb-2">The OSI Model Approach</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                    When in doubt, climb the stack. Start at <strong>Layer 1 (Physical)</strong>: Is it plugged in? Move to <strong>Layer 3 (Network)</strong>: Can I ping it? Check <strong>Layer 4 (Transport)</strong>: Is the port open (Telnet)? Finally, check <strong>Layer 7 (App)</strong>: HTTP 500 or OAuth errors. Don't debug API Auth if you can't even ping the server.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DebuggingStrategyView;
