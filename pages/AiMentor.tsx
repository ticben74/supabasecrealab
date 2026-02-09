
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, ChevronDownIcon, LightBulbIcon, InformationCircleIcon, BoltIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { getAiMentorResponse } from '../services/geminiService';
import { Message, MentorContext } from '../types';
import { authApi, conversationsApi } from '../services/firebaseClient';

const AiMentor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'أهلاً بك يا بطل! أنا الموجه الذكي لمختبرات الإبداع. كيف يمكنني مساعدتك اليوم؟ اختر مجال تركيزنا من القائمة لنبدأ العمل على مشروعك.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [context, setContext] = useState<MentorContext>('general');
  const [showContextSelect, setShowContextSelect] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [context]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadHistory = async () => {
    const user = await authApi.getCurrentUser();
    if (!user) return;

    setIsHistoryLoading(true);
    try {
      const history = await conversationsApi.getHistory(user.uid, context);
      if (history.length > 0) {
        setMessages(history as Message[]);
      } else {
        setMessages([{ role: 'model', text: 'أهلاً بك مجدداً في هذا السياق. كيف تتقدم أفكارك اليوم؟' }]);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const user = await authApi.getCurrentUser();
    if (!user) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    // حفظ رسالة المستخدم في Firestore
    await conversationsApi.saveMessage(user.uid, context, 'user', userMsg);

    const historyForAi = newMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getAiMentorResponse(historyForAi, context);
    
    // حفظ رد الموجه في Firestore
    await conversationsApi.saveMessage(user.uid, context, 'model', responseText);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const contexts: { id: MentorContext; name: string; desc: string; icon: any; tips: string[] }[] = [
    { 
      id: 'general', 
      name: 'عام', 
      desc: 'محادثة مفتوحة حول المشروع',
      icon: SparklesIcon,
      tips: ['ركز على القيمة المضافة لجهتك.', 'فكر في كيفية جعل مشروعك مستداماً.', 'لا تخف من الأفكار الكبيرة.']
    },
    { 
      id: 'ideation', 
      name: 'توليد الأفكار', 
      desc: 'البحث عن فكرة مميزة للجهة',
      icon: LightBulbIcon,
      tips: ['استخدم طريقة العصف الذهني بدون قيود.', 'اربط فكرتك بأصل ثقافي محلي.', 'اسأل نفسك: "ما الذي يميز منطقتي؟"']
    },
    { 
      id: 'canvas', 
      name: 'نموذج العمل', 
      desc: 'تعبئة مخطط Business Canvas',
      icon: InformationCircleIcon,
      tips: ['حدد جمهورك المستهدف بدقة.', 'اجعل عرض القيمة بسيطاً وواضحاً.', 'فكر في قنوات الوصول المباشرة.']
    },
  ];

  const currentContextData = contexts.find(c => c.id === context) || contexts[0];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900 italic tracking-tight">
            <SparklesIcon className="w-8 h-8 text-yellow-400" />
            الموجه الذكي (بذاكرة Firestore)
          </h1>
          <p className="text-gray-500 font-bold italic">يتذكر الموجه تقدمك في كل سياق عمل سحابياً.</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowContextSelect(!showContextSelect)}
            className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:border-yellow-400 transition-all font-black text-sm"
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">سياق الموجه:</span>
            <span className="text-slate-900">{currentContextData.name}</span>
            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
          </button>
          
          {showContextSelect && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-4 z-50 animate-pop-in">
              <div className="space-y-2">
                {contexts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setContext(c.id); setShowContextSelect(false); }}
                    className={`w-full text-right p-4 rounded-2xl transition-all ${context === c.id ? 'bg-slate-900 text-white font-black' : 'hover:bg-slate-50 text-slate-600 font-bold'}`}
                  >
                    <div className="text-sm">{c.name}</div>
                    <div className={`text-[10px] opacity-60 ${context === c.id ? 'text-slate-300' : ''}`}>{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
        {isHistoryLoading && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center">
             <ArrowPathIcon className="w-10 h-10 text-yellow-400 animate-spin" />
          </div>
        )}
        
        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className={`p-6 rounded-[2rem] shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tl-none shadow-xl shadow-slate-200' 
                  : 'bg-slate-50 text-slate-800 rounded-tr-none border border-slate-100 italic font-medium'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm font-bold">{m.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 animate-pulse flex gap-2">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`اكتب سؤالك حول ${currentContextData.name}...`}
            className="flex-1 bg-white px-8 py-5 rounded-[2rem] border border-slate-100 outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 shadow-inner font-bold text-right"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-slate-900 text-white px-8 rounded-[2rem] hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
          >
            <PaperAirplaneIcon className="w-6 h-6 rotate-180" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default AiMentor;
