
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  RocketLaunchIcon, 
  ChartBarIcon, 
  PlusIcon, 
  ArchiveBoxIcon, 
  SparklesIcon, 
  MicrophoneIcon, 
  BuildingLibraryIcon, 
  PaintBrushIcon, 
  GlobeAltIcon, 
  BeakerIcon, 
  CircleStackIcon,
  QueueListIcon,
  UserCircleIcon,
  ArrowUpRightIcon,
  PresentationChartLineIcon,
  BriefcaseIcon,
  StarIcon,
  LightBulbIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CommandLineIcon,
  InformationCircleIcon,
  MapIcon,
  TableCellsIcon,
  EyeIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ChartPieIcon,
  XMarkIcon,
  CameraIcon,
  UserPlusIcon,
  CloudArrowUpIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  IdentificationIcon,
  PhotoIcon,
  // Added ChatBubbleLeftRightIcon to resolve "Cannot find name" error
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { UserRole, Lab, Project, CulturalAsset } from '../types';
import { labsApi, projectsApi, kpisApi, assetsApi, storageApi } from '../services/firebaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface DashboardProps {
  role: UserRole;
}

const TUNISIA_CENTER: [number, number] = [33.8869, 9.5375];

const createMarkerIcon = (color: string, icon: string, shadow: string = 'rgba(0,0,0,0.1)') => new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class='marker-pin' style='background: ${color}; box-shadow: 0 4px 12px ${shadow};'><div class='marker-inner'>${icon}</div></div>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -40]
});

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'projects' | 'assets'>('all');
  
  // Create Lab States for PROJECT_MANAGER
  const [isCreateLabOpen, setIsCreateLabOpen] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '',
    province: 'تونس',
    managerName: '',
    managerEmail: '',
    managerImage: '',
    description: '',
    lat: 33.8869,
    lng: 9.5375,
    allocatedBudget: 75000
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [labsData, projectsData, kpiSummary, assetsData] = await Promise.all([
        labsApi.getAll(),
        projectsApi.getAll(),
        kpisApi.getDashboardSummary(),
        assetsApi.getAll()
      ]);
      setLabs(labsData as Lab[]);
      setProjects(projectsData as Project[]);
      setSummary(kpiSummary);
      setAssets(assetsData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { publicUrl } = await storageApi.upload('managers', file);
      setNewLab(prev => ({ ...prev, managerImage: publicUrl }));
    } catch (err) {
      alert("خطأ في رفع صورة المدير الفني.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateLab = async () => {
    if (!newLab.name || !newLab.managerName) {
      alert("يرجى إدخال اسم المختبر واسم المدير على الأقل.");
      return;
    }
    setIsLoading(true);
    try {
      await labsApi.create({
        code: `LAB-${newLab.province.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newLab.name,
        province: newLab.province,
        managerName: newLab.managerName,
        managerEmail: newLab.managerEmail,
        managerImage: newLab.managerImage,
        description: newLab.description,
        gps: { lat: newLab.lat, lng: newLab.lng },
        budget: { allocated: newLab.allocatedBudget, spent: 0 },
        icon: 'BuildingOfficeIcon'
      });
      setIsCreateLabOpen(false);
      setNewLab({ name: '', province: 'تونس', managerName: '', managerEmail: '', managerImage: '', description: '', lat: 33.8869, lng: 9.5375, allocatedBudget: 75000 });
      fetchData();
    } catch (err) {
      alert("حدث خطأ في النظام السحابي أثناء إنشاء المختبر.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 1. واجهة المدير العام (PROJECT_MANAGER)
  // ==========================================
  if (role === 'PROJECT_MANAGER') {
    return (
      <div className="space-y-12 animate-fade-in text-right font-['Cairo'] pb-24">
        {/* استراتيجية القيادة - الهيدر */}
        <header className="bg-slate-950 text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group border-b-8 border-yellow-500">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse"></div>
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-yellow-500 rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                   <PresentationChartLineIcon className="w-14 h-14 text-slate-950" />
                 </div>
                 <div className="space-y-1">
                   <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">مركز القيادة الاستراتيجي</h1>
                   <p className="text-yellow-500 font-black text-sm uppercase tracking-[0.4em] italic pr-1">النطاق الإداري والسيادي الوطني</p>
                 </div>
              </div>
              <p className="text-slate-400 font-bold max-w-3xl text-xl italic leading-relaxed pr-2">
                مرحباً سيادة المدير العام. تملك هنا صلاحية هندسة شبكة المختبرات، تعيين القيادات المحلية، ومراقبة تقاطع الإبداع الشبابي مع الأصول الثقافية.
              </p>
            </div>
            
            <button 
              onClick={() => setIsCreateLabOpen(true)}
              className="px-12 py-7 bg-white text-slate-950 rounded-[3rem] font-black text-2xl hover:bg-yellow-400 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-6 hover:scale-105 active:scale-95 group"
            >
               <PlusIcon className="w-10 h-10 group-hover:rotate-90 transition-transform" />
               إنشاء مختبر إبداع جديد
            </button>
          </div>
        </header>

        {/* الخارطة الموحدة ودليل المديرين */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           
           {/* الخارطة الاستراتيجية */}
           <div className="xl:col-span-7 bg-white rounded-[4rem] border border-slate-100 p-8 shadow-xl h-[750px] relative overflow-hidden">
                 <div className="absolute top-10 right-10 z-[100] flex gap-3">
                    <button onClick={() => setMapFilter('all')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg ${mapFilter === 'all' ? 'bg-slate-950 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>الكل</button>
                    <button onClick={() => setMapFilter('projects')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg ${mapFilter === 'projects' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>المشاريع</button>
                    <button onClick={() => setMapFilter('assets')} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg ${mapFilter === 'assets' ? 'bg-yellow-500 text-slate-950' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>الأصول</button>
                 </div>

                 <MapContainer center={TUNISIA_CENTER} zoom={7} className="h-full w-full">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    
                    {/* رصد المختبرات كقواعد إرساء */}
                    {labs.map(lab => (
                      <Marker key={lab.id} position={[lab.gps.lat, lab.gps.lng]} icon={createMarkerIcon('#ffffff', '🏢', 'rgba(255,255,255,0.3)')}>
                        <Popup minWidth={250}>
                          <div className="text-right font-['Cairo'] p-2">
                             <div className="flex items-center gap-3 mb-3 border-b pb-2">
                                {lab.managerImage ? <img src={lab.managerImage} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xs">👤</div>}
                                <div>
                                   <h4 className="font-black text-slate-900 text-sm leading-tight">{lab.name}</h4>
                                   <p className="text-[10px] text-slate-400 font-bold italic">{lab.managerName}</p>
                                </div>
                             </div>
                             <p className="text-[11px] text-slate-500 italic mb-2 line-clamp-2">{lab.description}</p>
                             <div className="flex justify-between text-[9px] font-black uppercase text-emerald-600">
                                <span>الميزانية المرصودة:</span>
                                <span>{lab.budget.allocated.toLocaleString()} DT</span>
                             </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* رصد المشاريع النشطة */}
                    {(mapFilter === 'all' || mapFilter === 'projects') && projects.map(proj => (
                       <Marker key={proj.id} position={[33.8869 + (Math.random()-0.5)*3, 9.5375 + (Math.random()-0.5)*2]} icon={createMarkerIcon('#4f46e5', '🚀', 'rgba(79, 70, 229, 0.4)')}>
                          <Popup>
                             <div className="text-right font-['Cairo']">
                                <h4 className="font-black text-slate-900">{proj.title}</h4>
                                <p className="text-[10px] text-slate-500 italic">بواسطة: {proj.owner}</p>
                             </div>
                          </Popup>
                       </Marker>
                    ))}
                 </MapContainer>
           </div>

           {/* دليل القيادات والمديرين */}
           <div className="xl:col-span-5 space-y-8">
              <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl space-y-8 h-full flex flex-col relative overflow-hidden">
                 <div className="flex items-center gap-4 border-r-4 border-slate-900 pr-6">
                    <IdentificationIcon className="w-10 h-10 text-slate-900" />
                    <h3 className="text-3xl font-black italic tracking-tight">دليل قيادات المختبرات</h3>
                 </div>

                 <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">
                    {labs.map((lab) => (
                      <div key={lab.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-white hover:border-yellow-400 transition-all cursor-pointer shadow-sm hover:shadow-2xl">
                         <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                               {lab.managerImage ? (
                                 <img src={lab.managerImage} alt={lab.managerName} className="w-24 h-24 rounded-[2rem] object-cover shadow-xl border-4 border-white ring-8 ring-slate-100 group-hover:ring-yellow-50 transition-all" />
                               ) : (
                                 <div className="w-24 h-24 rounded-[2rem] bg-slate-200 flex items-center justify-center text-slate-400 shadow-inner"><UserCircleIcon className="w-14 h-14" /></div>
                               )}
                               <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-slate-950 p-2 rounded-xl shadow-lg border-2 border-white"><ShieldCheckIcon className="w-5 h-5" /></div>
                            </div>
                            <div className="flex-1 text-center md:text-right overflow-hidden space-y-1">
                               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{lab.province}</p>
                               <h4 className="font-black text-slate-900 text-2xl italic truncate">{lab.name}</h4>
                               <p className="text-lg font-bold text-slate-500 italic">{lab.managerName || 'لم يتم تعيين قائد بعد'}</p>
                            </div>
                         </div>
                         <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                               <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase">ميزانية: {lab.budget.allocated.toLocaleString()} DT</div>
                               <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase">نشط</div>
                            </div>
                            <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-md">
                               <EyeIcon className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
                    ))}
                    {labs.length === 0 && (
                      <div className="py-24 text-center space-y-4 opacity-50">
                         <BuildingOfficeIcon className="w-20 h-20 text-slate-300 mx-auto" />
                         <p className="font-black text-slate-400 italic">لا توجد مختبرات مسجلة في النطاق الوطني حالياً.</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* إحصائيات الأثر الوطني */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="p-5 bg-yellow-50 text-yellow-600 rounded-[1.5rem] w-fit mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all"><BuildingOfficeIcon className="w-8 h-8" /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي فضاءات المختبرات</p>
              <p className="text-5xl font-black text-slate-950 italic tracking-tighter">{labs.length}</p>
           </div>
           
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] w-fit mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all"><UserPlusIcon className="w-8 h-8" /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المستفيدون المباشرون</p>
              <div className="flex items-end gap-3">
                 <p className="text-5xl font-black text-slate-950 italic tracking-tighter">{summary?.totalBeneficiaries || '...'}</p>
                 <span className="text-[11px] font-black text-emerald-500 mb-3 flex items-center gap-1"><ArrowTrendingUpIcon className="w-4 h-4" /> +15%</span>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all"><RocketLaunchIcon className="w-8 h-8" /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المبادرات الرقمية المعتمدة</p>
              <p className="text-5xl font-black text-slate-950 italic tracking-tighter">{projects.length}</p>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] w-fit mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all"><CheckBadgeIcon className="w-8 h-8" /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">معدل التحول الاستراتيجي</p>
              <p className="text-5xl font-black text-slate-950 italic tracking-tighter">74%</p>
           </div>
        </div>

        {/* مودال إنشاء المختبر وتعيين القائد */}
        {isCreateLabOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
             <div className="bg-white rounded-[4.5rem] p-12 max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative border border-white/20">
                <button onClick={() => setIsCreateLabOpen(false)} className="absolute top-10 left-10 p-4 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><XMarkIcon className="w-8 h-8" /></button>
                
                <div className="flex items-center gap-6 border-r-8 border-yellow-500 pr-8 mb-12">
                   <div className="p-5 bg-slate-950 rounded-[1.5rem] shadow-xl"><BuildingOfficeIcon className="w-12 h-12 text-yellow-400" /></div>
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">توسيع الشبكة الوطنية للمختبرات</h2>
                      <p className="text-slate-400 font-bold italic text-sm tracking-widest">تأسيس فضاء جديد وتعيين مدير فني</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                   {/* بيانات المختبر الأساسية */}
                   <div className="space-y-10">
                      <div className="space-y-6">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                           <InformationCircleIcon className="w-5 h-5" /> هوية الفضاء الرقمي
                         </h4>
                         <div className="space-y-4">
                            <input value={newLab.name} onChange={(e)=>setNewLab({...newLab, name: e.target.value})} className="w-full p-7 bg-slate-50 rounded-[2rem] border border-transparent focus:border-yellow-400 focus:bg-white outline-none font-black text-2xl transition-all shadow-inner" placeholder="اسم المختبر المقترح..." />
                            <select value={newLab.province} onChange={(e)=>setNewLab({...newLab, province: e.target.value})} className="w-full p-7 bg-slate-50 rounded-[2rem] border border-transparent outline-none font-black text-xl shadow-inner cursor-pointer hover:bg-slate-100 transition-colors">
                               {["تونس", "سبيطلة", "الكاف", "قابس", "مدنين", "بنزرت", "جندوبة", "القصرين"].map(gov => <option key={gov} value={gov}>{gov}</option>)}
                            </select>
                            <textarea value={newLab.description} onChange={(e)=>setNewLab({...newLab, description: e.target.value})} rows={3} className="w-full p-7 bg-slate-50 rounded-[2.5rem] border border-transparent focus:border-yellow-400 focus:bg-white outline-none font-bold italic leading-relaxed shadow-inner text-lg" placeholder="الرؤية الاستراتيجية لهذا المختبر..." />
                         </div>
                      </div>

                      <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                         <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
                         <h4 className="text-[11px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-3 italic">
                            <BeakerIcon className="w-5 h-5" /> الميزانية التأسيسية
                         </h4>
                         <div className="flex items-center gap-6">
                            <input type="number" value={newLab.allocatedBudget} onChange={(e)=>setNewLab({...newLab, allocatedBudget: Number(e.target.value)})} className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 outline-none font-black text-3xl text-center shadow-inner" />
                            <span className="font-black text-xl text-slate-500 italic uppercase">دينار تونسي</span>
                         </div>
                      </div>
                   </div>

                   {/* هوية مدير المختبر */}
                   <div className="space-y-10">
                      <div className="space-y-8">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                           <IdentificationIcon className="w-5 h-5" /> تعيين القيادة الميدانية
                         </h4>
                         
                         {/* رفع الصورة وتوثيق الوجه */}
                         <div onClick={() => fileInputRef.current?.click()} className="group relative w-56 h-56 mx-auto cursor-pointer">
                            {newLab.managerImage ? (
                               <img src={newLab.managerImage} alt="Manager" className="w-full h-full rounded-[3.5rem] object-cover border-4 border-yellow-400 shadow-2xl group-hover:opacity-70 transition-all duration-500" />
                            ) : (
                               <div className="w-full h-full rounded-[3.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-300 group-hover:border-yellow-400 group-hover:text-yellow-500 transition-all duration-500 shadow-inner">
                                  {uploadingImage ? <ArrowPathIcon className="w-14 h-14 animate-spin" /> : <CameraIcon className="w-14 h-14" />}
                                  <span className="text-[11px] font-black uppercase tracking-tighter">صورة المدير الفني</span>
                               </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            <div className="absolute -bottom-4 -right-4 bg-yellow-400 p-5 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform"><PlusIcon className="w-7 h-7 text-slate-900" /></div>
                         </div>

                         <div className="space-y-5">
                            <div className="relative group">
                               <UserCircleIcon className="w-6 h-6 absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
                               <input value={newLab.managerName} onChange={(e)=>setNewLab({...newLab, managerName: e.target.value})} className="w-full p-7 pr-16 bg-slate-50 rounded-[2rem] border border-transparent focus:border-blue-400 focus:bg-white outline-none font-black text-xl transition-all shadow-inner" placeholder="اسم مدير المختبر بالكامل..." />
                            </div>
                            <div className="relative group">
                               <GlobeAltIcon className="w-6 h-6 absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                               <input value={newLab.managerEmail} onChange={(e)=>setNewLab({...newLab, managerEmail: e.target.value})} className="w-full p-7 pr-16 bg-slate-50 rounded-[2rem] border border-transparent focus:border-blue-400 focus:bg-white outline-none font-bold text-lg transition-all shadow-inner" placeholder="البريد الإلكتروني المؤسساتي..." />
                            </div>
                         </div>
                      </div>

                      <div className="bg-blue-50 p-8 rounded-[3rem] border border-blue-100 space-y-4 shadow-sm">
                         <div className="flex items-center gap-3 text-blue-600">
                            <ShieldCheckIcon className="w-6 h-6" />
                            <span className="font-black text-xs uppercase italic tracking-widest">ميثاق التعيين الإداري</span>
                         </div>
                         <p className="text-xs font-bold text-blue-900/70 leading-relaxed italic pr-2">
                           سيتم تفعيل حساب دخول "مدير مختبر" فور حفظ البيانات. يتولى المدير مسؤولية الإشراف على الـ Sprints وتوثيق الأصول في ولايته.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="mt-16 pt-10 border-t border-slate-100 flex justify-center">
                   <button 
                    onClick={handleCreateLab}
                    disabled={isLoading || uploadingImage}
                    className="px-24 py-8 bg-slate-950 text-white rounded-[3rem] font-black text-3xl flex items-center gap-8 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.3)] disabled:opacity-50"
                   >
                      {isLoading ? <ArrowPathIcon className="w-10 h-10 animate-spin" /> : <CloudArrowUpIcon className="w-10 h-10 text-yellow-400" />}
                      تفعيل المختبر في النطاق السحابي
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. واجهة مدير المختبر (LAB_MANAGER)
  // ==========================================
  if (role === 'LAB_MANAGER') {
    return (
      <div className="space-y-10 animate-fade-in text-right font-['Cairo'] pb-20">
        <header className="bg-indigo-600 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-b-8 border-blue-400">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl">
                   <BriefcaseIcon className="w-12 h-12 text-white" />
                 </div>
                 <h1 className="text-4xl font-black italic tracking-tight uppercase leading-none">بوابة الإشراف الميداني</h1>
              </div>
              <p className="text-indigo-100 font-bold max-w-2xl text-lg italic leading-relaxed pr-2">
                مرحباً بك يا مدير المختبر. تتابع هنا تقدم الفرق الشبابية، جودة النمذجة (MVP)، وربط المشاريع بخريطة الأصول الثقافية في ولايتك.
              </p>
            </div>
            
            <Link 
              to="/builder"
              className="px-10 py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center gap-4 active:scale-95"
            >
               <PlusIcon className="w-6 h-6" />
               إضافة مشروع جديد
            </Link>
          </div>
        </header>

        {/* خريطة الولاية وقائمة المشاريع */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 p-6 shadow-sm h-[600px] overflow-hidden relative">
              <div className="absolute top-8 right-8 z-[100] bg-white/90 backdrop-blur-md p-5 rounded-[1.5rem] border border-slate-100 shadow-xl flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                 <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-indigo-600 rounded-full shadow-[0_0_8px_#4f46e5]"></div> المشاريع</div>
                 <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15]"></div> الأصول الثقافية</div>
              </div>
              <MapContainer center={TUNISIA_CENTER} zoom={7} className="h-full w-full">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {assets.map(asset => (
                  <Marker key={asset.id} position={[asset.metadata?.location?.lat, asset.metadata?.location?.lng]} icon={createMarkerIcon('#facc15', '📍')}>
                    <Popup>
                      <div className="text-right font-['Cairo']">
                         <h4 className="font-black text-slate-900">{asset.name}</h4>
                         <p className="text-[10px] text-slate-500 italic">{asset.metadata?.governorate}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
           </div>

           <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden h-[600px] flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-4 border-r-4 border-indigo-400 pr-4">
                 <RocketLaunchIcon className="w-8 h-8 text-indigo-400" />
                 <h3 className="text-2xl font-black italic">مشاريع تحت إشرافك</h3>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar flex-1">
                 {projects.map(project => (
                   <div 
                    key={project.id} 
                    onClick={() => setSelectedProject(project)}
                    className={`p-6 bg-white/5 rounded-[2rem] border transition-all cursor-pointer group ${
                      selectedProject?.id === project.id ? 'border-yellow-400 bg-white/10' : 'border-white/5 hover:bg-white/10'
                    }`}
                   >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                              <CommandLineIcon className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="font-black italic text-lg">{project.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{project.owner}</p>
                           </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors" />
                      </div>
                   </div>
                 ))}
                 {projects.length === 0 && <p className="text-sm text-slate-500 italic text-center py-24">لا توجد مبادرات مسجلة حالياً في المختبر.</p>}
              </div>
           </div>
        </div>

        {/* عرض تفاصيل الإطار المنطقي للمشروع المختار */}
        {selectedProject && (
          <div className="bg-white rounded-[4rem] border border-slate-100 p-12 shadow-sm animate-slide-up space-y-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 bg-slate-50 w-48 h-48 rounded-br-full -ml-12 -mt-12"></div>
             <div className="flex justify-between items-start border-r-8 border-indigo-600 pr-10 relative z-10">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">تحليل الإطار المنطقي</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">الحالة: {selectedProject.status}</span>
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><XMarkIcon className="w-6 h-6" /></button>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 relative z-10">
                {/* سياق الاستدامة */}
                <div className="xl:col-span-1 space-y-8">
                   <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <SparklesIcon className="w-4 h-4" />
                         الأثر الاستراتيجي (Impact)
                      </h4>
                      <p className="text-base font-bold italic leading-relaxed text-indigo-50">
                        {selectedProject.canvas?.logicalFramework?.impact || "لم يتم تحديد الأثر النهائي بعد."}
                      </p>
                   </div>
                   <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100">
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">دراسة الجدوى</h4>
                      <p className="text-[11px] font-bold italic text-emerald-900 leading-relaxed">
                        {selectedProject.canvas?.feasibility || "دراسة الجدوى قيد المراجعة الفنية."}
                      </p>
                   </div>
                </div>

                {/* تفاصيل مصفوفة النتائج */}
                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { label: 'النتائج المباشرة (Outcomes)', items: selectedProject.canvas?.logicalFramework?.outcomes, color: 'text-blue-600', bg: 'bg-blue-50', icon: LightBulbIcon },
                     { label: 'المخرجات الملموسة (Outputs)', items: selectedProject.canvas?.logicalFramework?.outputs, color: 'text-purple-600', bg: 'bg-purple-50', icon: TableCellsIcon },
                     { label: 'الأنشطة الميدانية (Activities)', items: selectedProject.canvas?.logicalFramework?.activities, color: 'text-amber-600', bg: 'bg-amber-50', icon: CommandLineIcon },
                     { label: 'مؤشرات النجاح (Indicators)', items: selectedProject.canvas?.logicalFramework?.indicators, color: 'text-pink-600', bg: 'bg-pink-50', icon: ChartBarIcon }
                   ].map((sec, i) => (
                     <div key={i} className={`p-8 rounded-[3.5rem] border border-slate-50 ${sec.bg} space-y-6 group hover:shadow-xl transition-all`}>
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-2xl bg-white shadow-sm ${sec.color} group-hover:rotate-12 transition-transform`}>
                              <sec.icon className="w-6 h-6" />
                           </div>
                           <h4 className={`text-xl font-black italic ${sec.color}`}>{sec.label}</h4>
                        </div>
                        <ul className="space-y-3">
                           {sec.items?.map((item: string, idx: number) => (
                             <li key={idx} className="bg-white/80 p-4 rounded-2xl text-[12px] font-bold italic border border-white shadow-sm group-hover:border-indigo-100 transition-colors flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                                {item}
                             </li>
                           ))}
                           {(!sec.items || sec.items.length === 0) && <li className="text-[10px] text-slate-400 italic pr-2">لا توجد بيانات موثقة حتى الآن.</li>}
                        </ul>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. واجهة الشباب المبدع (YOUTH)
  // ==========================================
  return (
    <div className="space-y-12 animate-fade-in text-right font-['Cairo'] pb-24">
      {/* هيدر الترحيب للمبدع */}
      <header className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
          <div className="space-y-5">
            <div className="flex items-center gap-6">
               <div className="p-5 bg-yellow-400 rounded-[2rem] shadow-2xl rotate-6 group-hover:rotate-0 transition-transform">
                  <SparklesIcon className="w-12 h-12 text-slate-950" />
               </div>
               <div className="space-y-1">
                 <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">بوابة المبدعين الرقمية</h1>
                 <p className="text-indigo-100 font-bold text-lg italic uppercase tracking-widest">مكان تحويل الأفكار إلى واقع تنموي</p>
               </div>
            </div>
            <p className="text-indigo-50 font-bold max-w-2xl text-xl italic leading-relaxed pr-2">
              مرحباً بك يا مبدع. هنا حيث تجتمع أصالة الجهات مع قوة الرقمنة. استخدم أدوات المختبر لتصميم سرديتك الخاصة ومكافحة ثقافة اليأس بالابتكار.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 text-center">
                <p className="text-3xl font-black text-white italic leading-none mb-1">450</p>
                <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">نقاط الخبرة XP</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 text-center">
                <p className="text-3xl font-black text-white italic leading-none mb-1">02</p>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">شارات محققة</p>
             </div>
          </div>
        </div>
      </header>

      {/* مصفوفة الأدوات الإبداعية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { to: '/academy', label: 'الأكاديمية الرقمية', sub: 'تعلم مهارات المستقبل', icon: AcademicCapIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { to: '/builder', label: 'منشئ المشاريع', sub: 'صمم نموذجك الأولي', icon: RocketLaunchIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { to: '/mentor', label: 'الموجه الذكي', sub: 'Gemini رفيقك الإبداعي', icon: ChatBubbleLeftRightIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
           { to: '/studio', label: 'ستوديو الإبداع', sub: 'توليد المحتوى بالذكاء', icon: PaintBrushIcon, color: 'text-pink-600', bg: 'bg-pink-50' }
         ].map((tool, i) => (
           <Link key={i} to={tool.to} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 bg-slate-50 w-24 h-24 rounded-br-[4rem] -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform"></div>
              <div className={`p-6 ${tool.bg} ${tool.color} rounded-[2rem] w-fit mb-8 relative z-10 group-hover:rotate-12 transition-transform shadow-sm`}>
                 <tool.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black italic text-slate-900 relative z-10">{tool.label}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2 relative z-10 italic">{tool.sub}</p>
              <div className="mt-8 flex justify-end relative z-10">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-lg">
                    <ArrowUpRightIcon className="w-5 h-5" />
                 </div>
              </div>
           </Link>
         ))}
      </div>

      {/* مسار التعلم والتحفيز */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-slate-950 text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -ml-40 -mt-40 transition-transform group-hover:scale-125 duration-1000"></div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 border-r-4 border-indigo-500 pr-6">
                     <h3 className="text-4xl font-black italic tracking-tight leading-none">مسارك الحالي</h3>
                  </div>
                  <p className="text-slate-400 font-bold leading-relaxed italic text-lg max-w-lg">
                    أكمل دورة "ريادة الأعمال الثقافية" لفتح شارة "المبتكر الذهبي" والحصول على دعم فني مباشر لمشروعك من المدير العام.
                  </p>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">المستوى المحرز</p>
                        <p className="text-4xl font-black text-white italic">450 / 1000 XP</p>
                     </div>
                     <CheckBadgeIcon className="w-12 h-12 text-yellow-400 animate-bounce" />
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner p-1">
                     <div className="h-full bg-gradient-to-l from-indigo-500 to-purple-400 rounded-full shadow-[0_0_15px_#6366f1]" style={{ width: '45%' }}></div>
                  </div>
               </div>
               <Link to="/academy" className="px-12 py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-xl text-center hover:bg-yellow-400 transition-all shadow-2xl active:scale-95">متابعة التعلم الرقمي</Link>
            </div>
         </div>

         <div className="bg-white rounded-[4.5rem] border border-slate-100 p-12 shadow-sm space-y-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-50 w-32 h-32 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="p-8 bg-blue-50 rounded-full text-blue-600 shadow-inner group relative">
               <LightBulbIcon className="w-20 h-20 animate-pulse" />
            </div>
            <div className="space-y-6 max-w-sm">
               <h3 className="text-3xl font-black italic tracking-tight text-slate-900">إلهام اليوم</h3>
               <p className="text-xl font-bold italic text-slate-500 leading-relaxed">
                 "هل فكرت في تحويل حرفة صناعة الفخار في جهتك إلى تجربة واقع معزز (AR) للسياح؟"
               </p>
            </div>
            <Link to="/mentor" className="px-10 py-5 bg-slate-950 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-4">
               <SparklesIcon className="w-5 h-5 text-yellow-400" />
               اطلب فكرة من الموجه
            </Link>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
