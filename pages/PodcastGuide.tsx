
import React, { useState, useRef, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  CheckCircleIcon,
  StopCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  LightBulbIcon,
  ClockIcon,
  SpeakerWaveIcon,
  MusicalNoteIcon,
  ScissorsIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  WrenchScrewdriverIcon,
  ArrowTopRightOnSquareIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ListBulletIcon,
  TagIcon,
  AcademicCapIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { storageApi, assetsApi } from '../services/firebaseClient';

const PodcastGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'ethics' | 'tools' | 'studio'>('curriculum');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleUpload(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) { alert("خطأ في الميكروفون"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleUpload = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const file = new File([blob], `podcast_test.webm`, { type: 'audio/webm' });
      const { publicUrl } = await storageApi.upload('podcasts', file);
      await assetsApi.save({
        name: `سردية مختبر - ${new Date().toLocaleDateString('ar-TN')}`,
        type: 'audio',
        file_url: publicUrl,
        metadata: { source: 'podcast_guide' }
      });
      setUploadSuccess(true);
    } finally { setIsUploading(false); }
  };

  const curriculum = [
    { 
      day: 1, 
      title: 'اليوم الأول: الاكتشاف والتصميم', 
      morning: ['جلسة افتتاحية: تعارف وبناء ثقة', 'عرض البودكاست: ماهيته وأهميته', 'العصف الذهني: القصص المحلية التي تستحق أن تروى'],
      evening: ['اختيار المشروع الجماعي بالتصويت', 'تحديد النوع والنبرة والجمهور', 'ورشة كتابة سيناريو وبناء الهيكل'],
      icon: LightBulbIcon,
      color: 'border-yellow-400'
    },
    { 
      day: 2, 
      title: 'اليوم الثاني: الإنتاج والتجريب', 
      morning: ['التحضير للمقابلات: كيف نسأل? كيف نستمع?', 'تمرين الاستماع النشط للبيئة المحيطة', 'تمرين السرد الجماعي'],
      evening: ['التسجيل الفعلي: المقابلات والأصوات', 'التقاط اللحظات العفوية في الحي والسوق', 'توزيع الأدوار التقنية'],
      icon: MicrophoneIcon,
      color: 'border-blue-400'
    },
    { 
      day: 3, 
      title: 'اليوم الثالث: ما بعد الإنتاج والاحتفاء', 
      morning: ['ورشة مونتاج: تحرير التسجيالت', 'إضافة الموسيقى والمؤثرات الصوتية', 'التحويل النهائي للملفات'],
      evening: ['جلسة استماع جماعية واحتفاء', 'تقييم جماعي: ماذا تحقق من نجاحات؟', 'التخطيط للنشر وتصميم الغلاف'],
      icon: RocketLaunchIcon,
      color: 'border-emerald-400'
    }
  ];

  const ethics = [
    { title: 'الموافقة المستنيرة', desc: 'ليست إجراءً بيروقراطياً، بل احترام لكرامة الشخص. اشرح الغرض ومن سيستمع بوضوح.', icon: ShieldCheckIcon },
    { title: 'حق الانسحاب', desc: 'اعتراف بأن الصوت ملك صاحبه. يحق له رفض الإجابة أو الانسحاب في أي لحظة.', icon: ScissorsIcon },
    { title: 'حماية القاصرين', desc: 'وعي بالمسؤولية القانونية. الحصول على إذن ولي الأمر كتابياً ضروري جداً.', icon: UserGroupIcon },
    { title: 'تجنب إعادة الصدمات', desc: 'عدم إجبار أحد على الحديث عن تجارب مؤلمة (هجرة فاشلة) دون استعداد نفسي كامل.', icon: ExclamationTriangleIcon }
  ];

  const productionTools = [
    {
      category: 'هندسة ومونتاج الصوت',
      icon: ScissorsIcon,
      items: [
        { 
          name: 'Audacity', 
          desc: 'الخيار الأول والمجاني تماماً (Open Source). يوفر أدوات احترافية لتسجيل وتعديل الصوت وتصفية الضجيج يدوياً ومثالي لأجهزة الكمبيوتر الضعيفة.', 
          link: 'https://www.audacityteam.org/',
          price: 'مجاني تماماً',
          tutorial: 'https://www.youtube.com/results?search_query=audacity+tutorial+arabic'
        },
        { 
          name: 'Adobe Podcast (AI)', 
          desc: 'أدوات ذكاء اصطناعي ثورية لتحسين جودة الصوت. ميزة Enhance Speech تجعل تسجيلك يبدو كأنه في استوديو احترافي عبر إزالة الصدى والضجيج.', 
          link: 'https://podcast.adobe.com/enhance',
          price: 'مجاني (ميزات محدودة)',
          tutorial: 'https://www.youtube.com/results?search_query=adobe+podcast+ai+tutorial'
        },
        { 
          name: 'Descript', 
          desc: 'يغير قواعد اللعبة؛ يسمح بمونتاج الصوت عبر تعديل النص المكتوب مباشرة. كما يوفر خاصية "Studio Sound" لتحسين جودة الصوت بشكل فوري.', 
          link: 'https://www.descript.com/',
          price: 'مجاني (ساعة واحدة/شهر)',
          tutorial: 'https://www.youtube.com/results?search_query=descript+tutorial'
        }
      ]
    },
    {
      category: 'مكتبات الموسيقى الحرة',
      icon: MusicalNoteIcon,
      items: [
        { 
          name: 'YouTube Audio Library', 
          desc: 'آلاف المقاطع الموسيقية والمؤثرات الصوتية المجانية تماماً للاستخدام التجاري والمقدمة من يوتيوب لضمان عدم حدوث مشاكل حقوق النشر.', 
          link: 'https://www.youtube.com/audiolibrary',
          price: 'مجاني تماماً',
          tutorial: 'https://www.youtube.com/results?search_query=youtube+audio+library+tutorial'
        },
        { 
          name: 'Free Music Archive', 
          desc: 'كنز للموسيقى المستقلة تحت رخص المشاع الإبداعي. مناسب جداً للبحث عن مقاطع موسيقية ذات طابع محلي أو فلكلوري عالمي.', 
          link: 'https://freemusicarchive.org/',
          price: 'مجاني (تأكد من الرخصة)',
          tutorial: 'https://www.youtube.com/results?search_query=free+music+archive+tutorial'
        },
        { 
          name: 'BBC Sound Effects', 
          desc: 'أكثر من 16,000 مؤثر صوتي احترافي من أرشيف BBC العريق. مثالي لإضافة واقعية لمشاهد البودكاست الدرامية.', 
          link: 'https://sound-effects.bbcrewind.co.uk/',
          price: 'مجاني (غير تجاري)',
          tutorial: 'https://www.youtube.com/results?search_query=bbc+sound+effects+tutorial'
        }
      ]
    },
    {
      category: 'منصات النشر والتوزيع',
      icon: CloudArrowUpIcon,
      items: [
        { 
          name: 'Spotify for Podcasters', 
          desc: 'كانت تعرف سابقاً بـ Anchor. أسهل طريقة لرفع وتوزيع البودكاست على كل المنصات مجاناً مع إمكانية التسجيل مباشرة من الهاتف.', 
          link: 'https://podcasters.spotify.com/',
          price: 'مجاني تماماً',
          tutorial: 'https://www.youtube.com/results?search_query=spotify+for+podcasters+tutorial+arabic'
        },
        { 
          name: 'RSS.com', 
          desc: 'منصة احترافية توفر واجهات سهلة وتوزيعاً سريعاً للمحتوى الصوتي مع إحصائيات دقيقة جداً حول المستمعين.', 
          link: 'https://rss.com/',
          price: 'تبدأ من 5$ شهرياً',
          tutorial: 'https://www.youtube.com/results?search_query=rss.com+podcast+tutorial'
        },
        { 
          name: 'SoundCloud', 
          desc: 'خيار ممتاز لبناء مجتمع تفاعلي حول سردياتك الصوتية. تونس لديها قاعدة مستخدمين نشطة جداً على ساوند كلاود.', 
          link: 'https://soundcloud.com/for/podcasters',
          price: 'مجاني (حتى 3 ساعات)',
          tutorial: 'https://www.youtube.com/results?search_query=soundcloud+podcast+tutorial'
        }
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-right">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-4 border-r-4 border-yellow-400 pr-8">
                <MicrophoneIcon className="w-12 h-12 text-yellow-400" />
                <h1 className="text-4xl font-black italic tracking-tight uppercase">دليل ميسّر البودكاست</h1>
             </div>
             <p className="text-slate-400 font-bold max-w-2xl text-lg italic leading-relaxed">
               "الصوت هو الجسر الأول بين الذات والعالم". دليل المختبر لتحويل "الحرقة" إلى سردية إيجابية وبناء "هوية الإبداع".
             </p>
          </div>
          <div className="flex flex-wrap justify-center bg-white/5 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
             {[
               { id: 'curriculum', name: 'البرنامج', icon: BookOpenIcon },
               { id: 'ethics', name: 'الميثاق الأخلاقي', icon: ShieldCheckIcon },
               { id: 'tools', name: 'أدوات الإنتاج', icon: WrenchScrewdriverIcon },
               { id: 'studio', name: 'الاستوديو حياً', icon: SpeakerWaveIcon }
             ].map(t => (
               <button 
                 key={t.id} 
                 onClick={() => setActiveTab(t.id as any)}
                 className={`px-8 py-4 rounded-[1.8rem] text-xs font-black transition-all flex items-center gap-3 ${
                   activeTab === t.id ? 'bg-yellow-400 text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'
                 }`}
               >
                 <t.icon className="w-5 h-5" />
                 {t.name}
               </button>
             ))}
          </div>
        </div>
      </div>

      {activeTab === 'curriculum' && (
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
           <div className="bg-blue-50 p-8 rounded-[3rem] border border-blue-100 flex items-center gap-6">
              <InformationCircleIcon className="w-10 h-10 text-blue-600 shrink-0" />
              <p className="text-blue-900 font-black italic text-lg leading-relaxed">
                برنامج الـ 3 أيام: من المشروع إلى الحركة الثقافية المستدامة.
              </p>
           </div>
           <div className="space-y-6">
              {curriculum.map((c) => (
                <div key={c.day} className={`bg-white border-2 rounded-[3.5rem] transition-all overflow-hidden ${expandedDay === c.day ? c.color : 'border-slate-50 opacity-60 hover:opacity-100'}`}>
                   <button 
                    onClick={() => setExpandedDay(expandedDay === c.day ? null : c.day)}
                    className="w-full p-10 flex items-center justify-between text-right"
                   >
                      <div className="flex items-center gap-8">
                         <div className={`p-4 rounded-2xl ${expandedDay === c.day ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                            <c.icon className="w-8 h-8" />
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 italic">{c.title}</h3>
                      </div>
                      {expandedDay === c.day ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                   </button>
                   {expandedDay === c.day && (
                     <div className="px-10 pb-10 grid grid-cols-1 md:grid-cols-2 gap-10 animate-slide-up">
                        <div className="space-y-6">
                           <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                              <ClockIcon className="w-5 h-5" />
                              الحصة الصباحية (3 ساعات)
                           </h4>
                           <ul className="space-y-4">
                              {c.morning.map((m, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-600 font-bold italic">
                                   <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                   {m}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div className="space-y-6">
                           <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                              <ClockIcon className="w-5 h-5" />
                              الحصة المسائية (3 ساعات)
                           </h4>
                           <ul className="space-y-4">
                              {c.evening.map((e, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-600 font-bold italic">
                                   <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                                   {e}
                                </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'ethics' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-slide-up">
           <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-slate-900 italic">ميثاق أخلاقيات المختبر</h2>
              <p className="text-slate-500 font-bold italic max-w-2xl mx-auto">"المقابلة ليست مجرد جمع معلومات، إنها لقاء بين ذوات، ومساحة للكشف الآمن وعقد ثقة بين طرفين."</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ethics.map((e, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:border-yellow-400 transition-all group">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-yellow-400 transition-colors">
                         <e.icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 italic">{e.title}</h4>
                   </div>
                   <p className="text-slate-500 font-bold italic leading-relaxed">{e.desc}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="max-w-6xl mx-auto space-y-16 animate-slide-up">
           <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-slate-900 italic uppercase">حقيبة أدوات الإنتاج الصوتي</h2>
              <p className="text-slate-500 font-bold italic max-w-2xl mx-auto leading-relaxed">
                 مجموعة مختارة من أفضل البرمجيات والمنصات العالمية لضمان خروج سرديتك الثقافية بأفضل جودة تقنية ممكنة مع روابط للدروس التعليمية ومعلومات الأسعار.
              </p>
           </div>

           <div className="space-y-12">
              {productionTools.map((category, idx) => (
                <div key={idx} className="space-y-6">
                   <div className="flex items-center gap-4 border-r-4 border-indigo-600 pr-6">
                      <category.icon className="w-8 h-8 text-indigo-600" />
                      <h3 className="text-2xl font-black text-slate-900 italic">{category.category}</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {category.items.map((tool: any, tIdx: number) => (
                        <div key={tIdx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
                           <div className="absolute top-0 left-0 bg-indigo-600/5 w-24 h-24 rounded-br-[4rem] -translate-x-4 -translate-y-4"></div>
                           <div className="flex justify-between items-start mb-4 relative z-10">
                              <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{tool.name}</h4>
                              <SparklesIcon className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                           
                           <div className="flex items-center gap-2 mb-4 relative z-10">
                              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-1.5 border border-indigo-100 shadow-sm">
                                 <TagIcon className="w-3 h-3" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{tool.price}</span>
                              </div>
                           </div>

                           <p className="text-slate-500 font-bold text-sm italic mb-8 flex-1 leading-relaxed relative z-10">
                              {tool.desc}
                           </p>

                           <div className="grid grid-cols-2 gap-3 relative z-10">
                              <a 
                                href={tool.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                              >
                                 <span>الموقع</span>
                                 <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                              </a>
                              <a 
                                href={tool.tutorial} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                              >
                                 <span>درس تعليمي</span>
                                 <AcademicCapIcon className="w-3 h-3 text-indigo-500" />
                              </a>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-indigo-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -ml-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="space-y-4">
                    <h4 className="text-2xl font-black italic">نصيحة تقنية من المختبر</h4>
                    <p className="text-indigo-200 font-bold italic max-w-xl leading-relaxed">
                       "المحتوى هو الملك، لكن الجودة التقنية هي العرش. ابدأ ببرنامج Audacity فهو مجاني تماماً ويوفر كافة الأدوات التي يحتاجها المبدع في بداياته."
                    </p>
                 </div>
                 <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                    <ListBulletIcon className="w-12 h-12 text-yellow-400 mx-auto" />
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'studio' && (
        <div className="max-w-4xl mx-auto animate-slide-up space-y-10">
           <div className="bg-white p-12 rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
              <div className={`p-12 rounded-full transition-all duration-700 ${isRecording ? 'bg-red-50 text-red-500 animate-pulse scale-110 shadow-2xl' : 'bg-slate-50 text-slate-300'}`}>
                 <MicrophoneIcon className="w-24 h-24" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-slate-900 italic">سجل سرديتك الثقافية</h3>
                 <p className="text-slate-400 font-bold italic">يتم الرفع المباشر لـ Firebase Storage للتوثيق في أطلس الأصول.</p>
              </div>
              
              <div className="flex items-center gap-6">
                 {!isRecording ? (
                   <button 
                     onClick={startRecording}
                     className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
                   >
                     <SpeakerWaveIcon className="w-8 h-8" />
                     بدء التسجيل الحي
                   </button>
                 ) : (
                   <button 
                     onClick={stopRecording}
                     className="px-16 py-6 bg-red-600 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4 active:scale-95"
                   >
                     <StopCircleIcon className="w-8 h-8" />
                     إيقاف ({recordingTime}ث)
                   </button>
                 )}
              </div>

              {isUploading && (
                <div className="flex items-center gap-3 text-blue-600 font-black italic animate-bounce mt-4">
                   <ArrowPathIcon className="w-6 h-6 animate-spin" />
                   جاري النقل للسحابة...
                </div>
              )}

              {uploadSuccess && (
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-emerald-700 font-black italic flex items-center gap-4 animate-pop-in">
                   <CheckCircleIcon className="w-8 h-8" />
                   تم التوثيق بنجاح! يمكن العثور عليه في مكتبة الأصول.
                </div>
              )}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'المونتاج الموصى به', tool: 'Audacity', icon: ScissorsIcon },
                { name: 'الموسيقى الحرة', tool: 'YouTube Library', icon: MusicalNoteIcon },
                { name: 'منصات النشر', tool: 'Spotify / RSS', icon: UserGroupIcon }
              ].map((t, i) => (
                <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] text-center space-y-3 hover:bg-white transition-all border border-transparent hover:border-slate-100 shadow-sm">
                   <t.icon className="w-8 h-8 text-blue-500 mx-auto" />
                   <p className="font-black text-xs text-slate-400 uppercase tracking-widest">{t.name}</p>
                   <p className="font-black text-lg italic text-slate-900">{t.tool}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
};

export default PodcastGuide;
