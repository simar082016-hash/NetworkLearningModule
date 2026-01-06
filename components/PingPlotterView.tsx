
import React, { useState } from 'react';
import { simulatePingPlotter, PingPlotterHop } from '../services/geminiService';
import { Activity, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const PingPlotterView: React.FC = () => {
  const [target, setTarget] = useState('na1.salesforce.com');
  const [hops, setHops] = useState<PingPlotterHop[]>([]);
  const [loading, setLoading] = useState(false);

  const runTrace = async () => {
    if(!target) return;
    setLoading(true);
    const data = await simulatePingPlotter(target);
    setHops(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-orange-400" />
            PingPlotter Simulator
          </h2>
          <p className="text-slate-400 mt-1">Visualizing latency and packet loss per hop over time.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
         <span className="text-slate-400 font-mono text-sm">Target:</span>
         <input 
            type="text" 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600 focus:outline-none focus:border-orange-500 font-mono flex-1"
            placeholder="Enter hostname or IP..."
         />
         <button 
            onClick={runTrace}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
         >
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
            Trace
         </button>
      </div>

      <div className="flex-1 glass-panel rounded-lg overflow-hidden flex flex-col border border-slate-700">
        <div className="bg-slate-800/80 p-3 grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
            <div className="col-span-1">Hop</div>
            <div className="col-span-1">PL%</div>
            <div className="col-span-3">IP Address / Name</div>
            <div className="col-span-1 text-right">Avg</div>
            <div className="col-span-1 text-right">Cur</div>
            <div className="col-span-5">History (Simulated)</div>
        </div>

        {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        ) : hops.length > 0 ? (
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {hops.map((hop) => (
                    <div key={hop.hop} className="grid grid-cols-12 gap-4 items-center p-2 rounded hover:bg-slate-800/50 transition-colors text-sm border-b border-slate-800/50">
                        <div className="col-span-1 font-mono text-slate-500">{hop.hop}</div>
                        <div className="col-span-1 font-bold">
                            <span className={`${hop.pl > 0 ? 'text-red-500 bg-red-500/10 px-1 rounded' : 'text-slate-300'}`}>
                                {hop.pl}%
                            </span>
                        </div>
                        <div className="col-span-3 truncate">
                            <div className="text-slate-200">{hop.ip}</div>
                            <div className="text-slate-500 text-xs truncate">{hop.name}</div>
                        </div>
                        <div className="col-span-1 text-right font-mono text-slate-300">{hop.avg}ms</div>
                        <div className="col-span-1 text-right font-mono text-slate-300">{hop.cur}ms</div>
                        <div className="col-span-5 h-8 flex items-end gap-[1px] bg-slate-900/50 p-1 rounded">
                             {hop.history.map((val, idx) => (
                                 <div 
                                    key={idx}
                                    className={`flex-1 rounded-sm ${val === 0 ? 'bg-red-500 h-full' : 'bg-green-500/60'}`}
                                    style={{ 
                                        height: val === 0 ? '100%' : `${Math.min((val / 200) * 100, 100)}%` 
                                    }}
                                    title={val === 0 ? 'Timeout' : `${val}ms`}
                                 />
                             ))}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Activity className="w-16 h-16 mb-4 opacity-20" />
                <p>Enter a target and click Trace to start visualization.</p>
            </div>
        )}
      </div>

      {hops.length > 0 && (
          <div className="bg-slate-800/50 p-4 rounded text-xs text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
            <div>
                <p className="font-bold text-slate-300 mb-1">Analysis Tip:</p>
                <p>Look for <span className="text-red-400">vertical red bars</span> continuing through to the final hop. Packet loss that starts at a hop and continues to the destination indicates a real network issue. Loss at a single hop that recovers afterwards is likely Control Plane Policing (CoPP) and can be ignored.</p>
            </div>
          </div>
      )}
    </div>
  );
};

export default PingPlotterView;
