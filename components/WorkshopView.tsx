
import React, { useState, useEffect } from 'react';
import { generateWorkshopScenario } from '../services/geminiService';
import { Scenario, Module, AuditLog } from '../types';
import { Settings, Cpu, ChevronRight, CheckSquare, Server, Users, Square, Wifi, Share2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { LoadingSpinner } from './LoadingSpinner';
import CollaborationOverlay, { RemoteUser } from './CollaborationOverlay';

interface Props {
  activeModule: Module | null;
  onAction?: (name: string, color: string, action: string, details: string, type: AuditLog['type']) => void;
}

const WorkshopView: React.FC<Props> = ({ activeModule, onAction }) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Collaboration State
  const [isLive, setIsLive] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([
    { id: '1', name: 'Alex (Lead)', color: '#ec4899', x: 20, y: 30 },
    { id: '2', name: 'Sarah (DevOps)', color: '#3b82f6', x: 75, y: 60 },
    { id: '3', name: 'Mike (Sec)', color: '#eab308', x: 45, y: 80 }
  ]);

  const handleGenerate = async () => {
    if (!activeModule) return;
    setLoading(true);
    setCompletedSteps(new Set());
    const topic = activeModule.topics[Math.floor(Math.random() * activeModule.topics.length)];
    const data = await generateWorkshopScenario(topic, activeModule.difficulty);
    setScenario(data);
    setLoading(false);
    onAction?.('Lead Engineer', '#2563eb', 'Generated New Scenario', `Topic: ${topic} (${activeModule.difficulty})`, 'SYSTEM');
  };

  const toggleStep = (index: number, userName: string = 'Lead Engineer', userColor: string = '#2563eb') => {
    setCompletedSteps(prev => {
        const next = new Set(prev);
        const isChecking = !next.has(index);
        if (isChecking) {
            next.add(index);
            onAction?.(userName, userColor, 'Step Completed', `Resolved: ${scenario?.solution_steps[index].substring(0, 50)}...`, 'CHANGE');
        } else {
            next.delete(index);
        }
        return next;
    });
  };

  // Simulate remote user activity
  useEffect(() => {
    if (!isLive || !scenario) return;

    const interval = setInterval(() => {
        // Move users randomly
        setRemoteUsers(users => users.map(u => {
            const dx = (Math.random() - 0.5) * 15;
            const dy = (Math.random() - 0.5) * 15;
            return {
                ...u,
                x: Math.max(5, Math.min(95, u.x + dx)),
                y: Math.max(5, Math.min(95, u.y + dy))
            };
        }));

        // Randomly toggle steps to simulate other users working
        if (Math.random() > 0.92) {
            const randomStep = Math.floor(Math.random() * scenario.solution_steps.length);
            const randomUser = remoteUsers[Math.floor(Math.random() * remoteUsers.length)];
            if (!completedSteps.has(randomStep)) {
                toggleStep(randomStep, randomUser.name, randomUser.color);
            }
        }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, scenario, completedSteps, remoteUsers]);

  const handleLiveToggle = () => {
      const nextLive = !isLive;
      setIsLive(nextLive);
      onAction?.('Lead Engineer', '#2563eb', nextLive ? 'Session Started' : 'Session Ended', 'Workshop moved to collaborative multi-user environment', 'SECURITY');
  };

  if (!activeModule) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <p>Select a module from the sidebar to start a workshop.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-green-400" />
            Skill Workshop
          </h2>
          <p className="text-slate-400 mt-1">Generate realistic industry scenarios to test your skills.</p>
        </div>
        <div className="flex gap-3">
            {scenario && (
                 <button
                    onClick={handleLiveToggle}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all border
                    ${isLive 
                        ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                >
                    {isLive ? (
                        <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Session (4)
                        </>
                    ) : (
                        <>
                            <Users className="w-4 h-4" />
                            Collab Mode
                        </>
                    )}
                </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Settings className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'New Scenario'}
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
        </div>
      ) : scenario ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 relative">
          {isLive && <CollaborationOverlay users={remoteUsers} />}

          <div className="lg:col-span-2 overflow-y-auto pr-2 custom-scroll">
             <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-6 relative">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{scenario.title}</h3>
                    {isLive && (
                         <div className="flex -space-x-2">
                             <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800" title="Alex">AL</div>
                             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800" title="Sarah">SA</div>
                             <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800" title="Mike">MI</div>
                             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800" title="You">LE</div>
                         </div>
                    )}
                </div>
                
                <p className="text-slate-300 mb-4">{scenario.description}</p>
                
                <div className="bg-slate-900 rounded p-4 mb-4 border-l-4 border-blue-500">
                    <h4 className="text-sm font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                        <Server className="w-4 h-4" /> Topology
                    </h4>
                    <p className="font-mono text-sm text-slate-300 whitespace-pre-wrap">{scenario.topology}</p>
                </div>

                <div className="bg-slate-900 rounded p-4 border-l-4 border-red-500">
                    <h4 className="text-sm font-bold text-red-400 uppercase mb-2">The Issue</h4>
                    <p className="text-slate-300">{scenario.issue}</p>
                </div>

                {scenario.logs && (
                    <div className="mt-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">System Logs</h4>
                        <pre className="bg-black p-3 rounded text-green-500 font-mono text-xs overflow-x-auto border border-slate-800">
                            {scenario.logs}
                        </pre>
                    </div>
                )}
             </div>
          </div>

          <div className="glass-panel p-6 rounded-lg overflow-y-auto border-l border-slate-700 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckSquare className="text-blue-400" />
                Solution Checklist
            </h3>
            <div className="flex-1 space-y-3">
                {scenario.solution_steps.map((step, i) => (
                    <div 
                        key={i} 
                        onClick={() => toggleStep(i)}
                        className={`group flex gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none
                        ${completedSteps.has(i) 
                            ? 'bg-green-900/10 border-green-500/30' 
                            : 'bg-slate-800/30 border-transparent hover:bg-slate-800 hover:border-slate-600'}`}
                    >
                        <div className={`flex-shrink-0 mt-0.5 transition-colors ${completedSteps.has(i) ? 'text-green-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                            {completedSteps.has(i) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                        <div className={`text-sm ${completedSteps.has(i) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                            <MarkdownRenderer content={step} />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((completedSteps.size / scenario.solution_steps.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${(completedSteps.size / scenario.solution_steps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Select 'New Scenario' to begin a practical lab.</p>
            <p className="text-sm mt-2">Topic: <span className="text-blue-400 font-semibold">{activeModule.title}</span></p>
        </div>
      )}
    </div>
  );
};

export default WorkshopView;
