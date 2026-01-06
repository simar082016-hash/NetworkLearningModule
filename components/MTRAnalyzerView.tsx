
import React, { useState } from 'react';
import { simulateMTR, analyzeMTR, MTRHop } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { Network, Search, ArrowRightLeft, AlertCircle, Play, Info, BarChart3, CheckCircle, AlertTriangle, ShieldCheck, Download, Terminal as TerminalIcon, Layout, Copy } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const MTRAnalyzerView: React.FC = () => {
  const [target, setTarget] = useState('13.126.23.68');
  const [hops, setHops] = useState<MTRHop[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReverse, setIsReverse] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'terminal'>('table');

  const startMTR = async () => {
    if (!target) return;
    setLoading(true);
    setAnalysis(null);
    setHops([]);
    
    // Step 1: Simulate the path
    const data = await simulateMTR(target, isReverse);
    setHops(data);
    
    // Step 2: Analyze the path with AI
    if (data.length > 0) {
      const result = await analyzeMTR(data, target);
      setAnalysis(result);
    }
    
    setLoading(false);
  };

  const generateTerminalOutput = () => {
    if (hops.length === 0) return '';

    const header = `Keys:  Help   Display mode   Restart statistics   Order of fields   quit\n\n`;
    const subHeader = `                                                              Packets               Pings\n`;
    const columns = ` Host                                                       Loss%   Snt   Last   Avg  Best  Wrst StDev\n`;

    const body = hops.map((hop) => {
      const hopIdx = `${hop.hop}.`.padEnd(3);
      const host = (hop.host || hop.ip).padEnd(55);
      const loss = `${hop.loss.toFixed(1)}%`.padStart(6);
      const snt = hop.sent.toString().padStart(5);
      const last = hop.last.toFixed(1).padStart(7);
      const avg = hop.avrg.toFixed(1).padStart(6);
      const best = hop.best.toFixed(1).padStart(6);
      const wrst = hop.worst.toFixed(1).padStart(6);
      // Simulated StDev to match classic output look
      const stdev = (Math.abs(hop.worst - hop.best) / 4).toFixed(1).padStart(6);

      return ` ${hopIdx}${host} ${loss} ${snt} ${last} ${avg} ${best} ${wrst} ${stdev}`;
    }).join('\n');

    return header + subHeader + columns + body;
  };

  const handleDownload = () => {
    const text = generateTerminalOutput();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mtr_report_${target.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const text = generateTerminalOutput();
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="text-indigo-400" />
            MTR & Route Intelligence
          </h2>
          <p className="text-slate-400 mt-1">Capture multi-hop diagnostics with AI-driven path analysis and terminal-style reporting.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 font-mono text-sm"
              placeholder="Enter Hostname or IP (e.g., 13.126.23.68)..."
            />
          </div>
          <button
            onClick={() => setIsReverse(!isReverse)}
            className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 font-bold text-sm
              ${isReverse 
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
              }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isReverse ? 'Reverse Path' : 'Forward Path'}
          </button>
          <button 
            onClick={startMTR}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : (
              <>
                <Play className="w-4 h-4" />
                Run Intelligence Trace
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-4">
           <Info className="w-3.5 h-3.5" />
           <span>{isReverse ? "Tracing from TARGET back to LOCAL source (Looking Glass simulation)" : "Tracing from LOCAL source to TARGET destination"}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {analysis && (
          <div className="glass-panel rounded-xl p-6 border-l-4 border-l-indigo-500 shadow-2xl animate-slideIn shrink-0">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">AI Path Diagnostic Report</h3>
              </div>
              <div className="flex items-center gap-4">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase
                    ${analysis.severity === 'Critical' ? 'bg-red-500 text-white' : 
                    analysis.severity === 'High' ? 'bg-orange-500 text-white' :
                    analysis.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'}`}>
                    {analysis.severity} SEVERITY
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Executive Summary</h4>
                  <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap font-medium">{analysis.summary}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2 text-orange-400">
                    <AlertTriangle className="w-3 h-3" /> Anomalies Detected
                  </h4>
                  <ul className="space-y-2">
                    {analysis.potentialIssues.map((issue, idx) => (
                      <li key={idx} className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20 text-orange-200 text-sm flex gap-3 font-mono">
                        <span className="text-orange-500 font-bold shrink-0">!</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {(hops.length > 0 || loading) && (
          <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden border border-slate-700 flex flex-col shadow-2xl animate-fadeIn">
            <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700">
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-2 
                      ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                     <Layout className="w-3.5 h-3.5" />
                     Table View
                  </button>
                  <button 
                    onClick={() => setViewMode('terminal')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-2 
                      ${viewMode === 'terminal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                     <TerminalIcon className="w-3.5 h-3.5" />
                     Terminal Mode
                  </button>
               </div>
               <div className="flex items-center gap-2">
                  {hops.length > 0 && (
                    <>
                      <button 
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Copy to clipboard"
                      >
                         <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Download MTR Report"
                      >
                         <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
               </div>
            </div>

            <div className={`flex-1 overflow-auto custom-scroll ${viewMode === 'terminal' ? 'bg-black p-6' : ''}`}>
              {loading && hops.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 space-y-4">
                   <LoadingSpinner />
                   <p className="text-slate-500 animate-pulse font-mono text-sm">Probing nodes via ICMP/UDP...</p>
                </div>
              ) : viewMode === 'terminal' ? (
                 <pre className="font-mono text-green-500 text-sm leading-tight whitespace-pre">
                   {generateTerminalOutput()}
                 </pre>
              ) : (
                <>
                  <div className="bg-slate-800/30 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700">
                    <div className="col-span-1">Hop</div>
                    <div className="col-span-4">Hostname / IP Address</div>
                    <div className="col-span-1 text-center">Loss%</div>
                    <div className="col-span-1 text-center">Sent</div>
                    <div className="col-span-1 text-center">Recv</div>
                    <div className="col-span-1 text-right">Best</div>
                    <div className="col-span-1 text-right">Avrg</div>
                    <div className="col-span-1 text-right">Worst</div>
                    <div className="col-span-1 text-right">Last</div>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {hops.map((hop) => (
                      <div key={hop.hop} className="group grid grid-cols-12 gap-4 items-center px-6 py-3.5 hover:bg-indigo-600/5 transition-colors text-sm font-mono border-b border-slate-800/50">
                        <div className="col-span-1 text-slate-600 font-bold">{hop.hop}</div>
                        <div className="col-span-4 flex flex-col overflow-hidden">
                          <span className="text-slate-200 truncate font-semibold" title={hop.host}>{hop.host}</span>
                          <span className="text-slate-500 text-[10px]">{hop.ip}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                            ${hop.loss > 5 ? 'bg-red-500/20 text-red-400' : 
                              hop.loss > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                            {hop.loss}%
                          </span>
                        </div>
                        <div className="col-span-1 text-center text-slate-400">{hop.sent}</div>
                        <div className="col-span-1 text-center text-slate-400">{hop.recv}</div>
                        <div className="col-span-1 text-right text-slate-300">{hop.best}ms</div>
                        <div className="col-span-1 text-right text-indigo-400 font-bold">{hop.avrg}ms</div>
                        <div className="col-span-1 text-right text-slate-300">{hop.worst}ms</div>
                        <div className="col-span-1 text-right text-slate-300">{hop.last}ms</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!analysis && !loading && hops.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/10 p-12">
             <BarChart3 className="w-16 h-16 mb-4 opacity-10" />
             <h3 className="text-lg font-bold mb-1 opacity-20 uppercase tracking-widest">Network Path Diagnostics</h3>
             <p className="text-sm text-center max-w-sm opacity-20">Enter a target like 13.126.23.68 and click Run Intelligence Trace to begin deep path analysis.</p>
          </div>
        )}
      </div>

      {hops.length > 0 && !analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex gap-4 shadow-md">
             <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white mb-1">Path Intelligence</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Network routes are rarely symmetric. AI analysis helps identify if return traffic is the bottleneck.</p>
             </div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex gap-4 shadow-md">
             <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white mb-1">Packet Loss Analysis</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Actual path loss persists through to the destination. AI filters out ICMP rate-limiting noise.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MTRAnalyzerView;
