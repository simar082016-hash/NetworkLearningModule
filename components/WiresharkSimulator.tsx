
import React, { useState, useEffect, useRef } from 'react';
// Fixed: Import generatePacketBatch from geminiService, but Packet from types
import { generatePacketBatch } from '../services/geminiService';
import { AuditLog, Packet } from '../types';
import { Play, Square, Activity, Search, Filter, Layers, FileText, ChevronRight, ChevronDown, Download, Terminal, Trash2, List } from 'lucide-react';

interface Props {
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

const WiresharkSimulator: React.FC<Props> = ({ onAction }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const captureInterval = useRef<number | null>(null);

  useEffect(() => {
    if (isCapturing) {
      startCapture();
    } else {
      stopCapture();
    }
    return () => stopCapture();
  }, [isCapturing]);

  useEffect(() => {
    if (scrollRef.current && isCapturing) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [packets]);

  const startCapture = () => {
    onAction?.('Lead Engineer', '#4f46e5', 'Started Live Capture', `Filter: ${filter || 'No Filter'}`, 'DIAGNOSTIC');
    fetchBatch();
    captureInterval.current = window.setInterval(() => {
        if (!loading) fetchBatch();
    }, 5000);
  };

  const stopCapture = () => {
    if (captureInterval.current) {
        clearInterval(captureInterval.current);
        captureInterval.current = null;
    }
  };

  const fetchBatch = async () => {
    setLoading(true);
    const nextNo = packets.length > 0 ? packets[packets.length - 1].no + 1 : 1;
    try {
        const batch = await generatePacketBatch(filter, 5, nextNo);
        setPackets(prev => [...prev, ...batch]);
    } catch (e) {
        console.error("Capture stream error", e);
    } finally {
        setLoading(false);
    }
  };

  const clearCapture = () => {
    setPackets([]);
    setSelectedPacket(null);
  };

  /**
   * Generates a valid binary .pcap file
   * Reference: https://wiki.wireshark.org/Development/LibpcapFileFormat
   */
  const handleExport = () => {
    if (packets.length === 0) return;

    // 1. Convert hex strings to Uint8Arrays
    const packetDataBuffers = packets.map(p => {
        const hex = p.bytes.replace(/[^0-9A-Fa-f]/g, '');
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return { data: bytes, time: p.time };
    });

    // 2. Calculate total size: 24 (Global Header) + Sum of (16 Packet Header + Data)
    const totalSize = 24 + packetDataBuffers.reduce((acc, curr) => acc + 16 + curr.data.length, 0);
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;

    // 3. Write Global Header (24 bytes)
    view.setUint32(offset, 0xa1b2c3d4, false); offset += 4; // Magic Number
    view.setUint16(offset, 2, false); offset += 2;          // Version Major
    view.setUint16(offset, 4, false); offset += 2;          // Version Minor
    view.setUint32(offset, 0, false); offset += 4;          // Thiszone
    view.setUint32(offset, 0, false); offset += 4;          // Sigfigs
    view.setUint32(offset, 65535, false); offset += 4;      // Snaplen
    view.setUint32(offset, 1, false); offset += 4;          // Network (Ethernet)

    // 4. Write Packets
    packetDataBuffers.forEach(pkt => {
        // Packet Header (16 bytes)
        const seconds = Math.floor(pkt.time);
        const microseconds = Math.floor((pkt.time - seconds) * 1000000);
        
        view.setUint32(offset, seconds, false); offset += 4;      // Timestamp Seconds
        view.setUint32(offset, microseconds, false); offset += 4; // Timestamp Microseconds
        view.setUint32(offset, pkt.data.length, false); offset += 4; // Incl Len
        view.setUint32(offset, pkt.data.length, false); offset += 4; // Orig Len
        
        // Packet Data
        const uint8View = new Uint8Array(buffer, offset, pkt.data.length);
        uint8View.set(pkt.data);
        offset += pkt.data.length;
    });

    // 5. Download Blob
    const blob = new Blob([buffer], { type: 'application/vnd.tcpdump.pcap' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capture_${new Date().getTime()}.pcap`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onAction?.('Lead Engineer', '#4f46e5', 'PCAP Exported', `Generated binary .pcap with ${packets.length} packets`, 'SYSTEM');
  };

  const getProtocolColorClass = (proto: string) => {
    const p = proto.toUpperCase();
    if (p.includes('TCP')) return 'bg-[#e7e6ff] text-[#2c2b5e]'; // Light purple
    if (p.includes('HTTP')) return 'bg-[#e4ffc7] text-[#2b4c11]'; // Light green
    if (p.includes('DNS')) return 'bg-[#cceeff] text-[#004d73]'; // Light blue
    if (p.includes('TLS') || p.includes('SSL')) return 'bg-[#f4e0ff] text-[#4d1f6b]'; // Purple
    if (p.includes('ICMP')) return 'bg-[#fce0e0] text-[#730000]'; // Light red
    if (p.includes('UDP')) return 'bg-[#d2f4ff] text-[#004257]'; // Cyan
    return 'bg-white text-slate-900';
  };

  /**
   * Standard Wireshark Hex Formatter
   * 16 bytes per line: Address Offset | Hex values | ASCII representation
   */
  const formatHex = (hex: string) => {
    const lines = [];
    // Ensure we have at least some data
    const bytes = hex.match(/.{1,2}/g) || [];
    
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-400" />
            Wireshark Live Simulator
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Professional 3-pane packet analysis interface.</p>
        </div>
        <div className="flex gap-2">
            {!isCapturing ? (
                <button onClick={() => setIsCapturing(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg">
                    <Play className="w-4 h-4 fill-current" /> Start
                </button>
            ) : (
                <button onClick={() => setIsCapturing(false)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg">
                    <Square className="w-4 h-4 fill-current" /> Stop
                </button>
            )}
            <button onClick={handleExport} disabled={packets.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50">
                <Download className="w-4 h-4" /> Export (.pcap)
            </button>
            <button onClick={clearCapture} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold border border-slate-700 transition-all">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#1e293b] p-2 rounded border border-slate-700 flex items-center gap-3">
         <Filter className="w-4 h-4 text-slate-500 ml-2" />
         <input 
            type="text" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-green-400 placeholder-slate-600"
            placeholder="Apply a display filter ... <e.g. tcp.port == 443>"
         />
      </div>

      {/* 3-Pane Analysis Workspace */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
          
          {/* Pane 1: Packet List (Summary) */}
          <div className="flex-[2] bg-white rounded overflow-hidden flex flex-col shadow-inner">
              <div className="bg-[#f0f0f0] px-4 py-1.5 grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-600 border-b border-slate-300 select-none">
                  <div className="col-span-1">No.</div>
                  <div className="col-span-1">Time</div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-2">Destination</div>
                  <div className="col-span-1">Protocol</div>
                  <div className="col-span-1">Length</div>
                  <div className="col-span-4">Info</div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scroll bg-white">
                  {packets.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2">
                          <Activity className="w-12 h-12" />
                          <p className="text-sm font-semibold">Ready to capture traffic...</p>
                      </div>
                  ) : (
                      <div>
                          {packets.map((pkt) => (
                              <div 
                                key={pkt.no}
                                onClick={() => setSelectedPacket(pkt)}
                                className={`grid grid-cols-12 gap-2 px-4 py-0.5 cursor-pointer text-[11px] font-mono border-b border-slate-100 transition-colors
                                    ${selectedPacket?.no === pkt.no ? 'bg-[#2b5dff] text-white' : `${getProtocolColorClass(pkt.protocol)}`}`}
                              >
                                  <div className="col-span-1">{pkt.no}</div>
                                  <div className="col-span-1">{pkt.time.toFixed(6)}</div>
                                  <div className="col-span-2 truncate">{pkt.source}</div>
                                  <div className="col-span-2 truncate">{pkt.destination}</div>
                                  <div className="col-span-1 font-bold">{pkt.protocol}</div>
                                  <div className="col-span-1">{pkt.length}</div>
                                  <div className="col-span-4 truncate">{pkt.info}</div>
                              </div>
                          ))}
                          {loading && <div className="px-4 py-1 text-[10px] text-slate-400 italic animate-pulse bg-slate-50">Capturing packets...</div>}
                      </div>
                  )}
              </div>
          </div>

          {/* Bottom Dual Panes */}
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
              
              {/* Pane 2: Packet Details (Layer-by-layer Dissection) */}
              <div className="bg-[#f8fafc] border border-slate-300 rounded overflow-hidden flex flex-col">
                  <div className="bg-[#e2e8f0] px-3 py-1 border-b border-slate-300 flex items-center gap-2 text-[10px] font-bold text-slate-700 uppercase">
                      <List className="w-3 h-3" /> Packet Details
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 custom-scroll text-[11px]">
                      {selectedPacket ? (
                          <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-1">
                                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span className="font-bold">Frame {selectedPacket.no}: {selectedPacket.length} bytes on wire</span>
                              </div>
                              
                              <div className="pl-2 space-y-1">
                                <div className="flex items-start gap-2 text-slate-800">
                                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 uppercase text-[10px]">Layer 2: Ethernet II</span>
                                        <span className="text-slate-600 font-mono italic">{selectedPacket.details.ethernet}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-slate-800">
                                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 uppercase text-[10px]">Layer 3: Internet Protocol v4</span>
                                        <span className="text-slate-600 font-mono italic">{selectedPacket.details.ip}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-slate-800">
                                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 uppercase text-[10px]">Layer 4: {selectedPacket.protocol} Transport</span>
                                        <span className="text-slate-600 font-mono italic">{selectedPacket.details.transport}</span>
                                    </div>
                                </div>
                                {selectedPacket.details.application && (
                                    <div className="flex items-start gap-2 text-slate-800">
                                        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 uppercase text-[10px]">Layer 7: Application Data</span>
                                            <span className="text-slate-600 font-mono italic">{selectedPacket.details.application}</span>
                                        </div>
                                    </div>
                                )}
                              </div>
                          </div>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 italic">
                              Select a packet to dissect
                          </div>
                      )}
                  </div>
              </div>

              {/* Pane 3: Packet Bytes (Hex View) */}
              <div className="bg-[#1e293b] border border-slate-700 rounded overflow-hidden flex flex-col">
                  <div className="bg-slate-800 px-3 py-1 border-b border-slate-700 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <FileText className="w-3 h-3" /> Packet Bytes
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 custom-scroll font-mono text-[10px] text-green-400/90 leading-tight">
                      {selectedPacket ? (
                          <pre className="whitespace-pre">
                              {formatHex(selectedPacket.bytes)}
                          </pre>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-600 italic">
                              No data selected
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase px-1 border-t border-slate-800 pt-2">
          <div className="flex gap-4">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Packets: {packets.length}</span>
              <span>Filter: {filter || 'None'}</span>
              <span className={isCapturing ? 'text-green-400 animate-pulse' : ''}>
                  {isCapturing ? '● Live Capture' : '○ Capture Stopped'}
              </span>
          </div>
          <span className="text-slate-600">Interface: eth0 (Simulated)</span>
      </div>
    </div>
  );
};

export default WiresharkSimulator;
