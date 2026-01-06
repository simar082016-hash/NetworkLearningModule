
import React, { useState } from 'react';
import { simulateCDNCheck, CDNCheckResult } from '../services/geminiService';
import { AuditLog, DNSRecord } from '../types';
import { Cloud, Search, Globe, Shield, Activity, Info, CheckCircle, AlertTriangle, Terminal, List, BarChart3 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  customRecords?: DNSRecord[];
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

const CDNChecker: React.FC<Props> = ({ onAction, customRecords }) => {
  const [domain, setDomain] = useState('techlearnersera.com');
  const [result, setResult] = useState<CDNCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DNS' | 'HEADERS' | 'PERFORMANCE'>('OVERVIEW');

  const handleCheck = async () => {
    if (!domain) return;
    setLoading(true);
    setResult(null);
    const data = await simulateCDNCheck(domain, customRecords);
    setResult(data);
    setLoading(false);
    onAction?.('Lead Engineer', '#3b82f6', 'CDN Diagnostic Performed', `Target: ${domain}`, 'DIAGNOSTIC');
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cloud className="text-blue-400" />
            CDN & Custom Domain Validator
          </h2>
          <p className="text-slate-400 mt-1">Verify CNAME records, SSL edge certificates, and cache header propagation.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
         <div className="flex-1 relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
             <input 
                type="text" 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="Enter domain (e.g., custom.mydomain.com)..."
             />
         </div>
         <button 
            onClick={handleCheck}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
         >
            {loading ? <LoadingSpinner /> : 'Validate Config'}
         </button>
      </div>

      {result && (
          <div className="flex gap-2 border-b border-slate-800">
              {(['OVERVIEW', 'DNS', 'HEADERS', 'PERFORMANCE'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-bold transition-all border-b-2 
                    ${activeTab === tab ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      )}

      <div className="flex-1 glass-panel rounded-lg overflow-y-auto p-6 border border-slate-700">
          {loading ? (
              <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
          ) : result ? (
              <div className="space-y-6">
                  {activeTab === 'OVERVIEW' && (
                      <div className="animate-fadeIn space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Detected Provider</p>
                                  <p className="text-lg font-bold text-white">{result.dns.provider}</p>
                              </div>
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                                  <p className={`text-lg font-bold ${result.analysis.severity === 'Low' ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {result.analysis.severity === 'Low' ? 'Healthy' : 'Issues Found'}
                                  </p>
                              </div>
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">CNAME Target</p>
                                  <p className="text-sm font-mono text-blue-300 truncate">{result.dns.cname}</p>
                              </div>
                          </div>

                          <div className="bg-slate-800/20 p-6 rounded-lg border border-slate-700 border-l-4 border-l-blue-500">
                              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-blue-400" />
                                  Diagnostic Summary
                              </h3>
                              <p className="text-slate-300 leading-relaxed mb-4">{result.analysis.summary}</p>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                                  <div>
                                      <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                          <AlertTriangle className="w-4 h-4 text-orange-400" /> Findings
                                      </h4>
                                      <ul className="space-y-2">
                                          {result.analysis.potentialIssues.map((issue, i) => (
                                              <li key={i} className="text-sm text-red-200 bg-red-500/10 p-2 rounded border border-red-500/20">{issue}</li>
                                          ))}
                                      </ul>
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-400" /> Recommendations
                                      </h4>
                                      <ul className="space-y-2">
                                          {result.analysis.recommendations.map((rec, i) => (
                                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                  <span className="text-green-400 mt-1">•</span> {rec}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'DNS' && (
                      <div className="animate-fadeIn space-y-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <Terminal className="w-5 h-5 text-slate-500" /> DNS Record Simulation
                          </h3>
                          <div className="bg-black p-4 rounded font-mono text-sm text-green-400 overflow-x-auto border border-slate-800">
                              <p className="text-slate-500">; &lt;&lt;&gt;&gt; DiG 9.10.6 &lt;&lt;&gt;&gt; {domain} CNAME</p>
                              <p className="mb-2">;; ANSWER SECTION:</p>
                              <p>{domain.padEnd(20)} 300  IN  CNAME  {result.dns.cname}.</p>
                              <p className="mt-4 text-slate-500">; {domain} A records</p>
                              {result.dns.a.map((ip, i) => (
                                  <p key={i}>{domain.padEnd(20)} 300  IN  A      {ip}</p>
                              ))}
                          </div>
                          <div className="p-4 bg-slate-900 rounded border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                              <Info className="w-4 h-4 text-blue-400 shrink-0" />
                              <p>If the CNAME is missing, the request is hitting your origin server directly, bypassing the CDN. This is the most common cause of "504 Gateway Timeout" at peak loads.</p>
                          </div>
                      </div>
                  )}

                  {activeTab === 'HEADERS' && (
                      <div className="animate-fadeIn space-y-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <List className="w-5 h-5 text-slate-500" /> Edge HTTP Headers
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(result.headers).map(([key, val], i) => (
                                  <div key={i} className="bg-slate-800/50 p-3 rounded border border-slate-700 flex flex-col">
                                      <span className="text-[10px] text-slate-500 font-bold uppercase">{key}</span>
                                      <span className="text-sm font-mono text-slate-200">{val}</span>
                                  </div>
                              ))}
                          </div>
                          <div className="p-4 bg-slate-900 rounded border border-slate-800 text-xs text-slate-400">
                              <p className="font-bold text-slate-200 mb-1">Key Insight:</p>
                              <p>Look for <strong>X-Cache: HIT</strong>. If it's always MISS, check your <code>Cache-Control</code> headers from the origin. If headers are missing entirely, the domain isn't "On-Net" with the CDN.</p>
                          </div>
                      </div>
                  )}

                  {activeTab === 'PERFORMANCE' && (
                      <div className="animate-fadeIn space-y-6">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-slate-500" /> Regional Performance
                          </h3>
                          <div className="space-y-4">
                              {result.performance.map((p, i) => (
                                  <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <Globe className="w-4 h-4 text-slate-500" />
                                          <span className="font-bold text-slate-200">{p.region}</span>
                                      </div>
                                      <div className="flex items-center gap-8">
                                          <div className="text-right">
                                              <span className="text-[10px] text-slate-500 uppercase block">TTFB</span>
                                              <span className={`text-sm font-bold ${p.ttfb > 200 ? 'text-red-400' : 'text-green-400'}`}>{p.ttfb}ms</span>
                                          </div>
                                          <div className="text-right min-w-[80px]">
                                              <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.status === 'HIT' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                  {p.status}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
                  <Globe className="w-16 h-16" />
                  <p>Enter a custom domain and run validation to inspect your CDN architecture.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CDNChecker;
