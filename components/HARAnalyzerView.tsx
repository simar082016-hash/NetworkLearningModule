
import React, { useState, useRef, useMemo } from 'react';
import { analyzeHAR } from '../services/geminiService';
import { AnalysisResult, HAREntrySummary } from '../types';
import { FileCode, Upload, Search, X, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const HARAnalyzerView: React.FC = () => {
  const [entries, setEntries] = useState<HAREntrySummary[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const harData = JSON.parse(text);
        
        // Parse HAR
        const parsedEntries: HAREntrySummary[] = harData.log.entries.map((entry: any) => ({
             url: entry.request.url,
             method: entry.request.method,
             status: entry.response.status,
             time: entry.time,
             size: entry.response.content.size,
             mimeType: entry.response.content.mimeType,
             start: new Date(entry.startedDateTime).getTime()
        }));
        
        setEntries(parsedEntries);
      } catch (err) {
        console.error("Invalid HAR file", err);
        alert("Failed to parse HAR file. Ensure it is valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    const analysis = await analyzeHAR(entries);
    setResult(analysis);
    setLoading(false);
  };

  const clearInput = () => {
    setEntries([]);
    setFileName(null);
    setResult(null);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Filter and stats
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e => e.url.toLowerCase().includes(q) || e.status.toString().includes(q));
  }, [entries, searchQuery]);

  const totalRequests = entries.length;
  const errorRequests = entries.filter(e => e.status >= 400).length;
  const slowRequests = entries.filter(e => e.time > 1000).length;
  const totalSize = (entries.reduce((acc, curr) => acc + curr.size, 0) / 1024 / 1024).toFixed(2);

  // Waterfall calc
  const minStart = useMemo(() => Math.min(...entries.map(e => e.start)), [entries]);
  const maxEnd = useMemo(() => Math.max(...entries.map(e => e.start + e.time)), [entries]);
  const totalDuration = maxEnd - minStart || 1;

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode className="text-pink-400" />
            HAR Log Analyzer
          </h2>
          <p className="text-slate-400 mt-1">Analyze HTTP Archive (.har) files for performance bottlenecks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input / List Area */}
        <div className="flex flex-col gap-4">
          <div className="relative flex-1 glass-panel rounded-lg overflow-hidden flex flex-col">
            <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2 shrink-0">
                <FileCode className="w-4 h-4" />
                {fileName ? fileName : 'No File Loaded'}
              </span>
              
              {/* Search Bar */}
              {entries.length > 0 && (
                  <div className="flex-1 max-w-xs relative">
                      <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                      <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Filter URL..."
                         className="w-full bg-slate-800 text-slate-200 text-xs py-1.5 pl-7 pr-2 rounded border border-slate-700 focus:outline-none focus:border-pink-500"
                      />
                  </div>
              )}

              {fileName && (
                  <button onClick={clearInput} className="text-slate-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                  </button>
              )}
            </div>
            
            {entries.length > 0 ? (
                <div className="flex-1 overflow-y-auto p-0">
                     <div className="sticky top-0 bg-slate-800/90 backdrop-blur z-10 grid grid-cols-12 gap-2 p-2 text-xs font-bold text-slate-400 border-b border-slate-700">
                         <div className="col-span-1">Stat</div>
                         <div className="col-span-1">Mthd</div>
                         <div className="col-span-5">URL</div>
                         <div className="col-span-2 text-right">Time</div>
                         <div className="col-span-3">Waterfall</div>
                     </div>
                     {filteredEntries.map((entry, idx) => {
                         const offset = ((entry.start - minStart) / totalDuration) * 100;
                         const width = Math.max(((entry.time) / totalDuration) * 100, 1); // at least 1%
                         
                         return (
                             <div key={idx} className="grid grid-cols-12 gap-2 p-2 text-xs border-b border-slate-800 hover:bg-slate-800/50 items-center font-mono group">
                                 <div className={`col-span-1 font-bold ${entry.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                                     {entry.status}
                                 </div>
                                 <div className="col-span-1 text-slate-500">{entry.method}</div>
                                 <div className="col-span-5 truncate text-slate-300" title={entry.url}>{entry.url}</div>
                                 <div className={`col-span-2 text-right ${entry.time > 1000 ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>
                                     {Math.round(entry.time)}ms
                                 </div>
                                 <div className="col-span-3 h-4 bg-slate-800 rounded-sm relative overflow-hidden">
                                     <div 
                                        className={`absolute h-full rounded-sm opacity-80 group-hover:opacity-100 transition-opacity
                                            ${entry.status >= 400 ? 'bg-red-500' : entry.time > 1000 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                        style={{ left: `${offset}%`, width: `${width}%` }}
                                     ></div>
                                 </div>
                             </div>
                         );
                     })}
                </div>
            ) : (
                <div 
                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 m-4 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-12 h-12 text-slate-500 mb-2" />
                    <p className="text-slate-400 font-medium">Click to upload .har file</p>
                    <p className="text-slate-600 text-xs mt-2">Export from Chrome/Edge DevTools</p>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".har,.json"
                        onChange={handleFileUpload}
                    />
                </div>
            )}
            
            {entries.length > 0 && (
                <div className="bg-slate-900 p-2 flex justify-between text-xs text-slate-400 border-t border-slate-700">
                    <span>Total: {totalRequests}</span>
                    <span className={errorRequests > 0 ? 'text-red-400' : ''}>Errors: {errorRequests}</span>
                    <span className={slowRequests > 0 ? 'text-orange-400' : ''}>Slow (>1s): {slowRequests}</span>
                    <span>Size: {totalSize} MB</span>
                </div>
            )}
            
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || entries.length === 0}
            className={`py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
              ${loading || entries.length === 0 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/20'
              }`}
          >
            {loading ? <LoadingSpinner /> : (
              <>
                <Search className="w-5 h-5" />
                Analyze Performance
              </>
            )}
          </button>
        </div>

        {/* Output Area */}
        <div className="flex flex-col">
           {loading ? (
             <div className="flex-1 glass-panel rounded-lg flex items-center justify-center">
               <LoadingSpinner />
             </div>
           ) : result ? (
             <div className="flex-1 glass-panel rounded-lg p-6 overflow-y-auto space-y-6 border-l-4 border-l-pink-500">
               <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                 <h3 className="text-lg font-semibold text-white">Performance Report</h3>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${result.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      result.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      result.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                    {result.severity} Impact
                 </span>
               </div>

               <div>
                 <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Executive Summary</h4>
                 <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
               </div>

               <div>
                 <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                   <Clock className="w-4 h-4 text-orange-500" />
                   Bottlenecks Identified
                 </h4>
                 <ul className="space-y-2">
                   {result.potentialIssues.map((issue, idx) => (
                     <li key={idx} className="bg-orange-500/10 p-3 rounded border border-orange-500/20 text-orange-200 text-sm">
                       {issue}
                     </li>
                   ))}
                 </ul>
               </div>

               <div>
                 <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                   <CheckCircle className="w-4 h-4 text-green-500" />
                   Optimization Tips
                 </h4>
                 <ul className="space-y-2">
                   {result.recommendations.map((rec, idx) => (
                     <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                       <span className="bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white shrink-0 mt-0.5">{idx + 1}</span>
                       {rec}
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           ) : (
             <div className="flex-1 glass-panel rounded-lg flex flex-col items-center justify-center text-slate-500 p-8 border-2 border-dashed border-slate-700">
               <FileCode className="w-12 h-12 mb-4 opacity-50" />
               <p className="text-lg font-medium">Ready to Analyze</p>
               <p className="text-sm text-center max-w-xs mt-2">
                 Upload a HAR file to identify slow API calls, large asset downloads, and waterfall blocking issues.
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default HARAnalyzerView;
