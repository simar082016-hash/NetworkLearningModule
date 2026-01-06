
import React, { useState, useEffect, useRef } from 'react';
import { simulateThousandEyes, ThousandEyesNode, ThousandEyesLink } from '../services/geminiService';
import { Globe, Play, ZoomIn, Info } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

const ThousandEyesView: React.FC = () => {
  const [target, setTarget] = useState('app.salesforce.com');
  const [data, setData] = useState<{nodes: ThousandEyesNode[], links: ThousandEyesLink[]} | null>(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const runTest = async () => {
    if(!target) return;
    setLoading(true);
    const res = await simulateThousandEyes(target);
    setData(res);
    setLoading(false);
  };

  // Simple automated layout algorithm for visualization
  const getLayoutNodes = () => {
      if (!data) return [];
      
      const layers: {[key: string]: ThousandEyesNode[]} = {
          'agent': [],
          'router': [],
          'target': []
      };

      data.nodes.forEach(n => layers[n.type].push(n));

      // Calculate X/Y
      const width = 800;
      const height = 400;
      
      const nodesWithPos = data.nodes.map(node => {
         let x = 0;
         let y = height / 2;

         if (node.type === 'agent') {
             x = 50;
             const idx = layers['agent'].indexOf(node);
             y = (height / (layers['agent'].length + 1)) * (idx + 1);
         } else if (node.type === 'target') {
             x = width - 50;
         } else {
             // Spread routers in the middle
             const idx = layers['router'].indexOf(node);
             // Jitter to make it look organic
             const col = idx % 3; 
             x = 200 + (col * 150);
             y = (height / (layers['router'].length + 1)) * (idx + 1) + (Math.random() * 40 - 20);
         }
         
         return { ...node, x, y };
      });
      return nodesWithPos;
  };

  const layoutNodes = getLayoutNodes();

  const getLineCoords = (link: ThousandEyesLink) => {
      const source = layoutNodes.find(n => n.id === link.source);
      const target = layoutNodes.find(n => n.id === link.target);
      if (source && target) {
          return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };
      }
      return null;
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-green-400" />
            ThousandEyes Path Visualization
          </h2>
          <p className="text-slate-400 mt-1">Simulate end-to-end path analysis from Cloud Agents to Application.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
         <div className="flex flex-col">
             <span className="text-xs text-slate-500 uppercase font-bold">Test Type</span>
             <span className="text-sm font-bold text-white">Web Layer (HTTP Server)</span>
         </div>
         <div className="w-px h-8 bg-slate-700"></div>
         <span className="text-slate-400 font-mono text-sm">Target URL:</span>
         <input 
            type="text" 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600 focus:outline-none focus:border-green-500 font-mono flex-1"
         />
         <button 
            onClick={runTest}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
         >
            {loading ? <LoadingSpinner /> : 'Run Test'}
         </button>
      </div>

      <div className="flex-1 glass-panel rounded-lg flex flex-col border border-slate-700 overflow-hidden relative">
          {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
                  <LoadingSpinner />
              </div>
          ) : !data ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <Globe className="w-16 h-16 mb-4 opacity-20" />
                  <p>Visualize the network path across the internet.</p>
              </div>
          ) : (
              <div className="flex-1 overflow-auto bg-[#0B1120] relative p-4 flex items-center justify-center">
                  <svg ref={svgRef} width="800" height="400" className="w-full h-full max-w-4xl" viewBox="0 0 800 400">
                      <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                          </marker>
                      </defs>
                      
                      {/* Links */}
                      {data.links.map((link, i) => {
                          const coords = getLineCoords(link);
                          if (!coords) return null;
                          return (
                            <line 
                                key={i}
                                x1={coords.x1} y1={coords.y1}
                                x2={coords.x2} y2={coords.y2}
                                stroke="#475569"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                                className="opacity-50"
                            />
                          );
                      })}

                      {/* Nodes */}
                      {layoutNodes.map((node, i) => (
                          <g key={i} className="cursor-pointer hover:opacity-80 transition-opacity">
                              <circle 
                                cx={node.x} cy={node.y} 
                                r={node.type === 'target' ? 20 : 12} 
                                fill={node.loss > 0 || node.avgMs > 200 ? '#EF4444' : (node.type === 'target' ? '#10B981' : '#3B82F6')}
                                stroke="#1e293b"
                                strokeWidth="3"
                              />
                              <text x={node.x} y={node.y! + 30} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                                  {node.ip}
                              </text>
                              <text x={node.x} y={node.y! - 20} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                                  {node.name}
                              </text>
                              
                              {/* Simple tooltip effect on hover could go here, but using static labels for now */}
                              {(node.loss > 0 || node.avgMs > 100) && (
                                  <g>
                                    <rect x={node.x! + 15} y={node.y! - 15} width="80" height="35" rx="4" fill="#1e293b" stroke="#EF4444" />
                                    <text x={node.x! + 20} y={node.y! - 5} fill="#EF4444" fontSize="9" fontWeight="bold">Loss: {node.loss}%</text>
                                    <text x={node.x! + 20} y={node.y! + 8} fill="#EF4444" fontSize="9">Lat: {node.avgMs}ms</text>
                                  </g>
                              )}
                          </g>
                      ))}
                  </svg>
              </div>
          )}
          
          {data && (
              <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded border border-slate-700 backdrop-blur-sm text-xs text-slate-300">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Info className="w-3 h-3" /> Legend
                  </h4>
                  <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div> <span>Agent / Hop</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div> <span>Target</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div> <span>High Loss / Latency</span>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default ThousandEyesView;
