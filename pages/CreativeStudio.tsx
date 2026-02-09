
import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  ArrowPathIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  QueueListIcon,
  BoltIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  MapIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  BeakerIcon,
  LightBulbIcon,
  MusicalNoteIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { GoogleGenAI } from "@google/genai";
import { creativeStudioHistoryApi, authApi } from '../services/supabaseClient';

type StudioWorkshop = 'roadmap' | 'visit' | 'generative';

const CreativeStudio: React.FC = () => {
  const [activeWorkshop, setActiveWorkshop] = useState<StudioWorkshop>('roadmap');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { loadHistory(); }, [activeWorkshop]);

  const loadHistory = async () => {
    const user = await authApi.getCurrentUser();
    if (user) {
      const data = await creativeStudioHistoryApi.getByUser(user.id, activeWorkshop);
      setHistory(data);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setGeneratedOutput(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = '';

      if (activeWorkshop === 'roadmap') {
        prompt = `أنت موجه خبير في مختبرات الإبداع. حلل فكرة المشروع: "${input}". 
        أجب بصيغة JSON: { "title": "عنوان المشروع", "summary": "ملخص استراتيجي", "roadmap": [{ "step": 1, "title": "اسم المرحلة", "tasks": ["مهمة 1", "مهمة 2"] }] }`;
      } else if (activeWorkshop === 'visit') {
        prompt = `صمم مسار زيارة ثقافي تفاعلي بناءً على: "${input}". 
        أجب بصيغة JSON: { "title": "اسم المسار", "region": "الولاية", "itinerary": [{ "stop": 1, "place": "اسم المكان", "activity": "النشاط", "story": "سردية المكان" }] }`;
      } else if (activeWorkshop === 'generative') {
        prompt = `ولد لي 5 مقترحات إبداعية لـ: "${input}". 
        أجب بصيغة JSON: { "suggestion_type": "نوع المقترحات", "suggestions": [{ "text": "المحتوى", "explanation": "السبب الإبداعي" }] }`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" as any },
      });

      const data = JSON.parse(response.text);
      setGeneratedOutput(data);
    } catch (error) {
      console.error("AI Error:", error);
      alert("عذراً، حدث خطأ أثناء التوليد السحابي.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedOutput) return;
    setIsSaving(true);
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        alert("يرجى تسجيل الدخول أولاً.");
        return;
      }
      
      await creativeStudioHistoryApi.save({
        user_id: user.id,
        workshop_type: activeWorkshop,
        title: generatedOutput.title || generatedOutput.suggestion_type || 'مخرج إبداعي',
        description: generatedOutput.summary || generatedOutput.region || input.substring(0, 50),
        content: generatedOutput
      });
      
      alert("تم الحفظ في سجل التاريخ السحابي بنجاح!");
      loadHistory();
    } catch (error) {
      alert("خطأ في الحفظ: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-right font-['Cairo'] pt-10 px-10 bg-slate-50 min-h-screen">
      
      <div className="bg-slate-950 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-b-8 border-indigo-600">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6 border-r-8 border-yellow-400 pr-10">
               <SparklesIcon className="w-16 h-16 text-yellow-400 animate-pulse" />
               <div className="space-y-1">
                 <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">ستوديو الإبداع الذكي</h1>
                 <p className="text-slate-400 font-bold text-xl italic uppercase tracking-widest">فضاء التوليد والنمذجة السحابي</p>
               </div>
            </div>
          </div>
          
          <div className="flex bg-white/5 p-3 rounded-[3rem] border border-white/10 backdrop-blur-md">
             {[
               { id: 'roadmap', name: 'مسار مشروع', icon: RocketLaunchIcon },
               { id: 'visit', name: 'مسار زيارة', icon: MapIcon },
               { id: 'generative', name: 'مختبر الذكاء', icon: BeakerIcon }
             ].map(workshop => (
               <button 
                 key={workshop.id}
                 onClick={() => { setActiveWorkshop(workshop.id as StudioWorkshop); setGeneratedOutput(null); setInput(''); }}
                 className={`px-10 py-5 rounded-[2.5rem] text-sm font-black transition-all flex items-center gap-4 ${
                   activeWorkshop === workshop.id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-white'
                 }`}
               >
                 <workshop.icon className="w-6 h-6" />
                 {workshop.name}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-8 h-fit">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-4 border-r-4 border-indigo-600 pr-6 relative z-10">
                 <h3 className="text-2xl font-black italic">
                   {activeWorkshop === 'roadmap' ? 'منشئ المشاريع' : activeWorkshop === 'visit' ? 'مهندس المسارات' : 'المختبر الإبداعي'}
                 </h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4 text-right block">
                      {activeWorkshop === 'roadmap' ? 'اشرح فكرة مشروعك' : activeWorkshop === 'visit' ? 'حدد المنطقة أو المعالم' : 'ماذا تريد أن نولد؟'}
                    </label>
                    <textarea 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       placeholder={
                         activeWorkshop === 'roadmap' ? 'مثال: مشروع لرقمنة القصص الشعبية في القصرين...' : 
                         activeWorkshop === 'visit' ? 'مثال: مسار يربط بين معصرة تقليدية ومسجد أثري في صفاقس...' :
                         'مثال: ولد لي 5 أسماء لبودكاست يتحدث عن الهجرة والعودة...'
                       }
                       className="w-full p-8 bg-slate-50 rounded-[3rem] border-2 border-transparent focus:border-indigo-400 outline-none transition-all font-bold italic leading-relaxed h-56 shadow-inner text-lg text-right"
                    />
                 </div>
                 
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !input.trim()}
                    className="w-full py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-5 hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50 active:scale-95 group"
                 >
                    {isGenerating ? <ArrowPathIcon className="w-7 h-7 animate-spin" /> : <BoltIcon className="w-7 h-7 text-yellow-400 group-hover:rotate-12 transition-transform" />}
                    بدء التوليد الذكي
                 </button>
              </div>
           </div>

           {/* History Mini List */}
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <QueueListIcon className="w-5 h-5" />
                 تاريخ الاستوديو
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar pr-2">
                 {history.map(item => (
                   <div key={item.id} onClick={() => setGeneratedOutput(item.content)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                      <p className="font-black text-xs text-slate-900 truncate italic">{item.title}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{new Date(item.created_at).toLocaleDateString('ar-TN')}</p>
                   </div>
                 ))}
                 {history.length === 0 && <p className="text-[10px] text-slate-400 font-bold text-center py-4 italic">لا يوجد سجل محفوظ بعد.</p>}
              </div>
           </div>
        </div>

        {/* Output Display Area */}
        <div className="lg:col-span-8 space-y-8">
           {generatedOutput ? (
             <div className="bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-2xl animate-slide-up space-y-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px]"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10 border-b border-slate-50 pb-12">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl">
                            {activeWorkshop === 'roadmap' ? <RocketLaunchIcon className="w-10 h-10" /> : activeWorkshop === 'visit' ? <MapIcon className="w-10 h-10" /> : <BeakerIcon className="w-10 h-10" />}
                         </div>
                         <h2 className="text-5xl font-black text-slate-950 italic tracking-tighter leading-none">
                            {generatedOutput.title || generatedOutput.suggestion_type}
                         </h2>
                      </div>
                      <p className="text-slate-500 font-bold italic text-xl leading-relaxed max-w-2xl pr-2">
                        {generatedOutput.summary || generatedOutput.region || 'مخرج إبداعي من مختبر الذكاء الاصطناعي.'}
                      </p>
                   </div>
                   <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
                   >
                      {isSaving ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <CloudArrowUpIcon className="w-6 h-6" />}
                      حفظ السجل السحابي
                   </button>
                </div>

                <div className="space-y-10 relative z-10 text-right">
                   {activeWorkshop === 'roadmap' && generatedOutput.roadmap && (
                     <div className="space-y-8">
                        {generatedOutput.roadmap.map((step: any, idx: number) => (
                           <div key={idx} className="flex gap-10 group">
                              <div className="flex flex-col items-center">
                                 <div className="w-16 h-16 bg-slate-950 text-white rounded-3xl flex items-center justify-center font-black text-2xl z-10 shadow-xl group-hover:bg-indigo-600 transition-all group-hover:scale-110">
                                    {step.step}
                                 </div>
                                 {idx !== generatedOutput.roadmap.length - 1 && (
                                   <div className="w-1.5 h-full bg-slate-100 -mt-2 -mb-2 z-0"></div>
                                 )}
                              </div>
                              <div className="flex-1 pb-10">
                                 <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all shadow-sm hover:shadow-2xl">
                                    <h4 className="text-3xl font-black text-slate-900 italic mb-6">{step.title}</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {step.tasks.map((task: string, tIdx: number) => (
                                         <li key={tIdx} className="flex items-center gap-4 text-slate-600 font-bold italic text-lg justify-end">
                                            {task}
                                            <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                                         </li>
                                       ))}
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
           ) : isGenerating ? (
             <div className="bg-white p-32 rounded-[5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-10 h-full">
                <div className="relative">
                   <div className="w-48 h-48 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 bg-indigo-600 rounded-full shadow-2xl">
                     <SparklesIcon className="w-20 h-20 text-white animate-spin-slow" />
                   </div>
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter">جاري المعالجة السحابية...</h3>
             </div>
           ) : (
             <div className="bg-slate-100/50 p-32 rounded-[5rem] border-8 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-10 h-full opacity-60">
                <div className="p-16 bg-white rounded-full shadow-2xl border border-slate-50">
                   {activeWorkshop === 'roadmap' ? <RocketLaunchIcon className="w-32 h-32 text-slate-200" /> : activeWorkshop === 'visit' ? <MapIcon className="w-32 h-32 text-slate-200" /> : <BeakerIcon className="w-32 h-32 text-slate-200" />}
                </div>
                <p className="text-lg font-bold text-slate-300 italic max-w-sm mx-auto">أدخل مدخلاتك في الجانب الأيمن لنبدأ رحلة التوليد الذكي والتوثيق السحابي.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;
