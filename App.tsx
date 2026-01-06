
import React, { useState, useEffect, useCallback } from 'react';
import { MODULES } from './constants';
import { Module, ViewMode, AuditLog, DNSRecord } from './types';
import LessonView from './components/LessonView';
import WorkshopView from './components/WorkshopView';
import ToolAnalyzer from './components/ToolAnalyzer';
import NetworkSimulator from './components/NetworkSimulator';
import PingPlotterView from './components/PingPlotterView';
import ThousandEyesView from './components/ThousandEyesView';
import MxToolView from './components/MxToolView';
import SSLShopperView from './components/SSLShopperView';
import LabGuideView from './components/LabGuideView';
import HARAnalyzerView from './components/HARAnalyzerView';
import IdentityDebuggerView from './components/IdentityDebuggerView';
import DebuggingStrategyView from './components/DebuggingStrategyView';
import AuditHistoryView from './components/AuditHistoryView';
import CaseStudyView from './components/CaseStudyView';
import PlatformEventMonitor from './components/PlatformEventMonitor';
import MTRAnalyzerView from './components/MTRAnalyzerView';
import WiresharkSimulator from './components/WiresharkSimulator';
import CDNChecker from './components/CDNChecker';
import DNSManager from './components/DNSManager';
import { 
  Network, 
  Book, 
  Terminal, 
  Cpu, 
  Menu, 
  X,
  Layers,
  Shield,
  Cloud,
  Activity,
  Wrench,
  Wifi,
  Globe,
  MonitorPlay,
  Server,
  Lock,
  BookOpen,
  FileCode,
  AlertCircle,
  Key,
  History,
  Briefcase,
  Zap,
  ArrowRightLeft,
  Activity as WiresharkIcon,
  Database
} from 'lucide-react';

const App: React.FC = () => {
  const [currentModuleId, setCurrentModuleId] = useState<string>(MODULES[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LEARN);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('netmastery_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Custom DNS Records State
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>(() => {
    const saved = localStorage.getItem('netmastery_dns_records');
    return saved ? JSON.parse(saved) : [
        { id: '1', type: 'A', name: 'techlearnersera.com', value: '185.199.108.153', ttl: 3600, status: 'Propagated' },
        { id: '2', type: 'MX', name: 'techlearnersera.com', value: 'aspmx.l.google.com', ttl: 3600, status: 'Propagated' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('netmastery_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('netmastery_dns_records', JSON.stringify(dnsRecords));
  }, [dnsRecords]);

  const addAuditLog = useCallback((name: string, color: string, action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      user: { name, color },
      action,
      details,
      type
    };
    setAuditLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
  }, []);

  const activeModule = MODULES.find(m => m.id === currentModuleId) || MODULES[0];

  const getIconForModule = (id: string) => {
    switch (id) {
        case 'salesforce-net': return <Cloud className="w-4 h-4" />;
        case 'sf-platform-events': return <Zap className="w-4 h-4" />;
        case 'sf-troubleshooting': return <Activity className="w-4 h-4" />;
        case 'cisco-net': return <Network className="w-4 h-4" />;
        case 'cilax-net': return <Globe className="w-4 h-4" />;
        case 'net-tools': return <Wrench className="w-4 h-4" />;
        case 'troubleshooting': return <Activity className="w-4 h-4" />;
        default: return <Book className="w-4 h-4" />;
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.LEARN:
        return <LessonView module={activeModule} />;
      case ViewMode.WORKSHOP:
        return <WorkshopView activeModule={activeModule} onAction={addAuditLog} />;
      case ViewMode.ANALYZER:
        return <ToolAnalyzer onAction={addAuditLog} />;
      case ViewMode.HAR_ANALYZER:
        return <HARAnalyzerView onAction={addAuditLog} />;
      case ViewMode.IDENTITY_DEBUGGER:
        return <IdentityDebuggerView onAction={addAuditLog} />;
      case ViewMode.SIMULATOR:
        return <NetworkSimulator customRecords={dnsRecords} />;
      case ViewMode.PINGPLOTTER:
        return <PingPlotterView onAction={addAuditLog} />;
      case ViewMode.THOUSANDEYES:
        return <ThousandEyesView onAction={addAuditLog} />;
      case ViewMode.MXTOOL:
        return <MxToolView onAction={addAuditLog} />;
      case ViewMode.SSLSHOPPER:
        return <SSLShopperView onAction={addAuditLog} />;
      case ViewMode.PLATFORM_EVENTS:
        return <PlatformEventMonitor onAction={addAuditLog} />;
      case ViewMode.MTR:
        return <MTRAnalyzerView />;
      case ViewMode.WIRESHARK:
        return <WiresharkSimulator onAction={addAuditLog} />;
      case ViewMode.CDN_CHECKER:
        return <CDNChecker onAction={addAuditLog} customRecords={dnsRecords} />;
      case ViewMode.DNS_MANAGER:
        return <DNSManager records={dnsRecords} setRecords={setDnsRecords} onAction={addAuditLog} onNavigate={setViewMode} />;
      case ViewMode.LAB_GUIDE:
        return <LabGuideView onNavigate={setViewMode} />;
      case ViewMode.DEBUGGING_GUIDE:
        return <DebuggingStrategyView />;
      case ViewMode.AUDIT_LOG:
        return <AuditHistoryView logs={auditLogs} onClear={() => setAuditLogs([])} />;
      case ViewMode.USE_CASES:
        return <CaseStudyView onAction={addAuditLog} />;
      default:
        return <LessonView module={activeModule} />;
    }
  };

  const isToolView = [
      ViewMode.ANALYZER, ViewMode.SIMULATOR, ViewMode.PINGPLOTTER, ViewMode.THOUSANDEYES, 
      ViewMode.MXTOOL, ViewMode.SSLSHOPPER, ViewMode.HAR_ANALYZER, ViewMode.IDENTITY_DEBUGGER, 
      ViewMode.LAB_GUIDE, ViewMode.DEBUGGING_GUIDE, ViewMode.AUDIT_LOG, ViewMode.USE_CASES, 
      ViewMode.PLATFORM_EVENTS, ViewMode.MTR, ViewMode.WIRESHARK, ViewMode.CDN_CHECKER,
      ViewMode.DNS_MANAGER
  ].includes(viewMode);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] text-slate-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#1e293b] border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Network className="text-white w-5 h-5" />
                </div>
                <h1 className="font-bold text-lg text-white tracking-tight">NetMastery AI</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 custom-scroll">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Curriculum</div>
            <div className="space-y-1 mb-6">
                {MODULES.map((module) => (
                <button
                    key={module.id}
                    onClick={() => {
                    setCurrentModuleId(module.id);
                    if (isToolView) setViewMode(ViewMode.LEARN);
                    setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                    ${currentModuleId === module.id && !isToolView
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    {getIconForModule(module.id)}
                    <span className="font-medium">{module.title}</span>
                </button>
                ))}
            </div>
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Practice & History</div>
            <div className="space-y-1 mb-6">
                <button
                    onClick={() => { setViewMode(ViewMode.USE_CASES); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.USE_CASES ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <Briefcase className="w-4 h-4" /> <span>Business Case Studies</span>
                </button>
                <button
                    onClick={() => { setViewMode(ViewMode.DEBUGGING_GUIDE); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.DEBUGGING_GUIDE ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <AlertCircle className="w-4 h-4" /> <span>Troubleshoot Library</span>
                </button>
                <button
                    onClick={() => { setViewMode(ViewMode.AUDIT_LOG); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.AUDIT_LOG ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <History className="w-4 h-4" /> <span>Audit History</span>
                </button>
            </div>

            <div className="border-t border-slate-700 pt-4 mb-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Lab Tools</div>
                
                <div className="mb-3 space-y-1">
                     <button
                        onClick={() => { setViewMode(ViewMode.LAB_GUIDE); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.LAB_GUIDE ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <BookOpen className="w-4 h-4" /> <span>Lab Tools Guide</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <button
                        onClick={() => { setViewMode(ViewMode.DNS_MANAGER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.DNS_MANAGER ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Database className="w-4 h-4" /> <span>DNS Manager</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.WIRESHARK); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.WIRESHARK ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Activity className="w-4 h-4" /> <span>Wireshark Live</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.CDN_CHECKER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.CDN_CHECKER ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Cloud className="w-4 h-4" /> <span>CDN & Domain Checker</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.MTR); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.MTR ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <ArrowRightLeft className="w-4 h-4" /> <span>MTR / Trace Log</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.SIMULATOR); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.SIMULATOR ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <MonitorPlay className="w-4 h-4" /> <span>Diagnostic Simulator</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.PINGPLOTTER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.PINGPLOTTER ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Activity className="w-4 h-4" /> <span>PingPlotter Tool</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.THOUSANDEYES); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.THOUSANDEYES ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Globe className="w-4 h-4" /> <span>ThousandEyes Tool</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.MXTOOL); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.MXTOOL ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Server className="w-4 h-4" /> <span>MxTool Simulator</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.SSLSHOPPER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.SSLSHOPPER ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Lock className="w-4 h-4" /> <span>SSL Shopper Tool</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.PLATFORM_EVENTS); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.PLATFORM_EVENTS ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Zap className="w-4 h-4" /> <span>Event Monitor</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.ANALYZER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.ANALYZER ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Terminal className="w-4 h-4" /> <span>PCAP / Log Analyzer</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.HAR_ANALYZER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.HAR_ANALYZER ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <FileCode className="w-4 h-4" /> <span>HAR Analyzer</span>
                    </button>
                    <button
                        onClick={() => { setViewMode(ViewMode.IDENTITY_DEBUGGER); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === ViewMode.IDENTITY_DEBUGGER ? 'bg-purple-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Key className="w-4 h-4" /> <span>Identity / SSO Debug</span>
                    </button>
                </div>
            </div>
          </div>
          
          <div className="p-4 text-xs text-slate-600 text-center border-t border-slate-800">
            v2.1.0 • Diagnostic Pro
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-10 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode(ViewMode.LEARN)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                        ${viewMode === ViewMode.LEARN ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Book className="w-4 h-4" />
                        <span className="hidden sm:inline">Learn</span>
                    </button>
                    <button 
                         onClick={() => setViewMode(ViewMode.WORKSHOP)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                        ${viewMode === ViewMode.WORKSHOP ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                         <Cpu className="w-4 h-4" />
                         <span className="hidden sm:inline">Workshop</span>
                    </button>
                </nav>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-white">Lead Engineer</span>
                    <span className="text-xs text-slate-500">Admin Session</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-[10px] font-bold text-white">LE</div>
            </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 p-6 overflow-y-auto custom-scroll">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
