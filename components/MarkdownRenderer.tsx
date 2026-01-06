import React from 'react';

interface Props {
  content: string;
}

// A simplified markdown renderer for robustness without heavy external deps in this environment.
// It handles basic headers, code blocks, lists, and bold text.
const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${index}`} className="bg-slate-900 text-green-400 p-4 rounded-md font-mono text-sm my-4 overflow-x-auto border border-slate-700">
            <pre>{codeBlockContent.join('\n')}</pre>
          </div>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={index} className="text-3xl font-bold text-white mt-6 mb-4">{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={index} className="text-2xl font-semibold text-blue-400 mt-5 mb-3">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={index} className="text-xl font-semibold text-blue-300 mt-4 mb-2">{line.replace('### ', '')}</h3>);
    } else if (line.trim().startsWith('- ')) {
      elements.push(<li key={index} className="ml-6 list-disc text-slate-300 mb-1">{line.replace('- ', '')}</li>);
    } else if (line.trim().startsWith('1. ')) {
        elements.push(<li key={index} className="ml-6 list-decimal text-slate-300 mb-1">{line.replace(/^\d+\. /, '')}</li>);
    } else if (line.trim() === '') {
      elements.push(<div key={index} className="h-2"></div>);
    } else {
      // Basic bold parsing
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const parsedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(<p key={index} className="text-slate-300 leading-relaxed mb-2">{parsedLine}</p>);
    }
  });

  return <div className="markdown-body">{elements}</div>;
};

export default MarkdownRenderer;