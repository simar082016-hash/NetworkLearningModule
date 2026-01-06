
import React, { useState, useRef, useEffect } from 'react';
import { analyzeNetworkLogs, generatePacketBatch } from '../services/geminiService';
import { AnalysisResult, AuditLog, Packet } from '../types';
import { MOCK_LOGS } from '../constants';
import { 
  Terminal, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  FileText, 
  Upload, 
  X, 
  ChevronDown, 
  List, 
  Activity, 
  LayoutDashboard, 
  Microscope,
  Cpu,
  Info,
  Radio,
  Square,
  Zap
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

const ToolAnalyzer: React.FC<Props> = ({ onAction }) => {
  const [logs, setLogs] = useState<string>('');
  const [isPcapHex, setIsPcapHex] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'INSPECTOR'>('DASHBOARD');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInterval = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle Live Capture
  useEffect(() => {
    if (isCapturing) {
      setActiveView('INSPECTOR');
      startCaptureStream();
    } else {
      stopCaptureStream();
    }
    return () => stopCaptureStream();
  }, [isCapturing]);

  const startCaptureStream = () => {
    fetchBatch();
    captureInterval.current = window.setInterval(() => {
        fetchBatch();
    }, 5000);
    onAction?.('Lead Engineer', '#ef4444', 'Started Live Trace', 'Simulation eth0 interface active', 'DIAGNOSTIC');
  };

  const stopCaptureStream = () => {
    if (captureInterval.current) clearInterval(captureInterval.current);
  };

  const fetchBatch = async () => {
    const nextNo = packets.length > 0 ? packets[packets.length - 1].no + 1 : 1;
    const batch = await generatePacketBatch('', 3, nextNo);
    setPackets(prev => [...prev, ...batch]);
  };

  const handleAnalyze = async () => {
    if (!logs.trim()) return;
    setLoading(true);
    setPackets([]);
    try {
        const analysis = await analyzeNetworkLogs(logs);
        setResult(analysis);
        if (analysis.packets && analysis.packets.length > 0) {
          setPackets(analysis.packets);
          setSelectedPacket(analysis.packets[0]);
          setActiveView('INSPECTOR');
        }
        onAction?.('Lead Engineer', '#2563eb', 'Deep Inspection Performed', `Source: ${fileName || 'Clipboard'}`, 'DIAGNOSTIC');
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const bufferToHex = (buffer: ArrayBuffer) => {
    const uint8Array = new Uint8Array(buffer);
    return Array.from(uint8Array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setPackets([]);
    const isPcapFile = file.name.endsWith('.pcap') || file.type === 'application/vnd.tcpdump.pcap';
    if (isPcapFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            setLogs(bufferToHex(buffer));
            setIsPcapHex(true);
        };
        reader.readAsArrayBuffer(file);
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                setLogs(e.target.result);
                setIsPcapHex(false);
            }
        };
        reader.readAsText(file);
    }
  };

  const getProtocolColorClass = (proto: string) => {
    const p = proto?.toUpperCase() || '';
    if (p.includes('TCP')) return 'bg-[#e7e6ff] text-[#2c2b5e]';
    if (p.includes('HTTP')) return 'bg-[#e4ffc7] text-[#2b4c11]';
    if (p.includes('DNS')) return 'bg-[#cceeff] text-[#004d73]';
    if (p.includes('TLS')) return 'bg-[#f4e0ff] text-[#4d1f6b]';
    if (p.includes('ICMP')) return 'bg-[#fce0e0] text-[#730000]';
    return 'bg-white text-slate-900';
  };

  const formatHex = (hex: string) => {
    if (!hex) return '';
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    const lines = [];
    const bytes = cleanHex.match(/.{1,2}/g) || [];
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const address = i.toString(16).padStart(4, '0');
      const hexPart = chunk.map((b, idx) => b + (idx === 7 ? '  ' : ' ')).join('').padEnd(49);
      const asciiPart = chunk.map(b => {
          const charCode = parseInt(b, 16);
          return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
      }).join('');
      lines.push(`${address}   ${hexPart}   ${asciiPart}`);
    }
    return lines.join('\n');
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="text-purple-400" />
            PCAP & Log Analyzer Pro
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Capture or import traffic for deep protocol inspection.</p>
        </div>
        <div className="flex gap-3 items-center">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setActiveView('DASHBOARD')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-2 uppercase tracking-wider
                    ${activeView === 'DASHBOARD' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <LayoutDashboard className="w-3 h-3" /> Source
                </button>
                <button 
                    onClick={() => setActiveView('INSPECTOR')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold transition-all flex items-center gap-2 uppercase tracking-wider
                    ${activeView === 'INSPECTOR' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Microscope className="w-3 h-3" /> Inspector
                </button>
            </div>
            
            <button 
              onClick={() => { setIsCapturing(!isCapturing); setPackets([]); }}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg
                ${isCapturing 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
            >
              {isCapturing ? <Square className="w-3 h-3 fill-current" /> : <Radio className="w-3 h-3" />}
              {isCapturing ? 'Stop Capture' : 'Live Capture'}
            </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeView === 'DASHBOARD' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                <div className="flex flex-col gap-4 min-h-0">
                  <div className="relative flex-1 glass-panel rounded-xl overflow-hidden flex flex-col border border-slate-700">
                    <div className="bg-slate-800/80 p-3 border-b border-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        {fileName ? fileName : 'Diagnostic Source'}
                      </span>
                      {logs && (
                          <button onClick={() => {setLogs(''); setFileName(null);}} className="text-slate-500 hover:text-red-400">
                              <X className="w-4 h-4" />
                          </button>
                      )}
                    </div>
                    
                    {logs ? (
                        <div className="flex-1 relative">
                            {isPcapHex && <div className="absolute top-2 right-4 z-10 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-lg uppercase">Binary Stream</div>}
                            <textarea
                                className={`flex-1 w-full h-full bg-slate-900/30 p-6 font-mono text-xs focus:outline-none resize-none whitespace-pre overflow-y-auto custom-scroll leading-relaxed ${isPcapHex ? 'text-indigo-300 break-all' : 'text-green-400/90'}`}
                                placeholder="Paste log text here..."
                                value={logs}
                                onChange={(e) => setLogs(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 m-6 rounded-xl bg-slate-800/10 hover:bg-slate-800/20 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-12 h-12 text-slate-600 mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-slate-400 font-bold">Import PCAP or Log File</p>
                            <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-widest">Supports .pcap, .txt, .log</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pcap,.txt,.log,.csv" onChange={handleFileUpload} />
                        </div>
                    )}
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !logs}
                    className={`py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg
                      ${loading || !logs ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}
                  >
                    {loading ? <LoadingSpinner /> : <><Activity className="w-5 h-5" /> Analyze Import</>}
                  </button>
                </div>

                <div className="flex flex-col min-h-0">
                   {result ? (
                     <div className="flex-1 glass-panel rounded-xl p-6 overflow-y-auto space-y-6 border-l-4 border-l-purple-500 border border-slate-700 shadow-2xl custom-scroll">
                       <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                         <h3 className="text-lg font-bold text-white uppercase tracking-tight">AI Diagnostic Report</h3>
                         <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${result.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                            {result.severity} Priority
                         </span>
                       </div>
                       <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
                         <h4 className="text-[10px] font-extrabold text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2"><Info className="w-3 h-3" /> Summary</h4>
                         <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{result.summary}</p>
                       </div>
                       <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-widest"><AlertTriangle className="w-4 h-4 text-orange-400" /> Anomalies</h4>
                            <ul className="space-y-2">{result.potentialIssues.map((issue, idx) => (<li key={idx} className="bg-red-900/10 p-3 rounded-lg border border-red-500/20 text-red-200 text-xs font-mono">{issue}</li>))}</ul>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-widest"><CheckCircle className="w-4 h-4 text-green-500" /> Remediation</h4>
                            <ul className="space-y-3">{result.recommendations.map((rec, idx) => (<li key={idx} className="text-xs text-slate-300 flex items-start gap-3"><div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5">{idx+1}</div><span>{rec}</span></li>))}</ul>
                          </div>
                       </div>
                     </div>
                   ) : (
                     <div className="flex-1 glass-panel rounded-xl flex flex-col items-center justify-center text-slate-600 p-8 border-2 border-dashed border-slate-800 bg-slate-900/10">
                       <Cpu className="w-16 h-16 mb-4 opacity-10" />
                       <h3 className="text-lg font-bold uppercase tracking-widest opacity-30">Awaiting Data</h3>
                       <p className="text-xs text-center max-w-xs mt-2 opacity-30">Upload a PCAP or use Live Capture to begin dissection.</p>
                     </div>
                   )}
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col gap-3 h-full min-h-0 animate-fadeIn">
                {/* Pane 1: Packet List */}
                <div className="flex-[1.5] bg-white rounded-xl overflow-hidden flex flex-col border border-slate-300 min-h-0 shadow-2xl">
                    <div className="bg-[#f0f0f0] px-4 py-2 border-b border-slate-300 flex items-center justify-between select-none">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <List className="w-3.5 h-3.5" /> Packet List Pane
                        </span>
                        {isCapturing && <span className="text-[9px] font-bold text-red-600 animate-pulse uppercase tracking-widest flex items-center gap-2"><Radio className="w-3 h-3" /> Live Capture eth0</span>}
                    </div>
                    <div className="bg-[#f0f0f0] px-4 py-1 grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-600 border-b border-slate-300 select-none">
                        <div className="col-span-1">No.</div>
                        <div className="col-span-1">Time</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-2">Destination</div>
                        <div className="col-span-1">Protocol</div>
                        <div className="col-span-1 text-center">Length</div>
                        <div className="col-span-4">Info</div>
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scroll bg-white">
                        {packets.map((pkt) => (
                            <div key={pkt.no} onClick={() => setSelectedPacket(pkt)} className={`grid grid-cols-12 gap-2 px-4 py-0.5 cursor-pointer text-[10px] font-mono border-b border-slate-100 transition-colors ${selectedPacket?.no === pkt.no ? 'bg-[#2b5dff] text-white' : getProtocolColorClass(pkt.protocol)}`}>
                                <div className="col-span-1">{pkt.no}</div>
                                <div className="col-span-1">{pkt.time.toFixed(6)}</div>
                                <div className="col-span-2 truncate">{pkt.source}</div>
                                <div className="col-span-2 truncate">{pkt.destination}</div>
                                <div className="col-span-1 font-bold">{pkt.protocol}</div>
                                <div className="col-span-1 text-center">{pkt.length}</div>
                                <div className="col-span-4 truncate">{pkt.info}</div>
                            </div>
                        ))}
                        {packets.length === 0 && <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">No packets in buffer. Load source or start capture.</div>}
                    </div>
                </div>

                {/* Bottom Row: Details and Bytes */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
                    <div className="bg-[#f8fafc] border border-slate-300 rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-[#e2e8f0] px-4 py-2 border-b border-slate-300 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-2"><Microscope className="w-3.5 h-3.5" /> Details Pane</div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scroll text-[10px]">
                            {selectedPacket ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2"><ChevronDown className="w-3.5 h-3.5 text-slate-500" /><span className="font-extrabold">Frame {selectedPacket.no}: {selectedPacket.length} bytes</span></div>
                                    {[
                                      { label: 'Layer 2: Ethernet II', val: selectedPacket.details.ethernet },
                                      { label: 'Layer 3: IP v4', val: selectedPacket.details.ip },
                                      { label: 'Layer 4: ' + selectedPacket.protocol, val: selectedPacket.details.transport },
                                      { label: 'Layer 7: Data', val: selectedPacket.details.application }
                                    ].map((l, i) => l.val && (
                                      <div key={i} className="flex flex-col pl-2"><div className="flex items-center gap-1 font-extrabold text-slate-800 uppercase text-[9px]"><ChevronDown className="w-3 h-3 text-slate-400" /> {l.label}</div><div className="text-slate-600 font-mono italic pl-5 border-l-2 border-slate-200 ml-1 mt-1">{l.val}</div></div>
                                    ))}
                                </div>
                            ) : <div className="h-full flex items-center justify-center text-slate-400 italic">Select a packet to dissect</div>}
                        </div>
                    </div>
                    <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-inner">
                        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Hex Pane</div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scroll font-mono text-[10px] text-green-400/90 leading-relaxed bg-black/20">
                            {selectedPacket ? <pre className="whitespace-pre">{formatHex(selectedPacket.bytes)}</pre> : <div className="h-full flex items-center justify-center text-slate-600 italic">No stream selected</div>}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ToolAnalyzer;
