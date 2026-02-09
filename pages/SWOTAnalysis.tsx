
import React, { useState, useEffect } from 'react';
import { PresentationChartLineIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { labsApi, kpisApi } from '../services/firebaseClient';

const SWOTAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysis] = useState({
    strengths: ["قاعدة بيانات أصول ثقافية قوية", "دعم حكومي مركزي"],
    weaknesses: ["نقص في تحويل النماذج الأولية إلى مشاريع تجارية"],
    opportunities: ["تزايد الاهتمام العالمي بالسياحة الثقافية"],
    threats: ["تحديات اقتصادية قد تدفع الشباب للهجرة"]
  });

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-right">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6 border-r-4 border-slate-900 pr-8">
          <PresentationChartLineIcon className="w-10 h-10 text-slate-900" />
          <h1 className="text-3xl font-black italic">تحليل SWOT (Firebase)</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: 'القوة', items: analysis.strengths, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'الضعف', items: analysis.weaknesses, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'الفرص', items: analysis.opportunities, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'التهديدات', items: analysis.threats, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((sec, idx) => (
          <div key={idx} className={`p-10 rounded-[3.5rem] border border-slate-100 ${sec.bg} space-y-4`}>
            <h3 className={`text-2xl font-black italic ${sec.color}`}>{sec.title}</h3>
            <ul className="space-y-2">
              {sec.items.map((item, i) => (
                <li key={i} className="bg-white/60 p-4 rounded-2xl text-sm font-bold border border-white italic">- {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SWOTAnalysis;
