
import React, { useState, useEffect } from 'react';
import { ChartBarIcon, RocketLaunchIcon, UsersIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { labsApi, kpisApi } from '../services/firebaseClient';

const KPIsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalBeneficiaries: 0, activeProjects: 0, avgSatisfaction: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardSummary = await kpisApi.getDashboardSummary();
      setSummary(dashboardSummary);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 pb-20 text-right animate-fade-in">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6 border-r-4 border-slate-900 pr-8">
          <ChartBarIcon className="w-10 h-10 text-slate-900" />
          <h1 className="text-3xl font-black italic">مؤشرات الأداء (Firebase)</h1>
        </div>
        <button onClick={loadData} className="p-4 bg-slate-50 rounded-2xl active:scale-95 transition-all">
          <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي المستفيدين', value: summary.totalBeneficiaries, icon: UsersIcon, color: 'text-blue-600' },
          { label: 'المشاريع النشطة', value: summary.activeProjects, icon: RocketLaunchIcon, color: 'text-emerald-600' },
          { label: 'رضا المستفيدين', value: `${summary.avgSatisfaction}/5`, icon: SparklesIcon, color: 'text-yellow-600' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <item.icon className={`w-12 h-12 mx-auto mb-4 ${item.color}`} />
            <h3 className="text-xs font-black text-slate-400 uppercase">{item.label}</h3>
            <p className="text-4xl font-black text-slate-900 italic">{loading ? '...' : item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIsDashboard;
