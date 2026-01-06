
import React, { useState, useRef, useEffect } from 'react';
import { runTerminalCommand } from '../services/geminiService';
import { DNSRecord } from '../types';
import { Terminal as TerminalIcon, Play, RefreshCw, AlertCircle } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'system';
  content: string;
}

interface Props {
    customRecords?: DNSRecord[];
}

const NetworkSimulator: React.FC<Props> = ({ customRecords }) => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'NetMastery OS [Version 1.0.24]' },
    { type: 'system', content: '(c) 2025 NetMastery AI. All rights reserved.' },
    { type: 'system', content: ' ' },
    { type: 'system', content: 'Type "help" for available commands.' },
    { type: 'system', content: ' ' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    setInput('');
    setHistory(prev => [...prev, { type: 'input', content: cmd }]);
    setIsProcessing(true);

    if (cmd.toLowerCase() === 'clear' || cmd.toLowerCase() === 'cls') {
      setHistory([]);
      setIsProcessing(false);
      return;
    }

    if (cmd.toLowerCase() === 'help') {
        const helpText = `
Available Commands:
  ping <target>       - Check connectivity to host
  tracert <target>    - Trace path to host
  nslookup <target>   - Query DNS records (Includes custom simulated records)
  dig <target>        - Query DNS records (Advanced)
  cls / clear         - Clear terminal screen
        `;
        setHistory(prev => [...prev, { type: 'output', content: helpText }]);
        setIsProcessing(false);
        return;
    }

    const output = await runTerminalCommand(cmd, customRecords);
    setHistory(prev => [...prev, { type: 'output', content: output }]);
    setIsProcessing(false);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TerminalIcon className="text-emerald-400" />
            Live Diagnostic Simulator
          </h2>
          <p className="text-slate-400 mt-1">
            Real-time CLI environment to practice Ping, Traceroute, and Pathping on simulated networks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-900/50">
           <AlertCircle className="w-4 h-4" />
           <span>Simulation Environment</span>
        </div>
      </div>

      <div 
        className="flex-1 bg-black rounded-lg border border-slate-700 shadow-2xl flex flex-col overflow-hidden font-mono text-sm"
        onClick={focusInput}
      >
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-2 text-slate-400 text-xs">cmd.exe - Administrator</span>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 overflow-y-auto custom-scroll" ref={scrollRef}>
            {history.map((line, idx) => (
                <div key={idx} className="mb-1 whitespace-pre-wrap break-words leading-relaxed">
                    {line.type === 'input' ? (
                        <div className="text-slate-200">
                            <span className="text-slate-400 mr-2">C:\Users\Admin&gt;</span>
                            {line.content}
                        </div>
                    ) : (
                        <div className="text-emerald-500 font-mono">
                            {line.content}
                        </div>
                    )}
                </div>
            ))}
            
            {/* Input Line */}
            <form onSubmit={handleCommand} className="flex items-center mt-2">
                <span className="text-slate-400 mr-2 shrink-0">C:\Users\Admin&gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600"
                    autoFocus
                    disabled={isProcessing}
                    autoComplete="off"
                />
                {isProcessing && (
                    <span className="animate-pulse text-emerald-500 ml-2">_</span>
                )}
            </form>
        </div>
      </div>

      {/* Helper Chips */}
      <div className="flex gap-2 flex-wrap">
        <button 
            onClick={() => { setInput('nslookup www.techlearnersera.com'); inputRef.current?.focus(); }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 border border-slate-700 transition-colors"
        >
            nslookup techlearnersera.com
        </button>
        <button 
            onClick={() => { setInput('tracert login.salesforce.com'); inputRef.current?.focus(); }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 border border-slate-700 transition-colors"
        >
            tracert login.salesforce.com
        </button>
        <button 
            onClick={() => { setInput('dig any techlearnersera.com'); inputRef.current?.focus(); }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 border border-slate-700 transition-colors"
        >
            dig any techlearnersera.com
        </button>
      </div>
    </div>
  );
};

export default NetworkSimulator;
