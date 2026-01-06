
import React, { useState } from 'react';
import { DNSRecord, AuditLog, ViewMode } from '../types';
import { Server, Plus, Trash2, Globe, ShieldCheck, Clock, Search, Info, AlertTriangle, Save, Terminal, ExternalLink, CheckCircle2 } from 'lucide-react';

interface Props {
  records: DNSRecord[];
  setRecords: React.Dispatch<React.SetStateAction<DNSRecord[]>>;
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
  onNavigate?: (mode: ViewMode) => void;
}

const DNSManager: React.FC<Props> = ({ records, setRecords, onAction, onNavigate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<DNSRecord>>({
    type: 'A',
    name: 'www',
    value: '1.2.3.4',
    ttl: 300
  });

  const handleAdd = () => {
    if (!newRecord.name || !newRecord.value) return;
    
    const record: DNSRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: newRecord.type as any,
      name: newRecord.name,
      value: newRecord.value,
      ttl: newRecord.ttl || 300,
      status: 'Pending'
    };

    setRecords(prev => [...prev, record]);
    setIsAdding(false);
    
    // Simulate propagation
    setTimeout(() => {
        setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'Propagated' } : r));
    }, 5000);

    onAction?.('Lead Engineer', '#3b82f6', 'DNS Record Added', `${record.type} ${record.name} -> ${record.value}`, 'CHANGE');
  };

  const handleDelete = (id: string) => {
    const record = records.find(r => r.id === id);
    setRecords(prev => prev.filter(r => r.id !== id));
    onAction?.('Lead Engineer', '#3b82f6', 'DNS Record Deleted', `${record?.type} ${record?.name}`, 'CHANGE');
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-blue-400" />
            DNS Zone Manager (Simulator)
          </h2>
          <p className="text-slate-400 mt-1">Configure simulated DNS records for <strong>techlearnersera.com</strong> and other domains.</p>
        </div>
        <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
        >
            <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Main Records Table */}
          <div className="lg:col-span-3 glass-panel rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-2xl">
              <div className="bg-slate-900/50 p-4 border-b border-slate-700 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3">Host / Name</div>
                  <div className="col-span-4">Value / Points to</div>
                  <div className="col-span-1">TTL</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Action</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll">
                  {records.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 space-y-4">
                          <Search className="w-16 h-16" />
                          <p>No custom records configured. Add one to see it in diagnostics.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-800">
                          {records.map(record => (
                              <div key={record.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors">
                                  <div className="col-span-2">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold border 
                                        ${record.type === 'A' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                                          record.type === 'CNAME' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                          record.type === 'MX' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                                          'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                                          {record.type}
                                      </span>
                                  </div>
                                  <div className="col-span-3 font-mono text-sm text-slate-200 truncate">
                                      {record.name}
                                  </div>
                                  <div className="col-span-4 font-mono text-sm text-blue-300 truncate">
                                      {record.value}
                                  </div>
                                  <div className="col-span-1 text-xs text-slate-500">
                                      {record.ttl}s
                                  </div>
                                  <div className="col-span-1">
                                      <div className={`flex items-center gap-1.5 text-[10px] font-bold
                                        ${record.status === 'Propagated' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>
                                          <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'Propagated' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                          {record.status}
                                      </div>
                                  </div>
                                  <div className="col-span-1 text-right">
                                      <button 
                                        onClick={() => handleDelete(record.id)}
                                        className="text-slate-600 hover:text-red-400 transition-colors"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          {/* Sidebar / Verification */}
          <div className="space-y-6">
              <div className="glass-panel p-6 rounded-xl border border-blue-500/30 bg-blue-900/10">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      Verify Record Success
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Once a record shows <strong>Propagated</strong>, you can verify it using these tools:
                  </p>
                  <div className="space-y-2">
                      <button 
                        onClick={() => onNavigate?.(ViewMode.SIMULATOR)}
                        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded border border-slate-700 transition-all group"
                      >
                          <div className="flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-slate-200">Terminal (nslookup)</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                      </button>
                      <button 
                        onClick={() => onNavigate?.(ViewMode.CDN_CHECKER)}
                        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded border border-slate-700 transition-all group"
                      >
                          <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-slate-200">CDN Validator</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                      </button>
                  </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-slate-700">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-400" />
                      DNS Tips
                  </h3>
                  <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                      <p>
                        <strong>CNAME for CDNs:</strong> Point subdomains (like <code>www</code>) to edge hostnames (e.g., <code>d2x...cloudfront.net</code>).
                      </p>
                      <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                        Note: Simulation propagation takes ~5 seconds. In real world, TTL values define propagation time.
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* Add Modal Overlay */}
      {isAdding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slideUp">
                  <div className="p-6 border-b border-slate-800 bg-slate-800/50">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <Plus className="text-blue-400" />
                          Add DNS Record
                      </h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                              <select 
                                value={newRecord.type}
                                onChange={(e) => setNewRecord({...newRecord, type: e.target.value as any})}
                                className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                              >
                                  <option value="A">A (Address)</option>
                                  <option value="CNAME">CNAME (Alias)</option>
                                  <option value="MX">MX (Mail Exchange)</option>
                                  <option value="TXT">TXT (Text)</option>
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">TTL (Seconds)</label>
                              <input 
                                type="number" 
                                value={newRecord.ttl}
                                onChange={(e) => setNewRecord({...newRecord, ttl: parseInt(e.target.value)})}
                                className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                              />
                          </div>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Host / Name</label>
                          <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={newRecord.name}
                                onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                                placeholder="e.g. www"
                                className="flex-1 bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                              />
                              <span className="text-slate-600 font-mono text-xs">.techlearnersera.com</span>
                          </div>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Value / Points To</label>
                          <input 
                            type="text" 
                            value={newRecord.value}
                            onChange={(e) => setNewRecord({...newRecord, value: e.target.value})}
                            placeholder={newRecord.type === 'CNAME' ? 'lb.akamai.net' : '1.2.3.4'}
                            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                          />
                      </div>
                  </div>
                  <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAdd}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/30"
                      >
                        <Save className="w-4 h-4" /> Save Record
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DNSManager;
