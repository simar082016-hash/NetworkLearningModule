
import React, { useState } from 'react';
import { analyzeSplunkLogs } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { FileText, Search, AlertTriangle, CheckCircle, Database, Server, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const SplunkDebuggerView: React.FC = () => {
  const [logs, setLogs] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock log for quick testing
  const MOCK_SPLUNK_LOG = `10-15-2023 14:22:01.453 +0000 WARN  IndexerService - Received return value 2 from indexer, bucket ID=primary~5~B8F3C2
10-15-2023 14:22:01.650 +0000 ERROR TcpInputProc - The queue 'indexQueue' is full. Blocking until space is available.
10-15-2023 14:22:05.112 +0000 WARN  DateParserVerbose - The time format matched '10-15-2023' but failed to parse.
10-15-2023 14:23:00.000 +0000 INFO  HealthCheck - Saturated queues detected. indexQueue=98%
10-15-2023 14:24:12.333 +0000 ERROR SearchProcess - Search peer ip-10-0-2-55 down.`;

  const handleAnalyze = async () => {
    if (!logs.trim()) return;
    setLoading(true);
    const analysis = await analyzeSplunkLogs(logs);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-[#65A637] font-extrabold">&gt;</span> 
            Splunk Core Debugger
          </h2>
          <p className="text-slate-400 mt-1">Analyze internal logs (`splunkd.log`) for pipeline blocking, bucket issues, and crashes.</p>
        </div>
        <button 
            onClick={() => { setLogs(MOCK_SPLUNK_LOG); setResult(null); }}
            className="text-sm text-[#65A637] hover:text-[#83cd4d] underline underline-offset-4 font-mono"
        >
            Load Sample splunkd.log
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Input Side */}
        <div className="flex flex-col gap-4">
            <div className="flex-1 bg-[#171d21] rounded-lg border border-slate-700 flex flex-col overflow-hidden">
                <div className="bg-[#2a3138] p-3 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <FileText className="w-3 h-3" />
                        <span>Log Input (splunkd.log / python.log)</span>
                    </div>
                </div>
                <textarea
                    className="flex-1 w-full bg-[#171d21] p-4 font-mono text-sm text-slate-300 focus:outline-none resize-none whitespace-pre"
                    placeholder="Paste your internal Splunk logs here..."
                    value={logs}
                    onChange={(e) => setLogs(e.target.value)}
                    spellCheck={false}
                />
            </div>
            
            <button
                onClick={handleAnalyze}
                disabled={loading || !logs}
                className={`py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                  ${loading || !logs 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-[#65A637] hover:bg-[#5c9632] text-white shadow-lg shadow-green-900/20'
                  }`}
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Internal Health
                  </>
                )}
            </button>
        </div>

        {/* Output Side */}
        <div className="flex flex-col">
            {loading ? (
                <div className="flex-1 glass-panel rounded-lg flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : result ? (
                <div className="flex-1 glass-panel rounded-lg p-6 overflow-y-auto space-y-6 border-l-4 border-l-[#65A637]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Server className="w-5 h-5 text-slate-400" />
                            Diagnostic Report
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                            ${result.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              result.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                              result.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                            {result.severity} Priority
                        </span>
                    </div>

                    <div>
                         <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Analysis Summary</h4>
                         <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            Identified Issues
                        </h4>
                        <ul className="space-y-2">
                            {result.potentialIssues.map((issue, idx) => (
                                <li key={idx} className="bg-orange-900/20 p-3 rounded border border-orange-500/20 text-orange-200 text-sm font-mono">
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-[#65A637]" />
                            Fix Recommendations
                        </h4>
                        <ul className="space-y-2">
                            {result.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                                    <span className="bg-[#65A637] rounded-full w-5 h-5 flex items-center justify-center text-xs text-white shrink-0 mt-0.5">{idx + 1}</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex-1 glass-panel rounded-lg flex flex-col items-center justify-center text-slate-500 p-8 border-2 border-dashed border-slate-700">
                    <Database className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Ready for Debugging</p>
                    <p className="text-sm text-center max-w-xs mt-2">
                        Paste text from <code>splunkd.log</code>, <code>scheduler.log</code>, or <code>web_service.log</code>.
                    </p>
                    <div className="mt-4 p-3 bg-slate-900 rounded text-xs text-left font-mono text-slate-400 w-full max-w-sm">
                        <p className="mb-1 text-slate-500"># Common Checks:</p>
                        <p>- Blocked Indexing Queues</p>
                        <p>- Skipped Searches</p>
                        <p>- Bucket Replication Failures</p>
                        <p>- Forwarder Connectivity</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SplunkDebuggerView;
