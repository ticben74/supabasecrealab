
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArchiveBoxIcon, 
  MapPinIcon, 
  PlusIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  DocumentIcon,
  FunnelIcon,
  MapIcon,
  EyeIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { assetsApi, storageApi, subscribeToChanges } from '../services/firebaseClient';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const TUNISIA_CENTER: [number, number] = [33.8869, 9.5375];

const GOVERNORATES = [
  "تونس", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان", "بنزرت", "باجة", 
  "جندوبة", "الكاف", "سليانة", "القيروان", "القصرين", "سيدي بوزيد", 
  "سوسة", "المنستير", "المهدية", "صفاقس", "قفصة", "توزر", "قبلي", 
  "قابس", "مدنين", "تطاوين"
];

const ASSET_TYPES = [
  { id: 'image', name: 'صور', icon: PhotoIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'audio', name: 'صوتيات', icon: SpeakerWaveIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'video', name: 'فيديو', icon: VideoCameraIcon, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'document', name: 'مستندات', icon: DocumentIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' }
];

const getAssetIcon = (type: string) => {
  let color = '#facc15';
  let innerIcon = '📍';
  switch (type) {
    case 'audio': color = '#3b82f6'; innerIcon = '🎙️'; break;
    case 'video': color = '#ec4899'; innerIcon = '🎥'; break;
    case 'image': color = '#10b981'; innerIcon = '🖼️'; break;
    case 'document': color = '#6366f1'; innerIcon = '📄'; break;
  }
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class='marker-pin' style='background: ${color}; box-shadow: 0 4px 12px ${color}66;'><div class='marker-inner'>${innerIcon}</div></div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40]
  });
};

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  const pickerIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class='marker-pin' style='background: #0f172a;'><div class='marker-inner'>📍</div></div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42]
  });
  return position ? <Marker position={position} icon={pickerIcon} /> : null;
};

const CulturalAssets: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'text',
    description: '',
    file_url: '',
    governorate: 'تونس',
    lat: 33.8869,
    lng: 9.5375,
    state: 'preserved' as 'endangered' | 'preserved' | 'thriving'
  });

  const readiness = useMemo(() => {
    let score = 0;
    if (newAsset.name.length > 3) score += 20;
    if (newAsset.description.length > 10) score += 20;
    if (newAsset.file_url) score += 30;
    if (newAsset.lat !== 33.8869) score += 30;
    return score;
  }, [newAsset]);

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToChanges('cultural_assets', () => {
        fetchData();
    });
    return () => { unsubscribe(); };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const assetsData = await assetsApi.getAll();
      setAssets(assetsData);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const regionMatch = selectedRegion === 'all' || a.metadata?.governorate === selectedRegion;
      const typeMatch = selectedType === 'all' || a.type === selectedType;
      return regionMatch && typeMatch;
    });
  }, [assets, selectedRegion, selectedType]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await storageApi.upload('assets', file);
      setNewAsset(prev => ({ ...prev, file_url: publicUrl }));
      
      if (file.type.startsWith('image/')) setNewAsset(p => ({ ...p, type: 'image' }));
      else if (file.type.startsWith('audio/')) setNewAsset(p => ({ ...p, type: 'audio' }));
      else if (file.type.startsWith('video/')) setNewAsset(p => ({ ...p, type: 'video' }));
      else setNewAsset(p => ({ ...p, type: 'document' }));
    } catch (err) {
      alert("خطأ في رفع الملف: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (readiness < 100) return alert("يرجى إكمال كافة بيانات التوثيق قبل الحفظ.");
    setLoading(true);
    try {
      await assetsApi.save({
        name: newAsset.name,
        type: newAsset.type,
        file_url: newAsset.file_url,
        metadata: { 
          description: newAsset.description, 
          governorate: newAsset.governorate,
          location: { lat: newAsset.lat, lng: newAsset.lng },
          state: newAsset.state
        }
      });
      setIsModalOpen(false);
      setNewAsset({ name: '', type: 'text', description: '', file_url: '', governorate: 'تونس', lat: 33.8869, lng: 9.5375, state: 'preserved' });
      fetchData();
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ في Firebase: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="space-y-2 relative z-10">
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 italic tracking-tight uppercase">
            <MapIcon className="w-10 h-10 text-yellow-500" />
            أطلس الأصول (Firebase)
          </h1>
          <p className="text-slate-500 font-bold text-lg italic">توثيق وحماية الهوية المحلية.</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <button onClick={fetchData} className="p-4 bg-slate-50 rounded-2xl transition-all shadow-sm active:scale-95">
              <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-3 shadow-2xl hover:bg-black transition-all group">
            <PlusIcon className="w-6 h-6 text-yellow-400 group-hover:rotate-90 transition-transform" />
            توثيق أصل جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">تصفية حسب النوع</h3>
              <div className="grid grid-cols-1 gap-2">
                 <button onClick={() => setSelectedType('all')} className={`w-full text-right px-6 py-3 rounded-xl font-black text-sm ${selectedType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>الكل</button>
                 {ASSET_TYPES.map(type => (
                   <button key={type.id} onClick={() => setSelectedType(type.id)} className={`w-full text-right px-6 py-3 rounded-xl font-black text-sm border ${selectedType === type.id ? 'bg-white border-blue-400 text-blue-600' : 'bg-white border-slate-50 text-slate-400'}`}>{type.name}</button>
                 ))}
              </div>
           </div>
        </div>

        <div className="xl:col-span-3 h-[600px] bg-white rounded-[3.5rem] border-8 border-white shadow-2xl relative overflow-hidden z-10">
           <MapContainer center={TUNISIA_CENTER} zoom={6} className="h-full w-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              {filteredAssets.map(asset => (
                <Marker key={asset.id} position={[asset.metadata?.location?.lat, asset.metadata?.location?.lng]} icon={getAssetIcon(asset.type)}>
                  <Popup minWidth={200}>
                    <div className="text-right font-['Cairo'] overflow-hidden rounded-xl">
                       {asset.file_url && asset.type === 'image' && (
                         <img src={asset.file_url} alt={asset.name} className="w-full h-32 object-cover mb-3 rounded-lg shadow-sm" />
                       )}
                       <div className="p-1">
                          <h4 className="font-black text-slate-900 text-lg mb-1 leading-tight">{asset.name}</h4>
                          <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed line-clamp-2">
                            {asset.metadata?.description}
                          </p>
                          <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                             <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase">{asset.metadata?.governorate}</span>
                             <EyeIcon className="w-4 h-4 text-slate-300" />
                          </div>
                       </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
           </MapContainer>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-right">
          <div className="bg-white rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-900">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-3xl font-black mb-8 border-r-4 border-yellow-400 pr-6">توثيق أصل جديد (Firestore)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-2 no-scrollbar">
               <div className="space-y-6">
                  <input value={newAsset.name} onChange={(e)=>setNewAsset({...newAsset, name: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold shadow-inner" placeholder="اسم الأصل الثقافي" />
                  <select value={newAsset.governorate} onChange={(e) => setNewAsset({...newAsset, governorate: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold shadow-inner">
                    {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                  </select>
                  <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-5 cursor-pointer hover:bg-yellow-50/30 transition-all">
                    {uploading ? <ArrowPathIcon className="w-12 h-12 animate-spin text-yellow-500" /> : <CloudArrowUpIcon className="w-12 h-12 text-slate-300" />}
                    <p className="font-black text-slate-600">{newAsset.file_url ? 'تم رفع الملف!' : 'انقر لرفع ملف وسائط'}</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </div>
                  <textarea value={newAsset.description} onChange={(e)=>setNewAsset({...newAsset, description: e.target.value})} rows={3} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold shadow-inner" placeholder="وصف الأصل..." />
               </div>
               <div className="h-[400px] bg-slate-100 rounded-[2.5rem] overflow-hidden relative">
                  <MapContainer center={TUNISIA_CENTER} zoom={6} className="h-full w-full">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <LocationPicker onLocationSelect={(lat, lng) => setNewAsset(prev => ({ ...prev, lat, lng }))} />
                  </MapContainer>
               </div>
            </div>
            <button onClick={handleSave} disabled={loading || uploading || readiness < 100} className="mt-8 px-16 py-5 rounded-2xl font-black bg-slate-900 text-white hover:bg-black shadow-xl disabled:opacity-50 transition-all">حفظ التوثيق سحابياً</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalAssets;
