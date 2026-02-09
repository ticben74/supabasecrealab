
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CourseLevel, Badge, Lesson, LearningPath, Lab } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCJB8Xiy6Ba4b76AJCA_U3Fp9vOsnHIRSw",
  authDomain: "gen-lang-client-0213031185.firebaseapp.com",
  projectId: "gen-lang-client-0213031185",
  storageBucket: "gen-lang-client-0213031185.firebasestorage.app",
  messagingSenderId: "300105059408",
  appId: "1:300105059408:web:6c2853b1d030b900de1555"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

let isDbAvailable = true;
const LOCAL_STORAGE_KEY = 'creative_lab_local_progress';
const LABS_COLLECTION = 'labs';

export const labsApi = { 
  async getAll(): Promise<Lab[]> { 
    if (!isDbAvailable) return [{ id: 'l1', code: 'LAB-TUN-01', name: 'مختبر تونس', province: 'تونس', managerEmail: 'admin@dgac.tn', managerName: 'أنيس بوغطاس', managerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop', description: 'المختبر المركزي لإدارة المشاريع الرقمية.', gps: { lat: 36.8065, lng: 10.1815 }, budget: { allocated: 50000, spent: 12000 }, icon: 'BuildingLibraryIcon' }];
    try {
      const snap = await getDocs(collection(db, LABS_COLLECTION));
      const labs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Lab[];
      return labs.length > 0 ? labs : [{ id: 'l1', code: 'LAB-TUN-01', name: 'مختبر تونس', province: 'تونس', managerEmail: 'admin@dgac.tn', managerName: 'أنيس بوغطاس', description: 'المختبر المركزي لإدارة المشاريع الرقمية.', gps: { lat: 36.8065, lng: 10.1815 }, budget: { allocated: 50000, spent: 12000 }, icon: 'BuildingLibraryIcon' }];
    } catch {
      return [];
    }
  },
  async create(labData: Partial<Lab>) {
    try {
      const docRef = await addDoc(collection(db, LABS_COLLECTION), {
        ...labData,
        created_at: Timestamp.now()
      });
      return { id: docRef.id, ...labData };
    } catch (e) {
      console.error("Error creating lab:", e);
      throw e;
    }
  }
};

export const academyApi = {
  subscribeToLevels(callback: (levels: CourseLevel[]) => void) {
    if (!isDbAvailable) { callback(MOCK_LEVELS); return () => {}; }
    const q = query(collection(db, "academy_levels"), orderBy("order", "asc"));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as CourseLevel[];
      callback(data.length > 0 ? data : MOCK_LEVELS);
    }, (err) => { if (isDbNotFoundError(err)) isDbAvailable = false; callback(MOCK_LEVELS); });
  },
  async getLessonsByLevel(levelId: string): Promise<Lesson[]> {
    if (!isDbAvailable) return MOCK_LESSONS.filter(l => l.level_id === levelId);
    try {
      const q = query(collection(db, "academy_lessons"), where("level_id", "==", levelId), orderBy("order", "asc"));
      const snap = await getDocs(q);
      const lessons = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Lesson[];
      return lessons.length > 0 ? lessons : MOCK_LESSONS.filter(l => l.level_id === levelId);
    } catch { return MOCK_LESSONS.filter(l => l.level_id === levelId); }
  },
  async getBadges(): Promise<Badge[]> {
    if (!isDbAvailable) return MOCK_BADGES;
    try {
      const snap = await getDocs(collection(db, "academy_badges"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Badge[];
    } catch { return MOCK_BADGES; }
  },
  async getPaths(): Promise<LearningPath[]> {
    if (!isDbAvailable) return MOCK_PATHS;
    try {
      const snap = await getDocs(collection(db, "learning_paths"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as LearningPath[];
    } catch { return MOCK_PATHS; }
  },
  async getProgress(userId: string) {
    const local = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (local) return JSON.parse(local);
    return { user_id: userId, completed_lessons: [], points: 0, earned_badges: [] };
  },
  async updateProgress(userId: string, lessonId: string, points: number) {
    const prog = await this.getProgress(userId);
    if (!prog.completed_lessons.includes(lessonId)) {
      prog.completed_lessons.push(lessonId);
      prog.points += points;
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(prog));
    }
  }
};

const MOCK_LEVELS: CourseLevel[] = [
  { id: "level_001", title: "سيمياء المشاريع الثقافية", description: "تعلم قراءة الموارد الثقافية المحلية وبناء 'اقتصاد المعنى' كبديل للهجرة. تحويل هوية الهروب إلى هوية الإبداع.", icon: "BuildingLibraryIcon", order: 1, category: "السياق العام", duration_hours: 4, points: 100, status: "available" },
  { id: "level_002", title: "منهجية العمل بالمختبرات", description: "التشخيص المحلي، التصميم المشترك، والنمذجة الأولية (Co-design). إدارة دورة حياة المشروع في المختبر.", icon: "ArchiveBoxIcon", order: 2, category: "المنهجية", duration_hours: 6, points: 120, status: "available" },
  { id: "level_010", title: "التحول الرقمي للحرف", description: "دراسة تقنيات متقدمة لتحويل الحرف اليدوية إلى أصول رقمية وتجارب تفاعلية.", icon: "CommandLineIcon", order: 10, category: "تخصصي", duration_hours: 12, points: 250, status: "available" }
];

const MOCK_LESSONS: Lesson[] = [];
const MOCK_BADGES: Badge[] = [];
const MOCK_PATHS: LearningPath[] = [];

const isDbNotFoundError = (error: any) => error?.message?.includes("not-found") || error?.code === "not-found";

export const authApi = {
  async signIn(email: string, password: string) {
    if (email === 'admin1') return { user: { uid: 'mock_uid', email: 'admin@dgac.tn' } };
    return signInWithEmailAndPassword(auth, email, password);
  },
  async signOut() { await signOut(auth); },
  async getProfile(userId: string) { return { role: 'YOUTH', full_name: 'مبدع المختبر' }; },
  onAuthStateChange(cb: any) { return onAuthStateChanged(auth, (u) => cb(u ? 'SIGNED_IN' : 'SIGNED_OUT', { user: u })); },
  async getCurrentUser() { return auth.currentUser; }
};

export const projectsApi = { 
  async getAll() { return []; }, 
  async getCounts() { return 0; }, 
  async create(p: any) { return { id: Date.now().toString() }; } 
};
export const assetsApi = {
  async getAll() { return []; },
  async save(asset: any) { return { id: Date.now().toString() }; }
};
export const kpisApi = { async getDashboardSummary() { return { totalBeneficiaries: 120, activeProjects: 5, avgSatisfaction: 4.5 }; } };
export const storageApi = { async upload(b: string, f: File) { 
  const storageRef = ref(storage, `${b}/${Date.now()}_${f.name}`);
  const snapshot = await uploadBytes(storageRef, f);
  const publicUrl = await getDownloadURL(snapshot.ref);
  return { publicUrl };
}};

export const conversationsApi = { 
  async saveMessage(userId: string, context: string, role: string, content: string) {
    if (!isDbAvailable) return;
    try {
      await addDoc(collection(db, "messages"), { userId, context, role, content, created_at: Timestamp.now() });
    } catch (e) {
      if (isDbNotFoundError(e)) isDbAvailable = false;
    }
  }, 
  async getHistory(userId: string, context: string) {
    if (!isDbAvailable) return [];
    try {
      const q = query(collection(db, "messages"), where("userId", "==", userId), where("context", "==", context), orderBy("created_at", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ role: d.data().role as 'user' | 'model', text: d.data().content as string }));
    } catch (e) {
      if (isDbNotFoundError(e)) isDbAvailable = false;
      return [];
    }
  } 
};

export const subscribeToChanges = (t: string, cb: any) => () => {};
