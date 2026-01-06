
import React, { useState } from 'react';
import { simulateMxLookup } from '../services/geminiService';
import { AuditLog } from '../types';
import { 
  Search, 
  Shield, 
  Mail, 
  Layout, 
  Globe, 
  FileText, 
  Activity, 
  Zap,
  ExternalLink,
  CheckCircle2,
  FileSearch,
  Check
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

type ToolType = 'MX' | 'SPF' | 'DMARC' | 'DIAGNOSTIC' | 'DNS' | 'HEADERS';

interface Props {
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

const MxToolView: React.FC<Props> = ({ onAction }) => {
  const [domain, setDomain] = useState('techlearnersera.com');
  const [toolType, setToolType] = useState<ToolType>('MX');
  const [headers, setHeaders] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!domain && toolType !== 'HEADERS') return;
    if (toolType === 'HEADERS' && !headers.trim()) return;

    setLoading(true);
    setResult(null);
    try {
        const data = await simulateMxLookup(domain, toolType, headers);
        setResult(data);
        onAction?.('Lead Engineer', '#f97316', 'MxToolbox Query', `${toolType} for ${domain || 'Header Analysis'}`, 'DIAGNOSTIC');
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-[#f27020] text-white p-1 rounded text-lg font-black tracking-tighter">MX</span>
            SuperTool Simulator
          </h2>
          <p className="text-slate-400 mt-1">Professional email deliverability and network diagnostic toolkit.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             Cloud Diagnostic Node: active
        </div>
      </div>

      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-xl space-y-4">
         <div className="flex flex-col md:flex-row gap-3">
             <div className="flex-[2] relative">
                 <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                 <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={toolType === 'HEADERS'}
                    className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#f27020] font-mono text-sm disabled:opacity-30"
                    placeholder="Enter domain (e.g. techlearnersera.com)..."
                 />
             </div>
             <button 
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 bg-[#f27020] hover:bg-[#e06010] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/40 disabled:opacity-50"
             >
                {loading ? <LoadingSpinner /> : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      {toolType.replace('_', ' ')} Lookup
                    </>
                )}
             </button>
         </div>

         <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
             {[
                 { id: 'MX', label: 'MX Lookup', icon: Mail },
                 { id: 'SPF', label: 'SPF Record', icon: FileSearch },
                 { id: 'DMARC', label: 'DMARC Check', icon: Shield },
                 { id: 'DIAGNOSTIC', label: 'Diagnostics', icon: Activity },
                 { id: 'DNS', label: 'DNS Lookup', icon: Globe },
                 { id: 'HEADERS', label: 'Analyze Headers', icon: FileText },
             ].map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => { setToolType(tab.id as ToolType); setResult(null); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border
                    ${toolType === tab.id 
                        ? 'bg-[#f27020]/10 text-[#f27020] border-[#f27020]/50' 
                        : 'bg-slate-800/50 text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}`}
                 >
                     <tab.icon className="w-3.5 h-3.5" />
                     {tab.label}
                 </button>
             ))}
         </div>
      </div>

      <div className="flex-1 bg-white rounded-lg overflow-hidden flex flex-col border border-slate-300 shadow-2xl">
          {toolType === 'HEADERS' && !result && (
              <div className="p-6 h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                          <FileText className="text-[#f27020]" />
                          Email Header Analyzer
                      </h3>
                      <button className="text-xs text-blue-600 hover:underline font-bold">How to get headers?</button>
                  </div>
                  <textarea 
                    className="flex-1 bg-slate-50 p-4 font-mono text-xs text-slate-700 rounded border border-slate-200 focus:outline-none focus:border-[#f27020] resize-none"
                    placeholder="Paste raw email headers here..."
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                  />
              </div>
          )}

          {!result && !loading && toolType !== 'HEADERS' && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                  <Layout className="w-16 h-16" />
                  <p className="text-lg font-bold uppercase tracking-widest">Select a tool to begin analysis</p>
              </div>
          )}

          {loading && (
              <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
              </div>
          )}

          {result && (
              <div className="flex-1 overflow-y-auto custom-scroll text-slate-800">
                  {/* Results Header */}
                  <div className="bg-[#f5f5f5] p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{toolType} Results for {domain}</h3>
                  </div>

                  {/* Main Tool Content Area */}
                  <div className="p-4 animate-fadeIn space-y-8">
                      {result.type === 'MX' && (
                          <div className="space-y-8">
                               {/* Record List Table */}
                               <div className="overflow-hidden border border-slate-200 rounded">
                                   <table className="w-full text-left text-sm border-collapse">
                                      <thead className="bg-[#f5f5f5] text-slate-700 font-bold border-b border-slate-200">
                                          <tr>
                                              <th className="px-4 py-2 border-r border-slate-200 w-16">Pref</th>
                                              <th className="px-4 py-2 border-r border-slate-200">Hostname</th>
                                              <th className="px-4 py-2 border-r border-slate-200">IP Address</th>
                                              <th className="px-4 py-2 border-r border-slate-200 w-24">TTL</th>
                                              <th className="px-4 py-2"></th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {result.records?.map((rec: any, idx: number) => (
                                              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                  <td className="px-4 py-3 border-r border-slate-200 text-slate-600 font-mono">{rec.pref}</td>
                                                  <td className="px-4 py-3 border-r border-slate-200">
                                                      <button className="text-blue-600 hover:underline font-medium">{rec.hostname}</button>
                                                  </td>
                                                  <td className="px-4 py-3 border-r border-slate-200">
                                                      <div className="text-blue-600 font-medium hover:underline cursor-pointer">{rec.ip}</div>
                                                      <div className="text-[10px] text-slate-400 font-bold">{rec.isp || 'Cloud ISP Provider'}</div>
                                                  </td>
                                                  <td className="px-4 py-3 border-r border-slate-200 text-slate-500 font-medium whitespace-nowrap">{rec.ttl || '60 min'}</td>
                                                  <td className="px-4 py-3">
                                                      <div className="flex gap-4 text-xs">
                                                          <button className="text-blue-600 hover:underline font-bold">Blacklist Check</button>
                                                          <button className="text-blue-600 hover:underline font-bold">SMTP Test</button>
                                                      </div>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                   </table>
                               </div>

                               {/* Diagnostic Summary Table matching Screenshot */}
                               <div className="overflow-hidden border border-slate-200 rounded">
                                   <table className="w-full text-left text-sm border-collapse">
                                      <thead className="bg-[#f5f5f5] text-slate-700 font-bold border-b border-slate-200">
                                          <tr>
                                              <th className="px-4 py-2 border-r border-slate-200 w-12"></th>
                                              <th className="px-4 py-2 border-r border-slate-200">Test</th>
                                              <th className="px-4 py-2">Result</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {result.tests?.map((test: any, idx: number) => (
                                              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                  <td className="px-4 py-2 border-r border-slate-200 text-center">
                                                      <div className="w-5 h-5 bg-[#5cb85c] rounded-full flex items-center justify-center mx-auto">
                                                         <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                                                      </div>
                                                  </td>
                                                  <td className="px-4 py-2 border-r border-slate-200 font-medium text-slate-600">{test.name}</td>
                                                  <td className="px-4 py-2 text-slate-600 font-medium">{test.details}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                   </table>
                               </div>
                          </div>
                      )}

                      {result.type === 'SPF' && (
                          <div className="space-y-8">
                               <div className="bg-slate-50 p-6 border border-slate-200 rounded">
                                   <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">SPF Record Text</h4>
                                   <p className="font-mono text-green-700 font-bold bg-white p-4 border border-slate-200 rounded-md shadow-sm">{result.record}</p>
                               </div>
                               <div className="overflow-hidden border border-slate-200 rounded">
                                   <table className="w-full text-left text-sm border-collapse">
                                      <thead className="bg-[#f5f5f5] text-slate-700 font-bold border-b border-slate-200">
                                          <tr>
                                              <th className="px-4 py-2 border-r border-slate-200 w-12"></th>
                                              <th className="px-4 py-2 border-r border-slate-200">SPF Diagnostic Test</th>
                                              <th className="px-4 py-2">Result</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {result.tests?.map((test: any, idx: number) => (
                                              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                  <td className="px-4 py-2 border-r border-slate-200 text-center">
                                                      <div className="w-5 h-5 bg-[#5cb85c] rounded-full flex items-center justify-center mx-auto">
                                                         <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                                                      </div>
                                                  </td>
                                                  <td className="px-4 py-2 border-r border-slate-200 font-medium text-slate-600">{test.name}</td>
                                                  <td className="px-4 py-2 text-slate-600 font-medium">{test.details}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                   </table>
                               </div>
                          </div>
                      )}

                      {/* Generic views for other tool types */}
                      {result.type !== 'MX' && result.type !== 'SPF' && (
                          <div className="space-y-4">
                               <pre className="p-4 bg-slate-50 border border-slate-200 rounded font-mono text-xs overflow-auto text-slate-600">
                                   {JSON.stringify(result, null, 2)}
                               </pre>
                               <div className="bg-blue-50 border border-blue-200 p-4 rounded text-xs text-blue-800 flex items-start gap-3">
                                   <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                                   <p>Detailed view for {toolType} is using the legacy diagnostic engine. Enhanced UI coming soon.</p>
                               </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-2 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest border-t border-slate-800 gap-4">
          <div className="flex gap-6">
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-orange-500" /> Professional Grade</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-blue-500" /> Real-time Global Sync</span>
          </div>
          <div className="flex items-center gap-4">
              <a href="https://mxtoolbox.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors">
                  Based on MxToolbox Architecture <ExternalLink className="w-3 h-3" />
              </a>
          </div>
      </div>
    </div>
  );
};

export default MxToolView;
