
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Square, Terminal, Shield, AlertCircle, RefreshCw, Send, Trash2 } from 'lucide-react';
import { AuditLog } from '../types';

interface Props {
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

interface EventMessage {
  id: string;
  timestamp: number;
  channel: string;
  replayId: number;
  payload: any;
}

const PlatformEventMonitor: React.FC<Props> = ({ onAction }) => {
  const [channel, setChannel] = useState('/event/Order_Event__e');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [events, setEvents] = useState<EventMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const handleSubscribe = () => {
    setLoading(true);
    setTimeout(() => {
      setIsSubscribed(true);
      setLoading(false);
      onAction?.('Lead Engineer', '#facc15', 'Subscribed to Event Bus', `Channel: ${channel}`, 'SYSTEM');
    }, 800);
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    onAction?.('Lead Engineer', '#facc15', 'Unsubscribed', `Channel: ${channel}`, 'SYSTEM');
  };

  const clearLogs = () => setEvents([]);

  const simulateEvent = () => {
    if (!isSubscribed) return;
    const newEvent: EventMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      channel,
      replayId: Math.floor(Math.random() * 100000),
      payload: {
        Order_Number__c: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
        Status__c: 'Processing',
        User_Id__c: '0054W00000AXyqZ',
        Amount__c: (Math.random() * 1000).toFixed(2)
      }
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const simulateError = () => {
      setError("403::Organization is over its event limit");
      setIsSubscribed(false);
      onAction?.('Lead Engineer', '#facc15', 'Bus Error Encountered', '403 Forbidden: Event Limit Exceeded', 'SECURITY');
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Platform Event Monitor
          </h2>
          <p className="text-slate-400 mt-1">Debug real-time event-driven streams using CometD/Bayeux simulation.</p>
        </div>
        {error && (
            <button 
                onClick={() => setError(null)}
                className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2"
            >
                <AlertCircle className="w-3 h-3" /> Dismiss Error
            </button>
        )}
      </div>

      <div className="bg-slate-900 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 border border-slate-700">
         <div className="flex flex-col shrink-0">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Protocol</span>
             <span className="text-xs font-bold text-white">Streaming API (CometD)</span>
         </div>
         <div className="w-px h-8 bg-slate-700 hidden md:block"></div>
         <input 
            type="text" 
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            disabled={isSubscribed}
            className="bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-yellow-500 font-mono text-sm flex-1 disabled:opacity-50"
            placeholder="/event/YourEvent__e"
         />
         <div className="flex gap-2 w-full md:w-auto">
             {!isSubscribed ? (
                 <button 
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="flex-1 md:flex-none bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                 >
                    {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                    Connect
                 </button>
             ) : (
                 <button 
                    onClick={handleUnsubscribe}
                    className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                    <Square className="w-4 h-4" /> Disconnect
                 </button>
             )}
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          <div className="lg:col-span-2 flex flex-col glass-panel rounded-xl overflow-hidden border border-slate-700">
              <div className="bg-slate-800/80 p-3 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Event Stream
                  </span>
                  <div className="flex gap-2">
                      <button 
                        onClick={clearLogs}
                        className="text-slate-500 hover:text-white p-1"
                        title="Clear Logs"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              </div>
              
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scroll bg-black/40">
                  {error && (
                      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded text-red-400">
                          <p className="font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> ERROR_403</p>
                          <p className="mt-1">{error}</p>
                          <p className="mt-2 text-[10px] opacity-70">Hint: Check Daily Event Delivery limits in Salesforce Setup.</p>
                      </div>
                  )}

                  {!isSubscribed && !error && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                          <Zap className="w-12 h-12 opacity-10" />
                          <p>Waiting for handshake...</p>
                      </div>
                  )}

                  {events.map(event => (
                      <div key={event.id} className="bg-slate-800/40 border border-slate-700/50 rounded p-3 animate-slideIn">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-2 border-b border-slate-700/30 pb-1">
                              <span>ReplayId: {event.replayId}</span>
                              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <pre className="text-yellow-400/90 whitespace-pre-wrap">
                              {JSON.stringify(event.payload, null, 2)}
                          </pre>
                      </div>
                  ))}
              </div>
          </div>

          <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-xl border border-slate-700">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4 text-yellow-400" />
                      Test Control
                  </h3>
                  <div className="space-y-4">
                      <button 
                        disabled={!isSubscribed}
                        onClick={simulateEvent}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 font-semibold"
                      >
                          <Zap className="w-4 h-4" /> Publish Mock Event
                      </button>
                      <button 
                        disabled={!isSubscribed}
                        onClick={simulateError}
                        className="w-full py-3 bg-red-900/10 hover:bg-red-900/20 text-red-400 rounded-lg border border-red-900/30 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 font-semibold"
                      >
                          <AlertCircle className="w-4 h-4" /> Inject Bus Error
                      </button>
                  </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-slate-700 flex-1">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Debug Console
                  </h3>
                  <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded border border-slate-800">
                          <p className="text-slate-500 uppercase font-bold mb-1">Status</p>
                          <p className={isSubscribed ? 'text-green-400' : 'text-slate-500'}>
                              {isSubscribed ? 'Active Long-Polling' : 'Disconnected'}
                          </p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded border border-slate-800">
                          <p className="text-slate-500 uppercase font-bold mb-1">Metrics</p>
                          <p className="text-slate-300">Total Received: {events.length}</p>
                          <p className="text-slate-300 mt-1">Retention: 72 Hours</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded border border-slate-800">
                          <p className="text-slate-500 uppercase font-bold mb-1">Architecture</p>
                          <p className="text-slate-400 leading-relaxed">
                              This simulator implements the <strong>Bayeux protocol</strong>. Salesforce Platform Events are published to a central <strong>Event Bus</strong> where subscribers receive them in order.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PlatformEventMonitor;
