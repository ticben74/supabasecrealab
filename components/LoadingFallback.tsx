
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'جاري التحميل...' 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-32 h-32 bg-indigo-100 rounded-full animate-ping opacity-20 absolute inset-0"></div>
          <div className="relative w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl mx-auto">
            <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-900 italic tracking-tight">
            {message}
          </h3>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
