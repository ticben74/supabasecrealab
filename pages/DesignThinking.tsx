
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  LightBulbIcon, 
  PuzzlePieceIcon, 
  BeakerIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  MapIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  RectangleGroupIcon,
  HandThumbUpIcon,
  UserCircleIcon,
  ClockIcon,
  VideoCameraIcon,
  PlayIcon,
  StopIcon,
  ChartBarIcon,
  ArrowsPointingOutIcon,
  UserPlusIcon,
  CircleStackIcon,
  PresentationChartLineIcon,
  EyeIcon,
  BoltIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { getAiMentorResponse } from '../services/geminiService';
import { Message, MentorContext, UserRole } from '../types';

interface StickyNote {
  id: string;
  text: string;
  color: string;
  author: string;
  votes: string[]; 
  x: number;
  y: number;
  timestamp: number;
}

interface Participant {
  id: string;
  name: string;
  color: string;
  initial: string;
  status: 'idle' | 'typing' | 'voting';
  contributionCount: number;
}

const DesignThinking: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showManagerView, setShowManagerView] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    const mockRole = localStorage.getItem('creative_lab_mock_role') as UserRole;
    setUserRole(mockRole);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [notes, setNotes] = useState<StickyNote[]>([
    { id: '1', text: 'إنشاء متحف رقمي يعتمد على تقنية NFC لكل قطعة أثرية في سبيطلة.', author: 'ليلى', votes: ['u1', 'u2', 'u3'], color: 'bg-yellow-100', x: 0, y: 0, timestamp: Date.now() - 100000 },
    { id: '2', text: 'بودكاست جهوي يسجل قصص الأجداد في واحات قابس.', author: 'سامي', votes: ['u1', 'me'], color: 'bg-blue-100', x: 0, y: 0, timestamp: Date.now() - 50000 },
    { id: '3', text: 'منصة تسويق للحرف التقليدية باستخدام الواقع المعزز.', author: 'أحمد', votes: ['u2'], color: 'bg-pink-100', x: 0, y: 0, timestamp: Date.now() - 20000 }
  ]);

  const [participants] = useState<Participant[]>([
    { id: 'u1', name: 'أحمد', color: 'bg-blue-500', initial: 'أ', status: 'idle', contributionCount: 15 },
    { id: 'u2', name: 'ليلى', color: 'bg-pink-500', initial: 'ل', status: 'typing', contributionCount: 22 },
    { id: 'u3', name: 'سامي', color: 'bg-green-500', initial: 'س', status: 'idle', contributionCount: 8 },
    { id: 'me', name: 'أنت', color: 'bg-yellow-400', initial: 'م', status: 'idle', contributionCount: 12 }
  ]);

  const phases = [
    { 
      title: 'Empathize (تعاطف)', 
      icon: UserGroupIcon, 
      color: 'bg-blue-500', 
      context: 'ideation' as MentorContext, 
      description: 'الغوص في عالم المستخدمين والشباب لفهم احتياجاتهم العاطفية والعملية وتحدياتهم اليومية في الجهة.',
      goal: 'بناء ملف مستخدم حقيقي (User Persona) وخريطة تعاطف.',
      keyQuestion: 'بماذا يشعر الشباب في منطقتي حيال الهجرة؟ وما الذي يفتقدونه في واقعهم الحالي؟',
      tools: ['مقابلات عميقة', 'مراقبة ميدانية', 'خريطة التعاطف']
    },
    { 
      title: 'Define (تعريف)', 
      icon: ChatBubbleLeftRightIcon, 
      color: 'bg-purple-500', 
      context: 'general' as MentorContext, 
      description: 'تجميع الرؤى المستخلصة من مرحلة التعاطف لتحديد المشكلة الجوهرية التي يسعى المختبر لحلها بوضوض.',
      goal: 'صياغة بيان المشكلة (Problem Statement) يبدأ بـ "كيف يمكننا...؟"',
      keyQuestion: 'ما هو العائق الأكبر الذي يمنع الشباب من استثمار مواهبهم محلياً بطريقة رقمية؟',
      tools: ['تحليل "اللماذا" الخمسة', 'بيان احتياج المستخدم', 'صياغة التحدي']
    },
    { 
      title: 'Ideate (ابتكار)', 
      icon: LightBulbIcon, 
      color: 'bg-yellow-400', 
      context: 'ideation' as MentorContext, 
      description: 'توليد أكبر عدد ممكن من الحلول الجريئة وغير التقليدية، مع التركيز على دمج الجانب الثقافي بالتقني.',
      goal: 'قائمة قصيرة من الأفكار القابلة للتطبيق (Shortlist) ذات القيمة المضافة.',
      keyQuestion: 'كيف يمكننا تحويل أصل ثقافي محلي منسي إلى مصدر رزق رقمي جذاب للمستقبل؟',
      tools: ['العصف الذهني', 'خرائط الأفكار', 'تقنية SCAMPER']
    },
    { 
      title: 'Prototype (نمذجة)', 
      icon: PuzzlePieceIcon, 
      color: 'bg-emerald-500', 
      context: 'canvas' as MentorContext, 
      description: 'تحويل الأفكار المختارة إلى نماذج ملموسة سريعة وبسيطة (MVP) تسمح باختبار الفرضيات بأقل تكلفة.',
      goal: 'منتج تجريبي أولي (MVP) قابل للتفاعل والفهم.',
      keyQuestion: 'هل تفي هذه الفكرة باحتياجات المستخدم بأبسط صورة ممكنة؟ وكيف سيتفاعل معها؟',
      tools: ['الرسم الورقي', 'نماذج Figma', 'فيديوهات شرحية']
    },
    { 
      title: 'Test (اختبار)', 
      icon: BeakerIcon, 
      color: 'bg-rose-500', 
      context: 'validation' as MentorContext, 
      description: 'عرض النموذج الأولي على المستخدمين الحقيقيين لجمع ملاحظاتهم وتعديل الحل بناءً على ردود أفعالهم.',
      goal: 'تقرير التغذية الراجعة وخطة تحسين المنتج النهائية.',
      keyQuestion: 'ما الذي نال إعجاب المستخدم الحقيقي؟ وما هي العقبات التي واجهته عند استخدام الحل؟',
      tools: ['جلسات اختبار المستخدم', 'استطلاعات الرأي', 'مصفوفة التغذية الراجعة']
    }
  ];

  const addNote = () => {
    const colors = ['bg-yellow-100', 'bg-blue-100', 'bg-pink-100', 'bg-green-100', 'bg-purple-100'];
    const newNote: StickyNote = {
      id: Date.now().toString(),
      text: '',
      author: 'أنت',
      votes: [],
      color: colors[Math.floor(Math.random() * colors.length)],
      x: 0, y: 0,
      timestamp: Date.now()
    };
    setNotes([newNote, ...notes]);
    setNotification({ message: 'تمت مشاركة الملاحظة بنجاح على اللوحة!', type: 'success' });
  };

  const handleAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    const notesContent = notes.map(n => n.text).join(' | ');
    const prompt = `أنت مستشار استراتيجي لمدير مختبر إبداع. حلل الأفكار التالية المطروحة من الفريق في مرحلة ${phases[activePhase].title} وقدم ملخصاً تنفيذياً لمدير المختبر يحدد أفضل فكرة وتوصيات للخطوة القادمة: ${notesContent}`;
    
    try {
      const response = await getAiMentorResponse([{ role: 'user', parts: [{ text: prompt }] }], 'validation');
      setAiSummary(response);
      setNotification({ message: 'تم الانتهاء من التحليل الذكي للمخرجات.', type: 'info' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const topIdea = useMemo(() => {
    return [...notes].sort((a, b) => b.votes.length - a.votes.length)[0];
  }, [notes]);

  const ActivePhaseIcon = phases[activePhase].icon;

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-right relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-bounce-in">
           <div className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] shadow-2xl border ${
             notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
           }`}>
              <div className="bg-white/20 p-2 rounded-full">
                 <CheckCircleIcon className="w-5 h-5" />
              </div>
              <span className="font-black text-sm italic">{notification.message}</span>
           </div>
        </div>
      )}

      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-yellow-400 rounded-3xl shadow-xl shadow-yellow-100 rotate-3 transition-transform hover:rotate-0">
              <LightBulbIcon className="w-8 h-8 text-slate-900" />
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">مختبر التصميم التشاركي</h1>
              <p className="text-slate-400 font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                جلسة حية: {participants.length} مبدعين يشاركون الآن
              </p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {userRole === 'LAB_MANAGER' && (
             <div className="flex gap-2">
                <button 
                  onClick={() => setShowManagerView(!showManagerView)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-xl ${
                    showManagerView ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <PresentationChartLineIcon className="w-5 h-5" />
                  {showManagerView ? 'إخفاء لوحة الإدارة' : 'لوحة تحكم المدير'}
                </button>
             </div>
           )}

           <button 
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl bg-slate-900 text-white hover:bg-black active:scale-95"
           >
            <RectangleGroupIcon className="w-5 h-5" />
            {showWhiteboard ? 'العودة للمسار الإرشادي' : 'فتح لوحة الأفكار التشاركية'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
           {showManagerView && userRole === 'LAB_MANAGER' && (
             <div className="mb-8 bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
                   <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-3 border-r-4 border-yellow-400 pr-6">
                        <SparklesIcon className="w-7 h-7 text-yellow-400" />
                        <h3 className="text-2xl font-black italic tracking-tight">تحليل مخرجات المرحلة (إدارة)</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المخرج المتوقع</p>
                            <p className="text-lg font-black text-yellow-400 italic">{phases[activePhase].goal}</p>
                         </div>
                         <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">نسبة التوافق</p>
                            <p className="text-3xl font-black text-blue-400">{Math.min(notes.length * 15, 100)}%</p>
                         </div>
                         <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">أفضل رؤية</p>
                            <p className="text-xs font-black text-white truncate italic">{topIdea?.text || 'لا توجد أفكار بعد'}</p>
                         </div>
                      </div>

                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4 shadow-inner">
                         <div className="flex justify-between items-center">
                            <h4 className="text-sm font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                               <BoltIcon className="w-5 h-5" />
                               ملخص Gemini الإستراتيجي للمدير
                            </h4>
                            <button 
                              onClick={handleAiAnalysis}
                              disabled={isAiAnalyzing}
                              className="text-[10px] font-black bg-blue-500 px-4 py-2 rounded-xl hover:bg-blue-400 transition-all flex items-center gap-2 shadow-lg"
                            >
                              {isAiAnalyzing ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                              تحديث التحليل اللحظي
                            </button>
                         </div>
                         <div className="text-sm text-slate-300 font-bold leading-relaxed italic max-h-40 overflow-y-auto pr-2 no-scrollbar">
                            {aiSummary || 'انقر على "تحديث التحليل" للحصول على مراجعة ذكية لمخرجات الجلسة الحالية.'}
                         </div>
                      </div>
                   </div>

                   <div className="w-full md:w-80 space-y-6">
                      <h4 className="text-sm font-black text-yellow-400 uppercase tracking-widest border-r-4 border-yellow-400 pr-4 italic">نبض مشاركة المبدعين</h4>
                      <div className="space-y-4">
                         {participants.sort((a,b)=>b.contributionCount - a.contributionCount).map(p => (
                           <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full ${p.color} flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>{p.initial}</div>
                                 <span className="text-xs font-bold text-slate-200">{p.name}</span>
                              </div>
                              <div className="text-left">
                                 <p className="text-[10px] font-black text-blue-400 italic">{p.contributionCount} مساهمة</p>
                                 <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((p.contributionCount/25)*100, 100)}%` }}></div>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           )}

           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm animate-slide-up relative min-h-[700px] flex flex-col overflow-hidden">
              {showWhiteboard ? (
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 border-b border-slate-50 pb-8">
                    <div className="border-r-4 border-yellow-400 pr-8">
                      <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">لوحة الأفكار الحية</h2>
                      <p className="text-base text-slate-400 font-bold mt-2 italic leading-relaxed">
                         تخيل مستقبلك في جهتك، عبر عن فكرتك، واصنع التغيير عبر الرقمنة.
                      </p>
                    </div>
                    <button 
                      onClick={addNote} 
                      className="px-12 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg flex items-center gap-4 shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 group"
                    >
                      <PlusIcon className="w-7 h-7 text-yellow-400 group-hover:rotate-90 transition-transform" />
                      إضافة ملاحظة جديدة
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
                     {notes.map(note => (
                       <div 
                         key={note.id} 
                         className={`${note.color} p-10 rounded-[3rem] shadow-xl hover:-translate-y-2 transition-all group relative border border-black/5 flex flex-col min-h-[300px] animate-pop-in rotate-1 hover:rotate-0`}
                       >
                          {/* Pin visualization */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md z-20"></div>

                          <div className="flex justify-between items-center mb-6">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm border border-black/5">{note.author[0]}</div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">{note.author}</span>
                             </div>
                             <button 
                               onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                               className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white/40 rounded-xl"
                             >
                                <TrashIcon className="w-5 h-5" />
                             </button>
                          </div>

                          <textarea 
                            value={note.text}
                            onChange={(e) => setNotes(notes.map(n => n.id === note.id ? {...n, text: e.target.value} : n))}
                            className="w-full flex-1 bg-transparent border-none outline-none font-bold text-xl text-slate-800 resize-none no-scrollbar text-right leading-relaxed placeholder:text-slate-400/40 italic"
                            placeholder="اكتب فكرتك المبتكرة هنا..."
                            autoFocus={note.text === ''}
                          />

                          <div className="mt-8 flex justify-between items-center pt-6 border-t border-black/5">
                             <div className="flex items-center gap-2">
                                <HandThumbUpIcon className={`w-5 h-5 ${note.votes.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="text-xs font-black text-slate-900 italic tracking-tighter">{note.votes.length} تصويت</span>
                             </div>
                             <button 
                               onClick={() => setNotes(notes.map(n => n.id === note.id ? {...n, votes: n.votes.includes('me') ? n.votes.filter(v=>v!=='me') : [...n.votes, 'me']} : n))}
                               className={`p-4 rounded-2xl transition-all shadow-md group/vote ${note.votes.includes('me') ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-400 hover:text-slate-900 hover:scale-110'}`}
                             >
                                <HandThumbUpIcon className="w-6 h-6" />
                             </button>
                          </div>
                       </div>
                     ))}
                     {notes.length === 0 && (
                       <div className="col-span-full py-24 text-center flex flex-col items-center gap-8 opacity-40 grayscale group cursor-pointer" onClick={addNote}>
                          <div className="p-10 bg-slate-50 rounded-full border-4 border-dashed border-slate-200 group-hover:border-yellow-400 transition-all">
                             <RectangleGroupIcon className="w-32 h-32 text-slate-200 group-hover:text-yellow-400 transition-colors" />
                          </div>
                          <div className="space-y-2">
                             <p className="font-black text-slate-400 text-2xl italic">اللوحة تنتظر لمستك الإبداعية الأولى!</p>
                             <p className="text-sm font-bold text-slate-300">انقر على الزر أعلاه لإضافة أول فكرة لمشروعك الثقافي.</p>
                          </div>
                       </div>
                     )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 space-y-12">
                   <div className="flex flex-col md:flex-row items-center gap-12 border-b border-slate-50 pb-12">
                      <div className={`p-10 rounded-[3rem] ${phases[activePhase].color} text-white shadow-2xl shadow-slate-200 animate-pop-in`}>
                         <ActivePhaseIcon className="w-20 h-20 stroke-[1.5]" />
                      </div>
                      <div className="flex-1 space-y-4 text-center md:text-right">
                         <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">المرحلة {activePhase + 1} من 5</span>
                            <h2 className="text-4xl font-black text-slate-900 italic tracking-tight uppercase">مرحلة {phases[activePhase].title}</h2>
                         </div>
                         <p className="text-slate-500 font-bold max-w-2xl leading-relaxed text-xl italic pr-0 md:pr-4">
                            "{phases[activePhase].description}"
                         </p>
                         <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                            <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm">
                               <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                               <span className="text-xs font-black text-emerald-600 uppercase tracking-widest italic">المخرج المستهدف: {phases[activePhase].goal}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 space-y-6 relative overflow-hidden group hover:bg-white transition-all shadow-inner hover:shadow-xl">
                         <QuestionMarkCircleIcon className="w-32 h-32 absolute -bottom-8 -left-8 text-slate-200/50 group-hover:scale-110 transition-transform duration-700" />
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-yellow-500" />
                            سؤال المرحلة الإستراتيجي
                         </h4>
                         <p className="text-xl font-black text-slate-800 leading-relaxed italic relative z-10">
                            "{phases[activePhase].keyQuestion}"
                         </p>
                      </div>

                      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6 group hover:shadow-xl transition-all">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500" />
                            حقيبة أدوات المرحلة
                         </h4>
                         <div className="flex flex-wrap gap-3">
                            {phases[activePhase].tools.map((tool, idx) => (
                              <span key={idx} className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                 {tool}
                              </span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col items-center justify-center pt-8">
                      <button 
                        onClick={() => setShowWhiteboard(true)}
                        className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-black hover:scale-105 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                      >
                        بدء العمل التشاركي والتدوين اللحظي
                      </button>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 flex items-center gap-2">
                        <BoltIcon className="w-4 h-4 text-yellow-400 animate-pulse" />
                        سيتم حفظ كافة المساهمات في سجل مخرجات المختبر تلقائياً
                      </p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Navigation - Enhanced Progress Map */}
        <div className="lg:col-span-1 space-y-6">
           <div className="p-10 bg-slate-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-black mb-10 italic tracking-tight border-r-4 border-blue-500 pr-4">خريطة التقدم الإبداعي</h3>
              <div className="space-y-8 relative">
                 <div className="absolute top-4 right-5 bottom-4 w-0.5 bg-white/10 -z-10"></div>
                 {phases.map((p, i) => {
                   const PhaseIcon = p.icon;
                   return (
                     <button 
                      key={i} 
                      onClick={() => { setActivePhase(i); setShowWhiteboard(false); }}
                      className={`w-full text-right flex items-center gap-5 transition-all group ${activePhase === i ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}
                     >
                        <div className={`p-4 rounded-[1.5rem] transition-all shadow-lg ${activePhase === i ? 'bg-yellow-400 text-slate-900 ring-4 ring-yellow-400/20' : 'bg-white/5 border border-white/5 group-hover:bg-white/10'}`}>
                           <PhaseIcon className="w-6 h-6 stroke-[2]" />
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                           <span className={`font-black text-sm mb-0.5 ${activePhase === i ? 'text-white' : 'text-slate-400'}`}>{p.title}</span>
                           <span className={`text-[9px] font-bold truncate max-w-[140px] italic ${activePhase === i ? 'text-yellow-400' : 'text-slate-50'}`}>
                              {p.goal}
                           </span>
                        </div>
                     </button>
                   );
                 })}
              </div>
           </div>

           <div className="p-10 bg-blue-50 text-blue-900 rounded-[4rem] border border-blue-100 shadow-sm relative overflow-hidden group">
              <BoltIcon className="w-20 h-20 absolute -bottom-6 -left-6 text-blue-200 group-hover:scale-125 transition-transform duration-700 opacity-50" />
              <h3 className="text-xl font-black mb-4 flex items-center gap-3 italic">
                <SparklesIcon className="w-6 h-6 text-blue-500" />
                لماذا التصميم التشاركي؟
              </h3>
              <p className="text-xs font-bold italic leading-relaxed text-slate-600">
                 "نحن لا نصمم للشباب، بل نصمم معهم. هذا المسار يضمن أن الحلول الرقمية نابعة من صميم احتياجات الجهات التونسية."
              </p>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes bounce-in {
          0% { opacity: 0; transform: translate(-50%, 20px) scale(0.9); }
          50% { opacity: 1; transform: translate(-50%, -10px) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default DesignThinking;
