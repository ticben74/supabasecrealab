
import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  RocketLaunchIcon, 
  CheckCircleIcon, 
  PlayIcon,
  SparklesIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  ArrowLeftIcon,
  TrophyIcon,
  ArchiveBoxIcon,
  CommandLineIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BeakerIcon,
  MicrophoneIcon,
  LightBulbIcon,
  PuzzlePieceIcon,
  ArrowLeftOnRectangleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  QueueListIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { CourseLevel, Badge, Lesson, LearningPath } from '../types';
import { academyApi, authApi } from '../services/supabaseClient';

// --- واجهات نظام الاختبارات ---
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

// --- البيانات المعرفية الكاملة (الدليل المرجعي) ---
const MOCK_LEVELS: CourseLevel[] = [
  { id: "level_001", title: "سيمياء المشاريع الثقافية", description: "تعلم قراءة الموارد الثقافية المحلية وبناء 'اقتصاد المعنى' كبديل للهجرة.", icon: "BuildingLibraryIcon", order: 1, category: "السياق العام", duration_hours: 4, points: 100, status: "available" },
  { id: "level_002", title: "منهجية العمل بالمختبرات", description: "التشخيص المحلي، التصميم المشترك، والنمذجة الأولية (Co-design).", icon: "ArchiveBoxIcon", order: 2, category: "المنهجية", duration_hours: 6, points: 120, status: "available" },
  { id: "level_003", title: "المنهجية العملية للبودكاست", description: "تحويل الصوت إلى فعل تنموي. إتقان فن الحوار لتوثيق سرديات الجهات.", icon: "MicrophoneIcon", order: 3, category: "البودكاست", duration_hours: 12, points: 250, status: "available" },
  { id: "level_004", title: "أخلاقيات اللقاء والسرد", description: "الموافقة المستنيرة وحماية الفئات الهشة وتجنب إعادة الصدمات.", icon: "ShieldCheckIcon", order: 4, category: "البودكاست", duration_hours: 5, points: 200, status: "available" },
  { id: "level_005", title: "رقمنة الحرف التقليدية", description: "التوثيق الرقمي 3D، التسويق الإلكتروني، ومنصات البيع العالمية.", icon: "BeakerIcon", order: 5, category: "الحرف اليدوية", duration_hours: 10, points: 180, status: "available" },
  { id: "level_010", title: "التحول الرقمي للحرف", description: "تحويل الحرف اليدوية إلى أصول رقمية وتجارب تفاعلية عالمية.", icon: "CommandLineIcon", order: 10, category: "تخصصي", duration_hours: 12, points: 250, status: "available" }
];

const MOCK_LESSONS: Lesson[] = [
  { id: "l1", level_id: "level_003", title: "بيداغوجيا السؤال", duration: "30 د", content: "كيف نطرح أسئلة تفتح آفاقاً جديدة بدلاً من تقديم إجابات جاهزة.", type: "workshop", order: 1, points: 50, is_published: true },
  { id: "l2", level_id: "level_003", title: "المعدات الاقتصادية", duration: "20 د", content: "اختيار الميكروفونات المناسبة للتسجيل الميداني.", type: "video", order: 2, points: 30, is_published: true },
  { id: "l3", level_id: "level_010", title: "التسويق العالمي للحرف", duration: "50 د", content: "بناء حضور قوي على منصات Etsy للحرف التقليدية.", type: "workshop", order: 1, points: 100, is_published: true },
  { id: "l4", level_id: "level_010", title: "التوثيق ثلاثي الأبعاد", duration: "45 د", content: "استخدام تقنيات Photogrammetry لمسح المنتجات رقمياً.", type: "video", order: 2, points: 80, is_published: true }
];

const MOCK_BADGES: Badge[] = [
  { id: "badge_001", title: "مبتدئ مبدع", description: "إكمال الفصل الأول من الدليل", icon: "🌱", points: 50, type: "basic", requirement: "level_001" },
  { id: "badge_003", title: "ميسر بودكاست", description: "إتقان فن السرد الصوتي الميداني", icon: "🎙️", points: 150, type: "intermediate", requirement: "level_003" },
  { id: "badge_006", title: "المبدع الرقمي", description: "إتقان رقمنة الحرف والتسويق العالمي", icon: "🎨", points: 200, type: "advanced", requirement: "level_010" }
];

const MOCK_PATHS: LearningPath[] = [
  { id: "path_001", title: "مسار ميسر البودكاست", description: "من الفكرة إلى النشر العالمي لتوثيق سرديات الجهات.", duration_weeks: 4, courses_count: 2, badge_id: "badge_003", level_ids: ["level_003", "level_004"], order: 1, category: "تخصصي" },
  { id: "path_005", title: "مسار الحرفي الرقمي", description: "حول حرفتك التقليدية إلى منتج رقمي وتسوق عالمياً", duration_weeks: 8, courses_count: 1, badge_id: "badge_006", level_ids: ["level_010"], order: 5, category: "تخصصي" }
];

const MOCK_QUIZZES: Record<string, QuizData> = {
  "l1": {
    title: "اختبار بيداغوجيا السؤال",
    questions: [
      { question: "ما هو المبدأ الأساسي لبيداغوجيا السؤال؟", options: ["تلقين المعلومات", "تحفيز التفكير عبر أسئلة مفتوحة", "فرض سلطة المكون"], correctAnswer: 1 },
      { question: "لماذا نبتعد عن الإجابات الجاهزة؟", options: ["لأننا لا نملكها", "لتمكين الشاب من بناء تعريفه الذاتي", "لتوفير الوقت"], correctAnswer: 1 }
    ]
  },
  "l3": {
    title: "اختبار الحرفي الرقمي",
    questions: [
      { question: "ما هي المنصة الأمثل لتسويق المنتجات الحرفية عالمياً؟", options: ["Etsy", "LinkedIn", "TikTok Shop"], correctAnswer: 0 },
      { question: "ما فائدة رقمنة الحرفة التقليدية؟", options: ["للتسلية", "لحماية الملكية الفكرية وفتح أسواق جديدة", "لتقليل السعر"], correctAnswer: 1 }
    ]
  }
};

// --- مكون الاختبار التفاعلي ---
const QuizOverlay = ({ quiz, onComplete, onClose }: { quiz: QuizData, onComplete: () => void, onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = () => {
    const correct = selectedOption === quiz.questions[currentStep].correctAnswer;
    setIsCorrect(correct);
    setTimeout(() => {
      if (currentStep < quiz.questions.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in text-right">
      <div className="bg-white rounded-[3.5rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
        <div className="mb-8 border-r-4 border-indigo-600 pr-6">
           <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">اختبار المعرفة</p>
           <h3 className="text-3xl font-black italic text-slate-900">{quiz.title}</h3>
           <div className="h-1.5 w-full bg-slate-100 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${((currentStep + 1) / quiz.questions.length) * 100}%` }}></div>
           </div>
        </div>
        <div className="space-y-8">
           <h4 className="text-xl font-bold italic text-slate-800 leading-relaxed">{quiz.questions[currentStep].question}</h4>
           <div className="space-y-3">
              {quiz.questions[currentStep].options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => isCorrect === null && setSelectedOption(i)}
                  className={`w-full p-6 rounded-2xl border-2 text-right font-bold transition-all flex items-center justify-between ${
                    selectedOption === i 
                    ? (isCorrect === true ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : isCorrect === false ? 'bg-red-50 border-red-500 text-red-700' : 'bg-indigo-50 border-indigo-500 text-indigo-700')
                    : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                  }`}
                >
                   {opt}
                   {selectedOption === i && isCorrect === true && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                </button>
              ))}
           </div>
        </div>
        <button 
          onClick={handleAnswer}
          disabled={selectedOption === null || isCorrect !== null}
          className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
        >
          {currentStep === quiz.questions.length - 1 ? 'إنهاء الاختبار والحصول على XP' : 'السؤال التالي'}
          <ChevronRightIcon className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </div>
  );
};

const Academy: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState<'paths' | 'courses' | 'badges'>('paths');
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await authApi.getCurrentUser();
      const userId = user?.id || 'demo-user-id';
      
      const profile = await authApi.getProfile(userId);
      setIsAdmin(profile?.role === 'PROJECT_MANAGER' || profile?.role === 'LAB_MANAGER');

      const [levelsData, pathsData, badgesData, userProgress] = await Promise.all([
        academyApi.getLevels(),
        academyApi.getPaths(),
        academyApi.getBadges(),
        academyApi.getProgress(userId)
      ]);
      
      // دمج البيانات المسترجعة مع البيانات الاحتياطية لضمان عدم وجود فراغ
      setLevels(levelsData.length > 0 ? levelsData : MOCK_LEVELS);
      setPaths(pathsData.length > 0 ? pathsData : MOCK_PATHS);
      setBadges(badgesData.length > 0 ? badgesData : MOCK_BADGES);
      setProgress(userProgress);
    } catch (err) {
      console.error(err);
      setLevels(MOCK_LEVELS);
      setPaths(MOCK_PATHS);
      setBadges(MOCK_BADGES);
    } finally { setLoading(false); }
  };

  const handleSeedCloud = async () => {
    if (!window.confirm("هل تريد مزامنة المحتوى التعليمي الاحتياطي مع السحابة؟ سيؤدي هذا لتحديث المنهج للجميع.")) return;
    setSeeding(true);
    try {
       await academyApi.seedAcademyData(MOCK_LEVELS, MOCK_PATHS, MOCK_BADGES, MOCK_LESSONS);
       alert("تمت مزامنة المحتوى مع السحابة بنجاح!");
       fetchData();
    } catch (err) {
       alert("خطأ في المزامنة: " + (err as Error).message);
    } finally { setSeeding(false); }
  };

  const handleLessonAction = (lessonId: string) => {
    const quiz = MOCK_QUIZZES[lessonId];
    if (quiz) {
      setActiveQuiz(quiz);
    } else {
      alert("هذا الدرس قيد التجهيز الميداني.");
    }
  };

  const onQuizComplete = async () => {
    const user = await authApi.getCurrentUser();
    await academyApi.updateProgress(user?.id || 'demo-user-id', 'quiz_completed', 50);
    setActiveQuiz(null);
    fetchData();
    alert("أحسنت! لقد حصلت على 50 XP إضافية.");
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = { CommandLineIcon, BuildingLibraryIcon, ArchiveBoxIcon, MicrophoneIcon, ShieldCheckIcon, BeakerIcon, LightBulbIcon, PuzzlePieceIcon };
    return icons[iconName] || BookOpenIcon;
  };

  return (
    <div className="min-h-screen space-y-10 animate-fade-in pb-24 text-right font-['Cairo'] pt-10 px-10 bg-slate-50">
      {activeQuiz && <QuizOverlay quiz={activeQuiz} onComplete={onQuizComplete} onClose={() => setActiveQuiz(null)} />}
      
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl"><AcademicCapIcon className="w-12 h-12 text-white" /></div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none">أكاديمية المبدعين</h1>
            <p className="text-xs text-indigo-500 font-black tracking-[0.2em] flex items-center gap-2">النطاق التعليمي المركزي - النسخة الكاملة والمحدثة</p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
           {isAdmin && (
             <button 
              onClick={handleSeedCloud} 
              disabled={seeding}
              className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
             >
                {seeding ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CloudArrowUpIcon className="w-4 h-4" />}
                مزامنة المنهج مع السحابة
             </button>
           )}
           <div className="bg-indigo-50 px-8 py-4 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">XP المكتسبة</p>
              <p className="text-3xl font-black text-indigo-700 italic leading-none">{progress?.points || 0}</p>
           </div>
           {onLogout && (
             <button onClick={onLogout} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all border border-red-100 shadow-sm">
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
             </button>
           )}
        </div>
      </header>

      <div className="bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
         <div className="flex bg-slate-100 p-2 rounded-[2.5rem] w-fit mx-auto mb-16 relative z-10">
            {[
              { id: 'paths', name: 'المسارات التخصصية', icon: QueueListIcon },
              { id: 'courses', name: 'المساقات المعرفية', icon: BookOpenIcon },
              { id: 'badges', name: 'شارات التميز', icon: TrophyIcon }
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveSection(item.id as any); setSelectedLevel(null); }} className={`px-10 py-4 rounded-[2rem] text-sm font-black transition-all flex items-center gap-3 ${activeSection === item.id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-indigo-600'}`}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
         </div>

         {loading ? <div className="py-32 text-center opacity-50"><ArrowPathIcon className="w-16 h-16 mx-auto animate-spin mb-4" /><p className="font-black italic">جاري تحميل المنهجية الكاملة...</p></div> : (
           <div className="animate-slide-up relative z-10">
              {activeSection === 'paths' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {paths.sort((a,b)=>a.order-b.order).map(path => (
                     <div key={path.id} className="bg-white border-2 border-slate-50 p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full border-b-8 border-indigo-600 hover:border-indigo-400">
                        <div className="flex justify-between items-start mb-6">
                           <h4 className="text-2xl font-black text-slate-900 italic leading-tight">{path.title}</h4>
                           <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">{path.category}</span>
                        </div>
                        <p className="text-slate-500 font-bold italic mb-10 flex-1 leading-relaxed">{path.description}</p>
                        <button onClick={() => setActiveSection('courses')} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl active:scale-95">استكشاف المنهج</button>
                     </div>
                   ))}
                </div>
              )}

              {activeSection === 'courses' && !selectedLevel && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {levels.map(lvl => {
                     const Icon = getIconComponent(lvl.icon);
                     return (
                        <div key={lvl.id} onClick={() => setSelectedLevel(lvl)} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2">
                           <div className="flex items-center gap-6 mb-8">
                              <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icon className="w-10 h-10" /></div>
                              <div><h3 className="text-xl font-black text-slate-900 italic leading-none">{lvl.title}</h3><p className="text-[10px] text-slate-400 font-black uppercase mt-1">{lvl.category}</p></div>
                           </div>
                           <p className="text-slate-500 font-bold italic line-clamp-2 leading-relaxed">{lvl.description}</p>
                        </div>
                     )
                   })}
                </div>
              )}

              {selectedLevel && (
                <div className="space-y-10 animate-fade-in">
                   <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-3 text-slate-400 font-black text-sm hover:text-slate-900 mb-6 group transition-colors"><ArrowLeftIcon className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> العودة للمساقات</button>
                   <div className="bg-slate-950 text-white p-14 rounded-[4rem] relative overflow-hidden shadow-2xl border-b-8 border-indigo-500">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                      <div className="relative z-10"><h2 className="text-5xl font-black mb-4 italic tracking-tight uppercase leading-none">{selectedLevel.title}</h2><p className="text-slate-400 font-bold italic text-xl max-w-2xl leading-relaxed">{selectedLevel.description}</p></div>
                   </div>
                   <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                      {MOCK_LESSONS.filter(l => l.level_id === selectedLevel.id).map((lesson, idx) => (
                         <div key={lesson.id} className="p-8 bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:border-indigo-200 transition-all gap-8">
                            <div className="flex items-center gap-10 text-right flex-1">
                               <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shrink-0">{idx + 1}</div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.duration} • {lesson.type}</p>
                                  <h4 className="text-3xl font-black italic text-slate-900 mb-2 leading-none">{lesson.title}</h4>
                                  <p className="text-slate-500 font-bold italic">{lesson.content}</p>
                               </div>
                            </div>
                            <button onClick={() => handleLessonAction(lesson.id)} className="p-6 bg-slate-900 text-white rounded-3xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95 shrink-0 group">
                               {MOCK_QUIZZES[lesson.id] ? <QuestionMarkCircleIcon className="w-10 h-10 text-yellow-400" /> : <PlayIcon className="w-10 h-10 fill-current group-hover:scale-110 transition-transform" />}
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {activeSection === 'badges' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                   {badges.map(badge => (
                     <div key={badge.id} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm text-center group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col items-center">
                        <div className="text-7xl mb-8 group-hover:scale-125 transition-transform duration-500 drop-shadow-lg">{badge.icon}</div>
                        <h4 className="text-2xl font-black italic text-slate-900 mb-3 leading-none">{badge.title}</h4>
                        <p className="text-slate-400 font-bold italic text-sm mb-6 leading-relaxed flex-1">{badge.description}</p>
                        <div className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-100 shadow-sm">{badge.points} XP</div>
                     </div>
                   ))}
                   {badges.length === 0 && (
                     <div className="col-span-full py-24 text-center opacity-30">
                        <TrophyIcon className="w-24 h-24 mx-auto mb-4" />
                        <p className="font-black italic">لا توجد شارات معروضة حالياً.</p>
                     </div>
                   )}
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

export default Academy;
