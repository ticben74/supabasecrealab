
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  HomeIcon, 
  MicrophoneIcon, 
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  ArrowLeftOnRectangleIcon,
  ChartPieIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  CalendarIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  BookOpenIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  MapIcon,
  UserPlusIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import LoadingFallback from './components/LoadingFallback';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { UserRole } from './types';
import { authApi } from './services/supabaseClient';

// Lazy loaded pages
const AiMentor = lazy(() => import('./pages/AiMentor'));
const ProjectBuilder = lazy(() => import('./pages/ProjectBuilder'));
const PodcastGuide = lazy(() => import('./pages/PodcastGuide'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Reports = lazy(() => import('./pages/Reports'));
const CulturalAssets = lazy(() => import('./pages/CulturalAssets'));
const CreativeStudio = lazy(() => import('./pages/CreativeStudio'));
const DesignThinking = lazy(() => import('./pages/DesignThinking'));
const SprintPlanner = lazy(() => import('./pages/SprintPlanner'));
const KPIsDashboard = lazy(() => import('./pages/KPIsDashboard'));
const SWOTAnalysis = lazy(() => import('./pages/SWOTAnalysis'));
const Academy = lazy(() => import('./pages/Academy'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const MediaGallery = lazy(() => import('./pages/MediaGallery'));

const Sidebar = ({ role, onLogout }: { role: UserRole, onLogout: () => void }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'لوحة التحكم', path: '/', icon: HomeIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER', 'YOUTH'] },
    { name: 'الأكاديمية', path: '/academy', icon: AcademicCapIcon, roles: ['YOUTH', 'LAB_MANAGER', 'PROJECT_MANAGER', 'GUEST'] },
    { name: 'لوحة الصدارة', path: '/leaderboard', icon: TrophyIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER', 'YOUTH'] },
    { name: 'مؤشرات الأداء (KPIs)', path: '/kpis', icon: ChartBarIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER'] },
    { name: 'تحليل SWOT', path: '/swot', icon: PresentationChartLineIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER'] },
    { name: 'مكتبة الأصول', path: '/assets', icon: ArchiveBoxIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER', 'YOUTH'] },
    { name: 'معرض الوسائط', path: '/media', icon: SparklesIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER', 'YOUTH'] },
    { name: 'مخطط التصميم', path: '/design', icon: LightBulbIcon, roles: ['YOUTH', 'LAB_MANAGER'] },
    { name: 'برنامج Sprint', path: '/sprint', icon: CalendarIcon, roles: ['YOUTH', 'LAB_MANAGER'] },
    { name: 'دليل البودكاست', path: '/podcast', icon: MicrophoneIcon, roles: ['YOUTH', 'LAB_MANAGER'] },
    { name: 'استوديو الإبداع', path: '/studio', icon: SparklesIcon, roles: ['YOUTH', 'LAB_MANAGER'] },
    { name: 'الموجه الذكي', path: '/mentor', icon: ChatBubbleLeftRightIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER', 'YOUTH'] },
    { name: 'منشئ المشاريع', path: '/builder', icon: Squares2X2Icon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER', 'YOUTH'] },
    { name: 'التقارير الإحصائية', path: '/reports', icon: ChartPieIcon, roles: ['PROJECT_MANAGER', 'LAB_MANAGER'] },
    { name: 'قاموس المصطلحات', path: '/glossary', icon: BookOpenIcon, roles: ['YOUTH', 'LAB_MANAGER', 'PROJECT_MANAGER', 'GUEST'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role as string));

  return (
    <aside className={`w-72 bg-slate-950 text-white min-h-screen flex flex-col sticky top-0 h-screen z-50 shadow-2xl border-l border-white/5`}>
      <div className="p-8 border-b border-white/5 flex items-center gap-4">
        <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
          <span className="text-white font-black text-2xl">م</span>
        </div>
        <div>
          <h1 className="font-black text-xl leading-tight tracking-tight text-right text-white italic">المختبرات</h1>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-right">النطاق الرقمي المركزي (Supabase)</p>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar mt-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-white text-slate-950 font-black shadow-2xl' 
                : 'hover:bg-white/5 text-slate-500 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-500'}`} />
              <span className="text-sm font-bold tracking-tight italic">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-white/5">
        <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-black text-xs text-right italic uppercase tracking-widest">
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>الخروج من النطاق</span>
        </button>
      </div>
    </aside>
  );
};

const MainContent = ({ userRole, handleLogout }: { userRole: UserRole, handleLogout: () => void }) => {
  const location = useLocation();
  const isAcademy = location.pathname.startsWith('/academy');

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-['Cairo']">
      {!(isAcademy && userRole === 'GUEST') && <Sidebar role={userRole} onLogout={handleLogout} />}
      <main className={`flex-1 flex flex-col min-w-0 ${isAcademy ? 'w-full' : ''}`}>
        {!isAcademy && (
          <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 px-12 py-6 sticky top-0 z-40 flex justify-between items-center shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">بوابة المختبرات</span>
              <span className="text-sm font-black text-slate-900 italic tracking-tight">النطاق السحابي (Supabase Backend)</span>
            </div>
            <div className="text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest bg-blue-600 text-white">
              {userRole}
            </div>
          </header>
        )}
        <div className={`${isAcademy ? 'p-0' : 'p-12'} max-w-[1500px] mx-auto w-full`}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard role={userRole} />} />
              <Route path="/academy" element={<Academy onLogout={handleLogout} />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/kpis" element={<KPIsDashboard />} />
              <Route path="/swot" element={<SWOTAnalysis />} />
              <Route path="/assets" element={<CulturalAssets />} />
              <Route path="/media" element={<MediaGallery />} />
              <Route path="/design" element={<DesignThinking />} />
              <Route path="/sprint" element={<SprintPlanner />} />
              <Route path="/studio" element={<CreativeStudio />} />
              <Route path="/mentor" element={<AiMentor />} />
              <Route path="/builder" element={<ProjectBuilder />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/podcast" element={<PodcastGuide />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        const profile = await authApi.getProfile(session.user.id);
        setUserRole(profile?.role || 'YOUTH');
      } else {
        const mockRole = localStorage.getItem('creative_lab_mock_role') as UserRole;
        setUserRole(mockRole);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('creative_lab_mock_role');
    await authApi.signOut();
    setUserRole(null);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white italic">جاري تهيئة النطاق السحابي...</div>;
  if (!userRole) return <Login onLogin={(role) => setUserRole(role)} />;

  return (
    <Router>
      <MainContent userRole={userRole} handleLogout={handleLogout} />
    </Router>
  );
};

export default App;
