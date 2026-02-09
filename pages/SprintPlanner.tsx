
import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  MagnifyingGlassIcon, 
  LightBulbIcon, 
  PuzzlePieceIcon, 
  BeakerIcon,
  FlagIcon,
  MapPinIcon,
  CheckCircleIcon as CheckSolid,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
  SparklesIcon,
  UserCircleIcon,
  MicrophoneIcon as MicSolid,
  PlayCircleIcon,
  CircleStackIcon
} from '@heroicons/react/24/solid';
import { 
  CheckCircleIcon as CheckOutline,
  CalendarDaysIcon,
  InboxStackIcon,
  MicrophoneIcon as MicOutline,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  assignee?: {
    name: string;
    color: string;
  };
}

const SprintPlanner: React.FC = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('p1');
  
  // Projects list for relation (from Supabase schema)
  const projects = [
    { id: 'p1', title: 'منصة الحصيرة الذكية' },
    { id: 'p2', title: 'متحف الكاف الافتراضي' },
    { id: 'p3', title: 'دليل تكتكة السياحي' }
  ];

  const [tasks, setTasks] = useState<Record<number, Task[]>>({
    1: [
      { id: 't1', text: 'جولة ميدانية في المنطقة لتصوير المعالم', completed: true, assignee: { name: 'أحمد', color: 'bg-blue-400' } },
      { id: 't2', text: 'إجراء مقابلة مع أحد الحرفيين المحليين', completed: false, assignee: { name: 'ليلى', color: 'bg-pink-400' } },
      { id: 't3', text: 'توثيق أصل ثقافي في مكتبة الأصول', completed: false, assignee: { name: 'أنت', color: 'bg-yellow-400' } }
    ],
    2: [
      { id: 't4', text: 'عقد جلسة عصف ذهني مع فريق المختبر', completed: false, assignee: { name: 'سامي', color: 'bg-green-400' } },
      { id: 't5', text: 'تحديد 3 أفكار مشاريع أولية', completed: false, assignee: { name: 'أنت', color: 'bg-yellow-400' } }
    ],
    4: [
      { id: 't6', text: 'تصميم النموذج الأولي (Prototyping)', completed: false, assignee: { name: 'أحمد', color: 'bg-blue-400' } },
      { id: 't7', text: 'اختبار النموذج مع عينة من الشباب', completed: false, assignee: { name: 'ليلى', color: 'bg-pink-400' } }
    ],
    7: [
      { id: 't8', text: 'تقديم العرض النهائي أمام اللجنة', completed: false, assignee: { name: 'الفريق', color: 'bg-slate-900' } },
      { id: 't9', text: 'كتابة تقرير الأثر الأولي', completed: false, assignee: { name: 'أنت', color: 'bg-yellow-400' } }
    ]
  });

  const sprintDays = [
    { day: 1, title: 'Discovery (اكتشاف)', icon: MagnifyingGlassIcon, deliverable: 'خريطة الموارد (Asset Map)' },
    { day: 2, title: 'Ideation (عصف ذهني)', icon: LightBulbIcon, deliverable: 'قائمة 3 أفكار (Shortlist)' },
    { day: 4, title: 'Prototyping (تجسيد)', icon: PuzzlePieceIcon, deliverable: 'النموذج الأولي (MVP)' },
    { day: 7, title: 'Testing (اختبار)', icon: BeakerIcon, deliverable: 'تقرير الأثر (Impact Report)' }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate Supabase Update for 'sprints' table
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const progress = Math.round(
    ((Object.values(tasks).flat() as Task[]).filter(t => t.completed).length / 
    (Object.values(tasks).flat() as Task[]).length) * 100
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-right">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-5 bg-blue-500 rounded-[2rem] shadow-xl shadow-blue-100 rotate-3">
            <CalendarDaysIcon className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">برنامج الـ Sprint الثقافي (7 أيام)</h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مرتبط بالمشروع:</span>
              <div className="relative group">
                 <select 
                   value={selectedProjectId}
                   onChange={(e) => setSelectedProjectId(e.target.value)}
                   className="appearance-none bg-slate-50 border border-slate-100 px-4 py-2 pr-8 rounded-xl text-xs font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                 >
                   {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                 </select>
                 <ChevronDownIcon className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-10 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
             <div className={`p-2 rounded-full ${isSyncing ? 'bg-yellow-400' : 'bg-green-500'} animate-pulse`}></div>
             <span className="text-xs font-black text-slate-900">{isSyncing ? 'مزامنة مع Supabase...' : 'البيانات في المزامنة'}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إنجاز الفريق</p>
              <p className="text-2xl font-black text-blue-600">{progress}%</p>
            </div>
            <div className="w-40 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Timeline Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {sprintDays.map((d) => {
            const dayTasks = tasks[d.day] || [];
            const completedCount = dayTasks.filter(t => t.completed).length;
            const totalCount = dayTasks.length;
            const dayPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const DayIcon = d.icon;
            
            return (
              <button 
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`w-full p-8 rounded-[3rem] border-2 transition-all flex flex-col gap-4 text-right relative overflow-hidden group ${
                  activeDay === d.day 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105 z-10' 
                  : 'bg-white border-slate-50 text-slate-400 hover:border-blue-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <DayIcon className={`w-8 h-8 ${activeDay === d.day ? 'text-blue-400' : 'text-slate-200 group-hover:text-blue-200'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                    activeDay === d.day ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-50 text-slate-400'
                  }`}>اليوم {d.day}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black">{d.title}</h3>
                  
                  {/* Visual Day Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                       <span className={activeDay === d.day ? 'text-blue-400' : 'text-slate-400'}>{dayPct}%</span>
                       <span className={activeDay === d.day ? 'text-slate-400' : 'text-slate-300'}>
                         {completedCount} / {totalCount} مهام
                       </span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${activeDay === d.day ? 'bg-slate-800' : 'bg-slate-100'}`}>
                       <div 
                         className={`h-full transition-all duration-700 ease-out ${activeDay === d.day ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-blue-500/40'}`} 
                         style={{ width: `${dayPct}%` }}
                       />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                     <div className="flex -space-x-2 space-x-reverse">
                        {dayTasks.map((t, idx) => (
                          <div key={idx} className={`w-5 h-5 rounded-full border-2 border-white ${t.assignee?.color || 'bg-slate-200'}`}></div>
                        ))}
                     </div>
                  </div>
                </div>
              </button>
            );
          })}

          <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-xl mt-10 relative overflow-hidden group border border-slate-800">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <CircleStackIcon className="w-8 h-8 text-blue-400" />
                <h4 className="font-black text-sm">قاعدة بيانات الـ Sprint</h4>
             </div>
             <div className="space-y-3 relative z-10">
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                   "يتم تخزين تقدم هذا الـ Sprint في جدول 'sprints' المرتبط بالمشروع '{projects.find(p=>p.id===selectedProjectId)?.title}' لضمان التقارير الدورية."
                </p>
                <div className="pt-4 flex justify-center">
                   <button onClick={handleSync} className="px-6 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-lg">تحديث الحالة المركزية</button>
                </div>
             </div>
          </div>
        </div>

        {/* Daily Tasks Content */}
        <div className="lg:col-span-3 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
              <div className="border-r-4 border-blue-500 pr-8">
                 <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">
                    {sprintDays.find(d => d.day === activeDay)?.title}
                 </h2>
                 <p className="text-sm text-slate-400 font-bold mt-2">توثيق المخرجات اليومية كأصول (Cultural Assets) في جدول البيانات.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center min-w-[200px] shadow-inner">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">المُخرج المستهدف</p>
                 <p className="text-sm font-black text-blue-600">{sprintDays.find(d => d.day === activeDay)?.deliverable}</p>
              </div>
           </div>

           <div className="flex-1 space-y-4 relative z-10">
              {tasks[activeDay]?.map(task => (
                <div 
                  key={task.id}
                  onClick={() => {
                    const newTasks = { ...tasks, [activeDay]: tasks[activeDay].map(t => t.id === task.id ? { ...t, completed: !t.completed } : t) };
                    setTasks(newTasks);
                    handleSync();
                  }}
                  className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${
                    task.completed 
                    ? 'bg-green-50 border-green-200 shadow-inner scale-[0.98] opacity-80' 
                    : 'bg-white border-slate-50 hover:border-blue-100 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <div className={`transition-all ${task.completed ? 'text-green-500' : 'text-slate-200 group-hover:text-blue-300'}`}>
                      {task.completed ? <CheckSolid className="w-12 h-12" /> : <CheckOutline className="w-12 h-12" />}
                    </div>
                    <div>
                      <span className={`font-black text-xl block transition-all ${task.completed ? 'text-green-800 line-through opacity-50' : 'text-slate-700'}`}>
                        {task.text}
                      </span>
                      {task.assignee && (
                        <div className="flex items-center gap-2 mt-1">
                           <div className={`w-3 h-3 rounded-full ${task.assignee.color}`}></div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المسؤول: {task.assignee.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`text-[10px] font-black uppercase px-5 py-2 rounded-xl ${task.completed ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                      {task.completed ? 'تم التخزين' : 'قيد المراجعة'}
                    </div>
                    {task.assignee && (
                      <div className={`w-12 h-12 rounded-full ${task.assignee.color} flex items-center justify-center text-xs font-black text-white shadow-sm border-4 border-white group-hover:scale-110 transition-transform`}>
                         {task.assignee.name[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>

           <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
              <div className="flex items-center gap-6">
                 <div className={`p-5 rounded-3xl shadow-lg transition-all duration-500 ${isSyncing ? 'bg-yellow-400 text-slate-900 rotate-12' : 'bg-slate-900 text-white'}`}>
                    <CloudArrowUpIcon className={`w-8 h-8 ${isSyncing ? 'animate-bounce' : ''}`} />
                 </div>
                 <div>
                    <p className="text-lg font-black text-slate-900">{isSyncing ? 'جاري التحديث...' : 'المزامنة المركزية'}</p>
                    <p className="text-xs text-slate-400 font-bold italic">
                       {isSyncing ? 'يتم الآن نقل البيانات لجدول sprints على Supabase.' : 'آخر مزامنة ناجحة تمت منذ دقيقة.'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={handleSync}
                className="px-14 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl flex items-center gap-4 hover:bg-black transition-all shadow-2xl shadow-slate-200 hover:scale-[1.02]"
              >
                 حفظ الـ Sprint السحابي
                 <ArrowRightIcon className="w-6 h-6 rotate-180" />
              </button>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
      `}} />
    </div>
  );
};

const CloudArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default SprintPlanner;
