
import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  FireIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  AcademicCapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useCache } from '../hooks/useCache';
import { labsApi, projectsApi } from '../services/firebaseClient';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  deadline: string;
  category: 'individual' | 'team' | 'lab';
  progress?: number;
  participants?: number;
  status: 'active' | 'completed' | 'upcoming';
}

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
  projects: number;
  badges: number;
  streak: number;
  type: 'lab' | 'user';
  province?: string;
}

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'ch1',
    title: 'مبادرة الشهر',
    description: 'إطلاق 3 مشاريع جديدة في مختبرك هذا الشهر',
    icon: '🚀',
    points: 500,
    deadline: '2025-02-28',
    category: 'lab',
    progress: 66,
    participants: 8,
    status: 'active'
  },
  {
    id: 'ch2',
    title: 'سفير الثقافة',
    description: 'توثيق 5 أصول ثقافية جديدة على الخريطة',
    icon: '📍',
    points: 300,
    deadline: '2025-02-20',
    category: 'individual',
    progress: 40,
    participants: 24,
    status: 'active'
  },
  {
    id: 'ch3',
    title: 'البودكاستر الذهبي',
    description: 'إنتاج حلقة بودكاست عن قصة محلية',
    icon: '🎙️',
    points: 250,
    deadline: '2025-02-15',
    category: 'individual',
    progress: 75,
    participants: 12,
    status: 'active'
  },
  {
    id: 'ch4',
    title: 'الابتكار الجماعي',
    description: 'تنظيم ورشة تصميم مشترك مع 10+ مشاركين',
    icon: '💡',
    points: 400,
    deadline: '2025-03-05',
    category: 'team',
    progress: 0,
    participants: 5,
    status: 'upcoming'
  }
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'مختبر تونس', points: 2450, rank: 1, projects: 12, badges: 8, streak: 14, type: 'lab', province: 'تونس', avatar: '🏛️' },
  { id: '2', name: 'مختبر سبيطلة', points: 2120, rank: 2, projects: 9, badges: 6, streak: 10, type: 'lab', province: 'القصرين', avatar: '🏺' },
  { id: '3', name: 'مختبر صفاقس', points: 1890, rank: 3, projects: 8, badges: 7, streak: 8, type: 'lab', province: 'صفاقس', avatar: '🌊' },
  { id: '4', name: 'أمينة الكريمي', points: 1650, rank: 4, projects: 5, badges: 4, streak: 12, type: 'user', avatar: '👩' },
  { id: '5', name: 'مختبر الكاف', points: 1540, rank: 5, projects: 6, badges: 5, streak: 6, type: 'lab', province: 'الكاف', avatar: '⛰️' }
];

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'labs' | 'users'>('labs');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-[0_0_30px_rgba(234,179,8,0.6)]';
    if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-[0_0_25px_rgba(148,163,184,0.5)]';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-[0_0_25px_rgba(217,119,6,0.5)]';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-right font-['Cairo']">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[150px] -mr-96 -mt-96"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
          <div className="space-y-5">
            <div className="flex items-center gap-6 border-r-8 border-white pr-10">
              <div className="p-6 bg-white/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
                <TrophyIcon className="w-16 h-16 text-white animate-bounce" />
              </div>
              <div className="space-y-2">
                <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">لوحة الصدارة</h1>
                <p className="text-yellow-100 font-bold text-xl italic uppercase tracking-widest">تنافس، أبدع، وكن الأفضل</p>
              </div>
            </div>
            <p className="text-white/90 font-bold max-w-2xl text-xl italic leading-relaxed pr-2">
              تابع تقدمك وتنافس مع المختبرات والمبدعين الآخرين. شارك في التحديات الشهرية واحصل على النقاط والمكافآت!
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border-2 border-white/20 text-center group hover:bg-white/20 transition-all">
              <FireIcon className="w-10 h-10 text-yellow-200 mx-auto mb-3 group-hover:scale-125 transition-transform" />
              <p className="text-5xl font-black italic leading-none mb-2">450</p>
              <p className="text-xs font-black text-yellow-200 uppercase tracking-widest">نقاطك XP</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border-2 border-white/20 text-center group hover:bg-white/20 transition-all">
              <StarIcon className="w-10 h-10 text-yellow-200 mx-auto mb-3 group-hover:rotate-180 transition-transform" />
              <p className="text-5xl font-black italic leading-none mb-2">12</p>
              <p className="text-xs font-black text-yellow-200 uppercase tracking-widest">شارة محققة</p>
            </div>
          </div>
        </div>
      </header>

      {/* Challenges Section */}
      <div className="bg-white rounded-[4.5rem] border border-slate-100 p-12 shadow-xl space-y-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-orange-50 text-orange-600 rounded-3xl">
              <BoltIcon className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-4xl font-black italic text-slate-900 tracking-tight">التحديات النشطة</h2>
              <p className="text-slate-500 font-bold mt-1">شارك واربح نقاط إضافية!</p>
            </div>
          </div>
          <div className="flex gap-3">
            {['active', 'completed', 'upcoming'].map(status => (
              <button key={status} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                status === 'active' ? 'bg-orange-600 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}>
                {status === 'active' ? 'نشط' : status === 'completed' ? 'مكتمل' : 'قادم'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {challenges.filter(ch => ch.status === 'active').map((challenge) => (
            <div key={challenge.id} className="group relative bg-gradient-to-br from-slate-50 to-white p-10 rounded-[3.5rem] border-2 border-slate-100 hover:border-orange-300 transition-all hover:shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-5">
                  <div className="text-6xl group-hover:scale-125 transition-transform">{challenge.icon}</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 italic mb-1">{challenge.title}</h3>
                    <p className="text-sm text-slate-500 font-bold">{challenge.description}</p>
                  </div>
                </div>
                <div className="px-5 py-2 bg-orange-100 text-orange-700 rounded-2xl text-xs font-black">
                  +{challenge.points} XP
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-black text-slate-400">
                  <span>التقدم</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-l from-orange-500 to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4" />
                    {challenge.participants} مشارك
                  </span>
                  <span className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    {getDaysLeft(challenge.deadline)} يوم متبقي
                  </span>
                </div>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                  المشاركة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white rounded-[4.5rem] border border-slate-100 p-12 shadow-xl space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl">
              <ChartBarIcon className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-4xl font-black italic text-slate-900 tracking-tight">الترتيب العام</h2>
              <p className="text-slate-500 font-bold mt-1">أفضل المختبرات والمبدعين</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex bg-slate-100 p-2 rounded-[2rem]">
              {[
                { id: 'labs', label: 'المختبرات', icon: AcademicCapIcon },
                { id: 'users', label: 'المبدعين', icon: UserGroupIcon }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all flex items-center gap-3 ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-sm outline-none"
            >
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="all">كل الأوقات</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {leaderboard.filter(entry => entry.type === activeTab.slice(0, -1) as any).map((entry, idx) => (
            <div 
              key={entry.id}
              className={`group flex items-center justify-between p-8 rounded-[3rem] border-2 transition-all hover:shadow-2xl ${
                entry.rank <= 3 
                  ? 'bg-gradient-to-r from-slate-50 to-white border-yellow-200 hover:border-yellow-400' 
                  : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-8">
                {/* Rank Badge */}
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl ${getRankBadgeColor(entry.rank)} transition-all group-hover:scale-110`}>
                  {entry.rank <= 3 ? (
                    <TrophyIcon className="w-10 h-10" />
                  ) : (
                    entry.rank
                  )}
                </div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                    {entry.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 italic mb-1">{entry.name}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      {entry.province && <span>{entry.province}</span>}
                      <span className="flex items-center gap-1">
                        <RocketLaunchIcon className="w-4 h-4" />
                        {entry.projects} مشروع
                      </span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4" />
                        {entry.badges} شارة
                      </span>
                      <span className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4 text-orange-500" />
                        {entry.streak} يوم
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points */}
              <div className="text-left">
                <p className="text-5xl font-black text-slate-900 italic mb-1">{entry.points.toLocaleString()}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">نقطة XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
