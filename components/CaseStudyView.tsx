
import React, { useState } from 'react';
import { CASE_STUDIES } from '../constants';
import { CaseStudy, AnalysisResult, AuditLog } from '../types';
import { Briefcase, Play, ArrowLeft, FileCode, Shield, Terminal, Activity, Search, Info, CheckCircle } from 'lucide-react';
import { analyzeHAR, analyzeIdentityArtifact, analyzeNetworkLogs } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

const CaseStudyView: React.FC<Props> = ({ onAction }) => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTroubleshoot = async () => {
    if (!selectedCase) return;
    setLoading(true);
    
    let result: AnalysisResult;
    try {
        if (selectedCase.evidenceType === 'HAR') {
            const harData = JSON.parse(selectedCase.evidenceData);
            const entries = harData.log.entries.map((e: any) => ({
                url: e.request.url,
                method: e.request.method,
                status: e.response.status,
                time: e.time,
                size: e.response.content.size,
                mimeType: e.response.content.mimeType,
                start: new Date(e.startedDateTime).getTime()
            }));
            result = await analyzeHAR(entries);
        } else if (selectedCase.evidenceType === 'SAML') {
            result = await analyzeIdentityArtifact(selectedCase.evidenceData, 'SAML');
        } else {
            result = await analyzeNetworkLogs(selectedCase.evidenceData);
        }
        setAnalysis(result);
        onAction?.('Lead Engineer', '#4f46e5', 'Troubleshooted Case Study', `ID: ${selectedCase.id} - ${selectedCase.title}`, 'DIAGNOSTIC');
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'HAR': return <FileCode className="w-5 h-5 text-pink-400" />;
      case 'SAML': return <Shield className="w-5 h-5 text-purple-400" />;
      case 'PCAP': return <Terminal className="w-5 h-5 text-blue-400" />;
      default: return <Activity className="w-5 h-5 text-orange-400" />;
    }
  };

  if (selectedCase) {
    return (
      <div className="h-full flex flex-col space-y-6 animate-fadeIn">
        <button 
          onClick={() => { setSelectedCase(null); setAnalysis(null); }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            {/* Left Column: Briefing & Evidence */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scroll">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Briefcase className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{selectedCase.industry}</span>
                            <h2 className="text-xl font-bold text-white leading-tight">{selectedCase.title}</h2>
                        </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{selectedCase.description}</p>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col flex-1">
                    <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            {getEvidenceIcon(selectedCase.evidenceType)}
                            Collected Evidence ({selectedCase.evidenceType})
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                            <Activity className="w-3 h-3" /> LIVE DATA
                        </div>
                    </div>
                    <pre className="flex-1 p-4 font-mono text-xs text-slate-400 overflow-auto whitespace-pre-wrap">
                        {selectedCase.evidenceData}
                    </pre>
                </div>

                <button
                    onClick={handleTroubleshoot}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50"
                >
                    {loading ? <LoadingSpinner /> : (
                        <>
                            <Search className="w-5 h-5" />
                            Perform AI Diagnostic Analysis
                        </>
                    )}
                </button>
            </div>

            {/* Right Column: AI Analysis Report */}
            <div className="flex flex-col">
                {analysis ? (
                    <div className="flex-1 glass-panel rounded-xl p-6 overflow-y-auto space-y-6 border-l-4 border-l-indigo-500 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                             <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Diagnostic Report</h3>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase
                                ${analysis.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                                {analysis.severity} PRIORITY
                             </span>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3" /> Concept Reference
                            </h4>
                            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-blue-300 text-sm font-semibold">
                                Link: {selectedCase.conceptLink}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Incident Summary</h4>
                            <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{analysis.summary}</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Root Causes Identified</h4>
                            {analysis.potentialIssues.map((issue, idx) => (
                                <div key={idx} className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-200 text-sm flex gap-3">
                                    <span className="text-red-500 font-bold shrink-0">!</span>
                                    {issue}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action Items (NOC Guidance)</h4>
                            {analysis.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                    <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-300 text-sm">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 glass-panel rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 border-2 border-dashed border-slate-800">
                        <Terminal className="w-16 h-16 mb-4 opacity-10" />
                        <h3 className="text-lg font-bold mb-2">Awaiting Diagnostic Input</h3>
                        <p className="text-sm text-center max-w-xs leading-relaxed">
                            Click 'Perform AI Diagnostic Analysis' to process the collected evidence using industry-level troubleshooting logic.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-indigo-400" />
            Industry Case Studies
          </h2>
          <p className="text-slate-400 mt-1">Study real-world networking disasters and master the art of troubleshooting.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6 custom-scroll">
        {CASE_STUDIES.map((study) => (
          <div 
            key={study.id} 
            className="group bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex flex-col hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
            onClick={() => setSelectedCase(study)}
          >
            <div className="h-32 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50"></div>
                {getEvidenceIcon(study.evidenceType)}
                <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {study.industry}
                </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 leading-tight">
                    {study.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {study.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Artifact:</span>
                        <span className="text-[10px] font-bold text-indigo-400">{study.evidenceType} LOG</span>
                    </div>
                    <button className="flex items-center gap-2 text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Troubleshoot <Play className="w-3 h-3 fill-current" />
                    </button>
                </div>
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/20 rounded-2xl border border-dashed border-indigo-500/30 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold mb-1">More Coming Soon</h3>
            <p className="text-slate-500 text-xs">New industry scenarios are generated weekly to keep your skills sharp.</p>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyView;
