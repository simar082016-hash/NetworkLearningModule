
import React, { useState } from 'react';
import { simulateSSLCheck } from '../services/geminiService';
import { SSLCheckResult } from '../types';
import { Lock, ShieldCheck, Calendar, Link, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const SSLShopperView: React.FC = () => {
  const [domain, setDomain] = useState('google.com');
  const [result, setResult] = useState<SSLCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!domain) return;
    setLoading(true);
    const data = await simulateSSLCheck(domain);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="text-emerald-400" />
            SSL Checker
          </h2>
          <p className="text-slate-400 mt-1">Simulate certificate chain verification and expiration.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
         <span className="text-slate-400 font-mono text-sm">Hostname:</span>
         <input 
            type="text" 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-emerald-500 font-mono flex-1"
            placeholder="example.com"
         />
         <button 
            onClick={handleCheck}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
         >
            {loading ? <LoadingSpinner /> : 'Check SSL'}
         </button>
      </div>

      <div className="flex-1 glass-panel rounded-lg overflow-y-auto p-8 border border-slate-700">
          {loading ? (
              <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
          ) : result ? (
              <div className="max-w-2xl mx-auto space-y-8">
                  {/* Summary Card */}
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600 text-center">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShieldCheck className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{result.commonName}</h3>
                      <p className="text-slate-400 mb-4">Issued by {result.issuer}</p>
                      
                      <div className="flex items-center justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                             <Calendar className="w-4 h-4 text-blue-400" />
                             <span>Expires in <strong className={result.daysLeft < 30 ? 'text-red-400' : 'text-white'}>{result.daysLeft} days</strong></span>
                          </div>
                      </div>
                  </div>

                  {/* Chain Visualizer */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Certificate Chain</h4>
                      <div className="space-y-4 relative">
                          {/* Vertical Line */}
                          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-700 -z-10"></div>

                          {result.chain.map((cert, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-lg border border-slate-700 shadow-sm">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                                      ${cert.status === 'Valid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {cert.status === 'Valid' ? <Link className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-200">{cert.name}</p>
                                      <p className={`text-xs font-semibold mt-1 ${cert.status === 'Valid' ? 'text-green-500' : 'text-red-500'}`}>
                                          {cert.status}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                  <Lock className="w-16 h-16 mb-4" />
                  <p>Check if your SSL Certificate is installed correctly.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default SSLShopperView;
