
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckIcon, 
  InformationCircleIcon, 
  ChevronDownIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  GlobeAltIcon,
  EyeIcon,
  CircleStackIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface GlossaryTerm {
  t: string;
  d: string;
  detailedExplanation: string;
  strategicImpact: string;
  isEssential: boolean;
  category: 'تقني' | 'إداري' | 'منهجي';
  examples?: string[];
}

const Glossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'تقني' | 'إداري' | 'منهجي'>('all');

  const terms: GlossaryTerm[] = useMemo(() => [
    { 
      t: 'Stakeholder Mapping', 
      d: 'رسم خريطة أصحاب المصلحة لفهم الأدوار والتأثير.', 
      detailedExplanation: 'عملية تحديد كافة الجهات المتأثرة أو المؤثرة في المشروع (بلدية، جمعيات، مدارس). تساعد في فهم ديناميكيات القوة في الجهة.',
      strategicImpact: 'تضمن الدعم المحلي للمشروع وتقلل من معوقات التنفيذ البيروقراطية.',
      category: 'إداري',
      isEssential: true
    },
    { 
      t: 'M&E (Monitoring and Evaluation)', 
      d: 'المتابعة والتقييم لضمان التعلم التنظيمي وتحسين القرار.', 
      detailedExplanation: 'نظام مستمر لجمع البيانات حول أداء المختبر وتحليل مدى تحقيق الأهداف المسطرة في الدليل.',
      strategicImpact: 'يسمح بتعديل الخطط الاستراتيجية بناءً على الأثر الحقيقي الملموس وليس الانطباعات.',
      category: 'إداري',
      isEssential: true
    },
    { 
      t: 'PMBOK / PRINCE2', 
      d: 'أدلة معايير إدارة المشاريع العالمية كمرجعية للممارسات.', 
      detailedExplanation: 'منهجيات دولية تضمن هيكلة واضحة للمشروع من البداية إلى الإغلاق، مع التركيز على جودة المخرجات.',
      strategicImpact: 'يرفع من كفاءة مديري المختبرات في التعامل مع الميزانيات والجدول الزمني.',
      category: 'إداري',
      isEssential: false
    },
    { 
      t: 'Incubation (الاحتضان)', 
      d: 'تحويل النماذج الأولية إلى مبادرات قابلة للحياة ومستدامة.', 
      detailedExplanation: 'المرحلة التي تلي الـ Prototype، حيث يوفر المختبر الدعم الفني والقانوني والمالي لتحويل فكرة الشاب إلى مشروع حقيقي.',
      strategicImpact: 'الضمانة الوحيدة لعدم موت الأفكار المبتكرة بعد انتهاء ورشات العمل.',
      category: 'منهجي',
      isEssential: true
    },
    { 
      t: 'Valorisation (التثمين)', 
      d: 'تحويل الأصول الثقافية إلى قيمة اقتصادية أو اجتماعية مضافة.', 
      detailedExplanation: 'عملية إبداعية تأخذ أصل مادي (مثل الحصيرة) أو غير مادي (حكاية) وتصيغها في منتج رقمي أو تجربة سياحية.',
      strategicImpact: 'جوهر اقتصاد المعنى البديل للهجرة؛ خلق الثروة من الهوية المحلية.',
      category: 'منهجي',
      isEssential: true
    },
    { 
      t: 'Co-design', 
      d: 'تصميم تشاركي يشرك المستخدم النهائي في العملية الإبداعية.', 
      detailedExplanation: 'منهجية ديمقراطية تضع الشاب التونسي في قلب صناعة القرار حول شكل ومحتوى المنتج الثقافي.',
      strategicImpact: 'يرفع معدل ملكية المجتمع للمشروع ويضمن استدامته العميقة.',
      category: 'منهجي',
      isEssential: true
    },
    { 
      t: 'LED (Local Economic Development)', 
      d: 'التنمية الاقتصادية المحلية القائمة على الموارد الجهوية.', 
      detailedExplanation: 'رؤية استراتيجية ترى في خصوصية كل ولاية تونسية ميزة تنافسية لا عبئاً جغرافياً.',
      strategicImpact: 'ربط المختبرات بالدورة الاقتصادية الوطنية وخلق فرص عمل محلية.',
      category: 'إداري',
      isEssential: true
    },
    { 
      t: 'User Story', 
      d: 'قصة مستخدم تصف حاجة وظيفية من منظور المستفيد.', 
      detailedExplanation: 'أداة تقنية بسيطة (أنا كـ... أريد أن... لكي...) لتحديد ما يحتاجه الشباب فعلياً من المنصات الرقمية.',
      strategicImpact: 'توجيه المطورين التقنيين لبناء أدوات تخدم أهداف المختبر الحقيقية.',
      category: 'تقني',
      isEssential: false
    },
    { 
      t: 'kbps / MP3 / MP4', 
      d: 'صيغ ترميز الصوت والفيديو وقياس معدل البت للجودة.', 
      detailedExplanation: 'المعايير التقنية التي يجب اتباعها لضمان جودة البودكاست والمحتوى الرقمي المنتج داخل المختبرات.',
      strategicImpact: 'ضمان احترافية المخرجات الرقمية للمختبر وقابليتها للنشر العالمي.',
      category: 'تقني',
      isEssential: false
    }
  ], []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    return terms.filter(item => {
      const matchesSearch = item.t.toLowerCase().includes(debouncedSearch.toLowerCase()) || item.d.includes(debouncedSearch);
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearch, filterCategory, terms]);

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-right">
      {/* Header Panel */}
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-110 transition-transform"></div>
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-4 italic tracking-tight uppercase">
            <BookOpenIcon className="w-10 h-10 text-yellow-400" />
            قاموس المختبرات (2025-2026)
          </h2>
          <p className="text-slate-400 font-bold max-w-xl text-lg leading-relaxed">
            المرجع التقني والمنهجي لمختبرات الإبداع. لغة موحدة تجمع بين الإدارة الاستراتيجية والإبداع الرقمي.
          </p>
        </div>
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md relative z-10">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">إجمالي المفاهيم الموثقة</p>
           <p className="text-4xl font-black italic">{terms.length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
         <div className="relative w-full md:w-96 group">
            <MagnifyingGlassIcon className="w-6 h-6 absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="ابحث عن مفهوم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-14 pl-12 py-5 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-inner font-black text-right text-lg"
            />
         </div>
         <div className="flex gap-4">
            {['all', 'منهجي', 'إداري', 'تقني'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat as any)}
                className={`px-8 py-3.5 rounded-2xl text-xs font-black transition-all ${
                  filterCategory === cat ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'الكل' : cat}
              </button>
            ))}
         </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item, i) => (
          <div 
            key={i} 
            onClick={() => setExpandedId(expandedId === i ? null : i)}
            className={`group relative p-10 rounded-[3.5rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
              expandedId === i ? 'lg:col-span-2 xl:col-span-3 border-blue-400 scale-[1.01]' : 'bg-white border-slate-50 hover:border-blue-200 hover:shadow-xl'
            }`}
          >
            {item.isEssential && (
              <div className="absolute top-0 right-12 bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-b-2xl shadow-lg z-10 flex items-center gap-2">
                <StarIconSolid className="w-3.5 h-3.5 text-yellow-400" />
                <span>أساسي</span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
               <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:rotate-12 transition-transform">
                  {item.category === 'تقني' ? <BoltIcon className="w-6 h-6" /> : 
                   item.category === 'منهجي' ? <LightBulbIcon className="w-6 h-6" /> : <ShieldCheckIcon className="w-6 h-6" />}
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-3 italic">{item.t}</h3>
            <p className="text-slate-600 font-bold leading-relaxed">{item.d}</p>

            {expandedId === i && (
              <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slide-up">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                       <InformationCircleIcon className="w-5 h-5" />
                       شرح تفصيلي حسب الدليل
                    </h4>
                    <p className="text-base text-slate-700 leading-relaxed font-bold italic">{item.detailedExplanation}</p>
                 </div>
                 <div className="space-y-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                    <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest relative z-10">الأثر الاستراتيجي</h4>
                    <p className="text-sm font-black italic leading-relaxed relative z-10">{item.strategicImpact}</p>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}} />
    </div>
  );
};

export default Glossary;
