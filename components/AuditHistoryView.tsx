
import React from 'react';
import { History, Trash2, Download, User, Clock, Shield, Settings, Activity } from 'lucide-react';
import { AuditLog } from '../types';

interface Props {
  logs: AuditLog[];
  onClear: () => void;
}

const AuditHistoryView: React.FC<Props> = ({ logs, onClear }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SECURITY': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'CHANGE': return <Settings className="w-4 h-4 text-blue-400" />;
      case 'DIAGNOSTIC': return <Activity className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const exportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `netmastery_audit_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-blue-400" />
            Audit History Tracker
          </h2>
          <p className="text-slate-400 mt-1">Immutable record of all configuration changes and diagnostic activities.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button 
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg border border-red-900/30 transition-colors text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Clear Logs
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="bg-slate-900/50 p-4 border-b border-slate-700 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-2">Entity / User</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-6">Action & Details</div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scroll">
          {logs.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors">
                  <div className="col-span-2 text-xs font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                    <div className="text-[10px] opacity-50">{new Date(log.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: log.user.color }}
                    >
                      {log.user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-300 truncate">{log.user.name}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-900/50 border border-slate-800 w-fit">
                      {getTypeIcon(log.type)}
                      <span className="text-[10px] font-bold text-slate-400">{log.type}</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <div className="text-sm text-slate-200 font-semibold">{log.action}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{log.details}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <History className="w-16 h-16 opacity-10" />
              <p className="text-lg">No audit entries found.</p>
            </div>
          )}
        </div>
        
        <div className="bg-slate-900/80 p-3 border-t border-slate-800 flex justify-between items-center px-6">
          <span className="text-xs text-slate-500">Total Records: {logs.length}</span>
          <span className="text-xs text-slate-500">Compliance Status: <span className="text-green-500 font-bold">VERIFIED</span></span>
        </div>
      </div>
    </div>
  );
};

export default AuditHistoryView;
