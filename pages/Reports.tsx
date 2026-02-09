
import React, { useState, useEffect } from 'react';
import { 
  RocketLaunchIcon, 
  UserGroupIcon, 
  ArchiveBoxIcon, 
  GlobeAltIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  MapIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { projectsApi, assetsApi, labsApi, kpisApi } from '../services/firebaseClient';
import { Link } from 'react-router-dom';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'labs'>('overview');
  const [stats, setStats] = useState({ projectsCount: 0, assetsCount: 0, labsCount: 0, activeYouth: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [pCount, assets, labs, summary] = await Promise.all([
        projectsApi.getCounts(),
        assetsApi.getAll(),
        labsApi.getAll(),
        kpisApi.getDashboardSummary()
      ]);
      setStats({
        projectsCount: pCount,
        assetsCount: assets.length,
        labsCount: labs.length,
        activeYouth: summary.totalBeneficiaries
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-right">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6 border-r-4 border-blue-600 pr-8">
          <PresentationChartLineIcon className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-black text-slate-900 italic">مركز التقارير (Firebase)</h1>
            <p className="text-slate-500 font-bold">تحليل الأثر الاجتماعي والثقافي الموحد</p>
          </div>
        </div>
        <button onClick={fetchStats} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
          <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'المشاريع', value: stats.projectsCount, icon: RocketLaunchIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'الأصول', value: stats.assetsCount, icon: ArchiveBoxIcon, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'المختبرات', value: stats.labsCount, icon: GlobeAltIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'المستفيدون', value: stats.activeYouth, icon: UserGroupIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
            <div className={`p-6 rounded-[2rem] ${s.bg} ${s.color} mb-4`}><s.icon className="w-10 h-10" /></div>
            <h3 className="text-xs font-black text-slate-400 uppercase mb-1">{s.label}</h3>
            <p className="text-4xl font-black text-slate-900 italic">{loading ? '...' : s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
