import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-12 text-blue-400">
    <Loader2 className="w-10 h-10 animate-spin mb-4" />
    <span className="text-sm font-mono animate-pulse">Initializing Network Protocol...</span>
  </div>
);
