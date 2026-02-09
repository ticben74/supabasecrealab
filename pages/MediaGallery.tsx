
import React, { useState, useRef, useEffect } from 'react';
import { 
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon,
  EyeIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { storageApi, authApi } from '../services/firebaseClient';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
  views: number;
  duration?: string;
}

const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=800',
    title: 'فسيفساء رومانية من سبيطلة',
    description: 'لوحة فسيفساء أثرية تعود للقرن الثالث الميلادي',
    uploadedBy: 'أمينة الكريمي',
    uploadedAt: '2025-01-15',
    likes: 24,
    views: 156
  },
  {
    id: '2',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    title: 'حرفة النسيج التقليدي',
    description: 'فيديو توثيقي لحرفة النسيج في القيروان',
    uploadedBy: 'محمد السالمي',
    uploadedAt: '2025-01-20',
    likes: 45,
    views: 320,
    duration: '5:23'
  },
  {
    id: '3',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
    title: 'بودكاست: قصص من الجهات',
    description: 'حلقة عن التراث الشفوي في الكاف',
    uploadedBy: 'سارة بن عمر',
    uploadedAt: '2025-01-22',
    likes: 38,
    views: 210,
    duration: '18:45'
  },
  {
    id: '4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    title: 'فخار تقليدي من جربة',
    description: 'منتجات فخارية يدوية',
    uploadedBy: 'فاطمة القصراوي',
    uploadedAt: '2025-01-25',
    likes: 19,
    views: 98
  },
  {
    id: '5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=800',
    title: 'معمارية تقليدية - مدينة توزر',
    description: 'الفن المعماري الصحراوي',
    uploadedBy: 'أنيس التوزري',
    uploadedAt: '2025-01-28',
    likes: 52,
    views: 234
  }
];

const MediaGallery: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>(MOCK_MEDIA);
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let filtered = media;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredMedia(filtered);
  }, [activeFilter, searchQuery, media]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const user = await authApi.getCurrentUser();
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const { publicUrl } = await storageApi.upload('media', file);
        clearInterval(interval);

        const type: 'image' | 'video' | 'audio' = file.type.startsWith('image/') 
          ? 'image' 
          : file.type.startsWith('video/') 
          ? 'video' 
          : 'audio';

        return {
          id: `new_${Date.now()}_${index}`,
          type,
          url: publicUrl,
          thumbnail: type === 'image' ? publicUrl : undefined,
          title: file.name.replace(/\.[^/.]+$/, ''),
          uploadedBy: user?.email || 'مستخدم',
          uploadedAt: new Date().toISOString().split('T')[0],
          likes: 0,
          views: 0
        };
      });

      const newMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...newMedia, ...prev]);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      alert('خطأ في الرفع: ' + (error as Error).message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const MediaCard = ({ item }: { item: MediaItem }) => (
    <div 
      onClick={() => setSelectedMedia(item)}
      className="group relative bg-white rounded-[2.5rem] overflow-hidden border-2 border-slate-100 hover:border-indigo-300 transition-all hover:shadow-2xl cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {item.type === 'image' && (
          <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        )}
        {item.type === 'video' && (
          <div className="relative w-full h-full">
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                <PlayIcon className="w-8 h-8 text-slate-900 mr-1" />
              </div>
            </div>
            {item.duration && (
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 text-white text-xs font-black rounded-xl">
                {item.duration}
              </div>
            )}
          </div>
        )}
        {item.type === 'audio' && (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <MusicalNoteIcon className="w-24 h-24 text-white/40" />
            {item.duration && (
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white text-xs font-black rounded-xl">
                {item.duration}
              </div>
            )}
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-4 py-2 rounded-2xl backdrop-blur-md text-white text-xs font-black uppercase flex items-center gap-2 ${
            item.type === 'image' ? 'bg-blue-500/90' : item.type === 'video' ? 'bg-red-500/90' : 'bg-purple-500/90'
          }`}>
            {item.type === 'image' && <PhotoIcon className="w-4 h-4" />}
            {item.type === 'video' && <VideoCameraIcon className="w-4 h-4" />}
            {item.type === 'audio' && <MusicalNoteIcon className="w-4 h-4" />}
            {item.type === 'image' ? 'صورة' : item.type === 'video' ? 'فيديو' : 'صوت'}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 space-y-3">
        <h3 className="text-lg font-black text-slate-900 italic line-clamp-2 leading-tight">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-slate-500 font-bold line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
          <span className="text-xs text-slate-400 font-bold">{item.uploadedBy}</span>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <HeartIcon className="w-4 h-4" />
              {item.likes}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {item.views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-right font-['Cairo']">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[150px] -mr-96 -mt-96"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
          <div className="space-y-5">
            <div className="flex items-center gap-6 border-r-8 border-white pr-10">
              <div className="p-6 bg-white/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
                <PhotoIcon className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">معرض الوسائط</h1>
                <p className="text-purple-100 font-bold text-xl italic uppercase tracking-widest">صور، فيديو، وبودكاست</p>
              </div>
            </div>
            <p className="text-white/90 font-bold max-w-2xl text-xl italic leading-relaxed pr-2">
              اكتشف وشارك الوسائط الإبداعية من جميع المختبرات. صور فوتوغرافية، فيديوهات توثيقية، وحلقات بودكاست من مختلف الجهات.
            </p>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-12 py-7 bg-white text-indigo-600 rounded-[3rem] font-black text-2xl hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-2xl flex items-center gap-6 active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <ArrowPathIcon className="w-10 h-10 animate-spin" />
                جاري الرفع {uploadProgress}%
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-10 h-10" />
                رفع ملفات جديدة
              </>
            )}
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
            className="hidden" 
          />
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-6 h-6 absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المعرض..."
              className="w-full pr-14 pl-8 py-5 bg-slate-50 rounded-[2rem] border border-transparent focus:border-indigo-400 outline-none font-bold text-lg shadow-inner transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex bg-slate-100 p-2 rounded-[2rem]">
              {[
                { id: 'all', label: 'الكل', icon: Squares2X2Icon },
                { id: 'image', label: 'صور', icon: PhotoIcon },
                { id: 'video', label: 'فيديو', icon: VideoCameraIcon },
                { id: 'audio', label: 'صوت', icon: MusicalNoteIcon }
              ].map(filter => (
                <button 
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all flex items-center gap-2 ${
                    activeFilter === filter.id ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <filter.icon className="w-5 h-5" />
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-2 rounded-[2rem]">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-lg' : 'text-slate-400'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-lg' : 'text-slate-400'}`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredMedia.map(item => <MediaCard key={item.id} item={item} />)}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-32 opacity-50">
          <PhotoIcon className="w-32 h-32 text-slate-200 mx-auto mb-6" />
          <p className="text-2xl font-black text-slate-400 italic">لا توجد وسائط تطابق البحث</p>
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
          <div className="bg-white rounded-[4rem] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => {
                setSelectedMedia(null);
                setIsPlaying(false);
                if (audioRef.current) audioRef.current.pause();
              }}
              className="absolute top-8 left-8 z-50 p-4 bg-white/90 backdrop-blur-md text-slate-900 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-xl"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            <div className="p-8">
              {/* Media Display */}
              <div className="mb-8">
                {selectedMedia.type === 'image' && (
                  <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full rounded-[3rem] shadow-2xl" />
                )}
                {selectedMedia.type === 'video' && (
                  <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
                    <iframe 
                      src={getYouTubeEmbedUrl(selectedMedia.url)} 
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {selectedMedia.type === 'audio' && (
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-[3rem] p-16 text-center shadow-2xl">
                    <MusicalNoteIcon className="w-32 h-32 text-white/40 mx-auto mb-8" />
                    <audio ref={audioRef} src={selectedMedia.url} onEnded={() => setIsPlaying(false)} />
                    <button 
                      onClick={toggleAudioPlayback}
                      className="px-16 py-8 bg-white text-purple-600 rounded-[2.5rem] font-black text-2xl hover:bg-yellow-400 transition-all shadow-2xl flex items-center gap-6 mx-auto"
                    >
                      {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                      {isPlaying ? 'إيقاف' : 'تشغيل'}
                    </button>
                  </div>
                )}
              </div>

              {/* Media Info */}
              <div className="space-y-6 text-right">
                <h2 className="text-4xl font-black text-slate-900 italic">{selectedMedia.title}</h2>
                {selectedMedia.description && (
                  <p className="text-xl text-slate-600 font-bold leading-relaxed">{selectedMedia.description}</p>
                )}
                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-sm text-slate-400 font-bold mb-1">رفع بواسطة</p>
                    <p className="text-lg font-black text-slate-900">{selectedMedia.uploadedBy}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <button className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center gap-3">
                      <HeartIcon className="w-6 h-6" />
                      {selectedMedia.likes}
                    </button>
                    <button className="px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-100 transition-all flex items-center gap-3">
                      <ShareIcon className="w-6 h-6" />
                      مشاركة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
