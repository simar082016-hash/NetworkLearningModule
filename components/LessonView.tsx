import React, { useState, useEffect } from 'react';
import { Module } from '../types';
import { generateTopicExplanation } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { BookOpen, ChevronRight, Zap } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  module: Module;
}

const LessonView: React.FC<Props> = ({ module }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(module.topics[0]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset to first topic when module changes
    setSelectedTopic(module.topics[0]);
  }, [module]);

  useEffect(() => {
    const fetchContent = async () => {
        setLoading(true);
        const text = await generateTopicExplanation(selectedTopic, module.difficulty);
        setContent(text);
        setLoading(false);
    };
    fetchContent();
  }, [selectedTopic, module]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Topics List */}
      <div className="w-full lg:w-64 flex-shrink-0 bg-slate-800/30 rounded-lg p-4 h-fit border border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Module Topics</h3>
        <ul className="space-y-1">
            {module.topics.map(topic => (
                <li key={topic}>
                    <button
                        onClick={() => setSelectedTopic(topic)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center justify-between
                        ${selectedTopic === topic 
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        {topic}
                        {selectedTopic === topic && <ChevronRight className="w-3 h-3" />}
                    </button>
                </li>
            ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 glass-panel rounded-lg p-8 overflow-y-auto custom-scroll relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Zap className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
            <div className="mb-6 border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">{module.difficulty} Level</span>
                </div>
                <h1 className="text-3xl font-bold text-white">{selectedTopic}</h1>
            </div>

            {loading ? (
                <div className="py-20">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="prose prose-invert max-w-none">
                    <MarkdownRenderer content={content} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;