
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  RocketLaunchIcon, 
  BeakerIcon, 
  WalletIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  SparklesIcon,
  TrashIcon,
  ArrowPathIcon,
  PaintBrushIcon,
  ComputerDesktopIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  Square3Stack3DIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  ArrowUpTrayIcon,
  TableCellsIcon,
  LinkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { projectsApi, storageApi, authApi, labsApi, assetsApi } from '../services/firebaseClient';

interface BudgetEntry {
  id: string;
  item: string;
  amount: number;
  type: 'expense' | 'income';
}

interface LogicalFramework {
  impact: string;       // الأثر العام (Impact)
  outcomes: string[];   // النتائج (Outcomes)
  outputs: string[];    // المخرجات (Outputs)
  activities: string[]; // الأنشطة (Activities)
  indicators: string[]; // مؤشرات القيس (Indicators)
}

interface ProjectData {
  title: string;
  category: string;
  description: string;
  owner: string;
  labId: string;
  assetId: string;      // الربط بالأصل الثقافي
  logicalFramework: LogicalFramework;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  budget: BudgetEntry[];
  feasibility: string;  // دراسة الجدوى
  files: string[];
}

const ProjectBuilder: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    category: 'رقمنة',
    description: '',
    owner: '',
    labId: '',
    assetId: '',
    logicalFramework: {
      impact: '',
      outcomes: [],
      outputs: [],
      activities: [],
      indicators: []
    },
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    budget: [
      { id: '1', item: 'تجهيزات رقمية', amount: 0, type: 'expense' },
      { id: '2', item: 'تمويل ذاتي/منحة', amount: 0, type: 'income' }
    ],
    feasibility: '',
    files: []
  });

  useEffect(() => {
    const fetchInitial = async () => {
      const [labsData, assetsData] = await Promise.all([
        labsApi.getAll(),
        assetsApi.getAll()
      ]);
      setLabs(labsData);
      setAssets(assetsData);
      if (labsData.length > 0) setFormData(prev => ({ ...prev, labId: labsData[0].id }));
      
      const user = await authApi.getCurrentUser();
      if (user) {
        const profile = await authApi.getProfile(user.uid);
        setFormData(prev => ({ ...prev, owner: profile?.full_name || user.email || 'مبدع' }));
      }
    };
    fetchInitial();
  }, []);

  const readiness = useMemo(() => {
    let score = 0;
    if (formData.title.length > 5) score += 15;
    if (formData.description.length > 20) score += 15;
    if (formData.logicalFramework.impact.length > 10) score += 15;
    if (formData.swot.strengths.length > 0) score += 15;
    if (formData.budget.some(b => b.amount > 0)) score += 15;
    if (formData.assetId) score += 15;
    if (formData.files.length > 0) score += 10;
    return Math.min(score, 100);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItemToLF = (key: keyof LogicalFramework) => {
    const labels = { 
      outcomes: 'نتيجة مباشرة', 
      outputs: 'مخرج ملموس', 
      activities: 'نشاط رئيسي', 
      indicators: 'مؤشر قيس الأثر' 
    };
    const item = prompt(`أدخل ${labels[key as keyof typeof labels]}:`);
    if (item) {
      setFormData({
        ...formData,
        logicalFramework: { 
          ...formData.logicalFramework, 
          [key]: [...(formData.logicalFramework[key] as string[]), item] 
        }
      });
    }
  };

  const addSwotItem = (key: keyof ProjectData['swot']) => {
    const item = prompt(`أدخل عنصر جديد في ${key === 'strengths' ? 'نقاط القوة' : key === 'weaknesses' ? 'نقاط الضعف' : key === 'opportunities' ? 'الفرص' : 'التهديدات'}:`);
    if (item) {
      setFormData({
        ...formData,
        swot: { ...formData.swot, [key]: [...formData.swot[key], item] }
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await storageApi.upload('assets', file);
      setFormData(prev => ({ ...prev, files: [...prev.files, publicUrl] }));
    } catch (err) {
      alert("خطأ في الرفع: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (readiness < 70) return alert("يرجى إكمال 70% على الأقل من صياغة المشروع.");
    setLoading(true);
    try {
      await projectsApi.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        labId: formData.labId,
        owner: formData.owner,
        status: 'pending',
        canvas: { 
          assetId: formData.assetId,
          logicalFramework: formData.logicalFramework,
          swot: formData.swot, 
          budget: formData.budget, 
          feasibility: formData.feasibility,
          files: formData.files 
        }
      });
      alert("تم إرسال مشروعك بنجاح للمراجعة!");
      setStep(1);
    } catch (err) {
      alert("خطأ أثناء الحفظ: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'الهوية والربط', icon: RocketLaunchIcon },
    { id: 2, name: 'الإطار المنطقي', icon: TableCellsIcon },
    { id: 3, name: 'تحليل SWOT', icon: BeakerIcon },
    { id: 4, name: 'الجدوى والمالية', icon: WalletIcon },
    { id: 5, name: 'المراجعة والاعتماد', icon: EyeIcon },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-24 text-right font-['Cairo']">
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm gap-8 relative overflow-hidden group">
        <div className="flex items-center gap-6 relative z-10">
           <div className="p-5 bg-slate-900 rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
              <Square3Stack3DIcon className="w-10 h-10 text-yellow-400" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">منشئ المشاريع الاستراتيجي</h1>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-3 italic text-sm">
                <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
                تصميم قائم على الأثر وموثوق بالأصول
              </p>
           </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-8 shadow-inner min-w-[320px] relative z-10">
           <div className="relative w-16 h-16 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
               <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
               <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * readiness) / 100} className="text-indigo-600 transition-all duration-1000" />
             </svg>
             <span className="absolute text-[12px] font-black text-slate-900">{readiness}%</span>
           </div>
           <div className="flex-1">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">جاهزية الصياغة</p>
             <p className="text-sm font-black text-slate-900 italic">
               {readiness < 100 ? "استكمل الإطار المنطقي والجدوى" : "مشروعك جاهز للمنافسة على التمويل"}
             </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-4">
           {steps.map((s) => {
             const Icon = s.icon;
             return (
               <button 
                 key={s.id} 
                 onClick={() => setStep(s.id)}
                 className={`w-full flex items-center justify-between p-7 rounded-[2.5rem] border-2 transition-all duration-500 ${
                   step === s.id 
                   ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.03] z-10' 
                   : 'bg-white text-slate-400 border-slate-50 hover:border-indigo-200'
                 }`}
               >
                 <div className="flex items-center gap-5">
                   <Icon className={`w-8 h-8 ${step === s.id ? 'text-yellow-400' : 'text-slate-200'}`} />
                   <span className="font-black text-sm uppercase tracking-tight">{s.name}</span>
                 </div>
                 {step > s.id && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
               </button>
             );
           })}
        </div>

        <div className="lg:col-span-3 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm min-h-[700px] flex flex-col relative overflow-hidden">
           {step === 1 && (
             <div className="space-y-10 animate-slide-up">
                <div className="border-r-4 border-yellow-400 pr-8">
                   <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">الهوية والربط بالأصول</h2>
                   <p className="text-base text-slate-400 font-bold mt-1">حدد فكرتك واربطها بخارطة الأصول الثقافية لتعزيز الهوية.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">اسم المشروع</label>
                     <input name="title" value={formData.title} onChange={handleInputChange} className="w-full p-6 bg-slate-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-400/10 font-black text-xl shadow-inner border border-transparent focus:bg-white transition-all" />
                   </div>
                   <div className="space-y-3">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">الأصل الثقافي المرتبط</label>
                     <div className="relative">
                        <select name="assetId" value={formData.assetId} onChange={handleInputChange} className="w-full p-6 bg-slate-50 rounded-[2rem] outline-none font-black text-lg shadow-inner border border-transparent appearance-none">
                          <option value="">-- اختر أصلاً من الخريطة --</option>
                          {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.metadata?.governorate})</option>)}
                        </select>
                        <LinkIcon className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">الدافع والرسالة</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full p-8 bg-slate-50 rounded-[2.5rem] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-400/10 transition-all font-bold italic leading-relaxed text-lg shadow-inner" placeholder="لماذا هذا المشروع الآن؟" />
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-10 animate-slide-up">
                <div className="border-r-4 border-indigo-600 pr-8">
                   <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">الإطار المنطقي (LogFrame)</h2>
                   <p className="text-base text-slate-400 font-bold mt-1">هيكل تفكيرك: من الأنشطة اليومية إلى الأثر البعيد المدى.</p>
                </div>

                <div className="space-y-6">
                   <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                      <label className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-3 block">الأثر النهائي (Impact)</label>
                      <textarea 
                        value={formData.logicalFramework.impact}
                        onChange={(e) => setFormData({...formData, logicalFramework: {...formData.logicalFramework, impact: e.target.value}})}
                        className="w-full bg-transparent border-none outline-none font-black text-xl resize-none italic"
                        placeholder="ما هو التغيير الكبير الذي سيحدث في جهتك بعد 3 سنوات؟"
                        rows={2}
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: 'outcomes', label: 'النتائج (Outcomes)', color: 'border-blue-400', desc: 'التغييرات السلوكية أو المؤسسية' },
                        { key: 'outputs', label: 'المخرجات (Outputs)', color: 'border-emerald-400', desc: 'المنتجات أو الخدمات الملموسة' },
                        { key: 'activities', label: 'الأنشطة (Activities)', color: 'border-amber-400', desc: 'ما سنفعله فعلياً' },
                        { key: 'indicators', label: 'المؤشرات (Indicators)', color: 'border-pink-400', desc: 'كيف سنقيس النجاح؟' }
                      ].map((lf) => (
                        <div key={lf.key} className={`bg-white border-2 ${lf.color} p-6 rounded-[2.5rem] space-y-4`}>
                           <div className="flex justify-between items-center">
                              <h4 className="font-black text-slate-900 italic text-sm">{lf.label}</h4>
                              <button onClick={() => addItemToLF(lf.key as any)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><PlusIcon className="w-4 h-4" /></button>
                           </div>
                           <p className="text-[10px] text-slate-400 font-bold italic">{lf.desc}</p>
                           <div className="space-y-2">
                              {formData.logicalFramework[lf.key as keyof LogicalFramework] instanceof Array && 
                                (formData.logicalFramework[lf.key as keyof LogicalFramework] as string[]).map((item, i) => (
                                  <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-[11px] font-bold italic">
                                     <span>- {item}</span>
                                     <button onClick={() => {
                                        const newArr = [...(formData.logicalFramework[lf.key as keyof LogicalFramework] as string[])];
                                        newArr.splice(i, 1);
                                        setFormData({...formData, logicalFramework: {...formData.logicalFramework, [lf.key]: newArr}});
                                     }} className="text-red-300 hover:text-red-500"><XMarkIcon className="w-3 h-3" /></button>
                                  </div>
                                ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {step === 4 && (
             <div className="space-y-10 animate-slide-up">
                <div className="border-r-4 border-emerald-500 pr-8">
                   <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">الجدوى والاستدامة</h2>
                   <p className="text-base text-slate-400 font-bold mt-1">تأكد من أن مشروعك ليس مجرد فكرة عابرة، بل عمل مستدام.</p>
                </div>

                <div className="space-y-6">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">دراسة الجدوى (Feasibility Study)</label>
                   <textarea 
                    name="feasibility" 
                    value={formData.feasibility} 
                    onChange={handleInputChange} 
                    rows={6} 
                    className="w-full p-8 bg-slate-50 rounded-[2.5rem] outline-none font-bold italic leading-relaxed text-lg shadow-inner" 
                    placeholder="حلل التكاليف مقابل العائد الاجتماعي، الفرص الاقتصادية، وكيف سيستمر المشروع بعد التمويل الأول." 
                   />
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-[3.5rem] shadow-2xl">
                   <h3 className="text-xl font-black mb-6 italic flex items-center gap-3">
                      <WalletIcon className="w-8 h-8 text-yellow-400" />
                      الميزانية التقديرية
                   </h3>
                   <div className="space-y-4">
                      {formData.budget.map((b, i) => (
                        <div key={b.id} className="flex gap-4 items-center">
                           <input 
                             value={b.item} 
                             onChange={(e) => {
                               const newB = [...formData.budget];
                               newB[i].item = e.target.value;
                               setFormData({...formData, budget: newB});
                             }}
                             className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 outline-none font-bold" 
                             placeholder="البند" 
                           />
                           <input 
                             type="number"
                             value={b.amount} 
                             onChange={(e) => {
                               const newB = [...formData.budget];
                               newB[i].amount = Number(e.target.value);
                               setFormData({...formData, budget: newB});
                             }}
                             className="w-32 bg-white/5 border border-white/10 rounded-xl p-3 outline-none font-bold text-center" 
                             placeholder="المبلغ" 
                           />
                           <select 
                            value={b.type}
                            onChange={(e) => {
                              const newB = [...formData.budget];
                              newB[i].type = e.target.value as any;
                              setFormData({...formData, budget: newB});
                            }}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none font-bold text-xs"
                           >
                              <option value="expense">مصروف</option>
                              <option value="income">إيراد/تمويل</option>
                           </select>
                           <button onClick={() => {
                             const newB = [...formData.budget];
                             newB.splice(i, 1);
                             setFormData({...formData, budget: newB});
                           }} className="text-red-400"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                      ))}
                      <button onClick={() => addBudgetEntry('expense')} className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 transition-all font-black text-xs">+ إضافة بند ميزانية</button>
                   </div>
                </div>
             </div>
           )}

           <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center">
              <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="px-10 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition-all disabled:opacity-20 active:scale-95">المرحلة السابقة</button>
              <div className="flex gap-4">
                 {step < steps.length ? (
                   <button onClick={() => setStep(s => s + 1)} className="px-16 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95">المرحلة التالية</button>
                 ) : (
                   <button onClick={handleFinalSubmit} disabled={loading || readiness < 70} className={`px-20 py-5 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-3 active:scale-95 ${readiness < 70 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-black'}`}>
                     {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <CheckCircleIcon className="w-6 h-6 text-emerald-400" />}
                     إرسال المشروع للمراجعة
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const addBudgetEntry = (type: 'expense' | 'income') => {}; // Defined inside component now

export default ProjectBuilder;
