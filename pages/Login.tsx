
import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  BuildingOffice2Icon, 
  UserGroupIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  CommandLineIcon,
  MapIcon,
  BookOpenIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '../types';
import { authApi } from '../services/firebaseClient';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'selection' | 'login' | 'signup'>('selection');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelection = (role: UserRole) => {
    if (role === 'GUEST') {
      onLogin('GUEST');
      return;
    }
    setSelectedRole(role);
    setMode('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // الحسابات التجريبية للمراجعة السريعة
    if (email.trim() === 'admin1' && password.trim() === 'admin1') {
      const roleToSet = selectedRole || 'YOUTH';
      localStorage.setItem('creative_lab_mock_role', roleToSet);
      onLogin(roleToSet);
      return;
    }

    try {
      await authApi.signIn(email, password);
      onLogin(selectedRole || 'YOUTH');
    } catch (err: any) {
      setError('خطأ في الاتصال بـ Firebase. استخدم admin1 للحساب التجريبي.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalInfo = () => {
    switch (selectedRole) {
      case 'PROJECT_MANAGER': return { name: 'الإدارة الاستراتيجية', color: 'text-yellow-400', desc: 'نطاق المدير العام والقرار السيادي' };
      case 'LAB_MANAGER': return { name: 'الإدارة التشغيلية', color: 'text-blue-400', desc: 'نطاق مدير المختبر والتنفيذ الميداني' };
      case 'YOUTH': return { name: 'بوابة الإبداع', color: 'text-emerald-400', desc: 'نطاق الشباب، التعلم، والابتكار' };
      default: return { name: 'بوابة المعرفة', color: 'text-indigo-400', desc: 'تصفح الأكاديمية كزائر خارجي' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative font-['Cairo']">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-400/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]"></div>

      <div className="z-10 text-center mb-16 space-y-6 animate-fade-in">
        <div className="bg-yellow-400 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-yellow-400/30 rotate-3 transition-transform hover:rotate-0">
          <span className="text-slate-950 font-black text-5xl">م</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter italic">مختبرات الإبداع (DGAC)</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto font-bold italic text-center leading-relaxed">
          {mode === 'selection' ? 'اختر البوابة الرقمية المناسبة لمجال تخصصك ومسؤوليتك.' : `أنت تدخل الآن: ${getPortalInfo().name}`}
        </p>
      </div>

      <div className="w-full max-w-7xl z-10">
        {mode === 'selection' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up">
            {/* بوابة المدير العام */}
            <button onClick={() => handleRoleSelection('PROJECT_MANAGER')} className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-yellow-400/50 p-10 rounded-[4rem] text-right transition-all duration-500 hover:-translate-y-2 flex flex-col items-start gap-10 shadow-2xl relative overflow-hidden h-[420px]">
              <div className="bg-yellow-400 text-slate-950 p-5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-400/20">
                <ShieldCheckIcon className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black italic">البوابة الاستراتيجية</h2>
                <p className="text-slate-500 text-sm font-bold leading-relaxed italic">نظام التتبع الكلي، مؤشرات الأداء، وتقارير الأثر للمدير العام والوزارة.</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-yellow-400 font-black text-xs uppercase tracking-widest">
                 دخول للمسؤولين <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] opacity-5 transition-all group-hover:opacity-10 group-hover:scale-110">
                 <CommandLineIcon className="w-48 h-48" />
              </div>
            </button>

            {/* بوابة مدير المختبر */}
            <button onClick={() => handleRoleSelection('LAB_MANAGER')} className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-400/50 p-10 rounded-[4rem] text-right transition-all duration-500 hover:-translate-y-2 flex flex-col items-start gap-10 shadow-2xl relative overflow-hidden h-[420px]">
              <div className="bg-blue-500 text-white p-5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                <BuildingOffice2Icon className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black italic">البوابة التشغيلية</h2>
                <p className="text-slate-500 text-sm font-bold leading-relaxed italic">إدارة الجهات، تتبع الـ Sprints، توثيق الأصول والفرق الميدانية لمديري المختبرات.</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest">
                 دخول ميداني <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] opacity-5 transition-all group-hover:opacity-10 group-hover:scale-110">
                 <MapIcon className="w-48 h-48" />
              </div>
            </button>

            {/* بوابة الشباب */}
            <button onClick={() => handleRoleSelection('YOUTH')} className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-emerald-400/50 p-10 rounded-[4rem] text-right transition-all duration-500 hover:-translate-y-2 flex flex-col items-start gap-10 shadow-2xl relative overflow-hidden h-[420px]">
              <div className="bg-emerald-500 text-white p-5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
                <AcademicCapIcon className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black italic">بوابة المبدعين</h2>
                <p className="text-slate-500 text-sm font-bold leading-relaxed italic">مساحة الابتكار، منشئ المشاريع، والعمل التشاركي للشباب المبدع.</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                 دخول إبداعي <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] opacity-5 transition-all group-hover:opacity-10 group-hover:scale-110">
                 <SparklesIcon className="w-48 h-48" />
              </div>
            </button>

            {/* بوابة الزوار الخارجيين */}
            <button onClick={() => handleRoleSelection('GUEST')} className="group bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-800 hover:border-indigo-400/50 p-10 rounded-[4rem] text-right transition-all duration-500 hover:-translate-y-2 flex flex-col items-start gap-10 shadow-2xl relative overflow-hidden h-[420px]">
              <div className="bg-indigo-500 text-white p-5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
                <BookOpenIcon className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black italic">الأكاديمية العامة</h2>
                <p className="text-slate-500 text-sm font-bold leading-relaxed italic">بوابة مفتوحة للزوار الخارجيين لتصفح المسارات التكوينية والمحتوى التعليمي الحر.</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
                 دخول للجمهور <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] opacity-5 transition-all group-hover:opacity-10 group-hover:scale-110">
                 <ArrowRightStartOnRectangleIcon className="w-48 h-48" />
              </div>
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-2xl p-12 rounded-[4rem] border border-slate-800 shadow-2xl animate-pop-in relative">
            <button onClick={() => setMode('selection')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
              <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              تغيير النطاق الرقمي
            </button>
            <div className="mb-10 space-y-2">
               <h3 className={`text-2xl font-black italic ${getPortalInfo().color}`}>{getPortalInfo().name}</h3>
               <p className="text-xs text-slate-500 font-bold italic">{getPortalInfo().desc}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-8">
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black text-center italic">{error}</div>}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">admin1 :اسم المستخدم التجريبي</label>
                <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-5 bg-slate-950/50 border border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400/40 outline-none font-bold text-left text-white shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">admin1 :كلمة السر التجريبية</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-5 bg-slate-950/50 border border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400/40 outline-none font-bold text-left text-white shadow-inner" />
              </div>
              <button disabled={loading} className="w-full py-6 rounded-[1.5rem] font-black text-xl transition-all shadow-2xl bg-white text-slate-950 hover:bg-yellow-400 hover:scale-105 active:scale-95 flex items-center justify-center gap-4">
                {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : 'تأكيد الدخول للنطاق'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
};

export default Login;
