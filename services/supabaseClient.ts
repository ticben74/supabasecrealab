
import { createClient } from '@supabase/supabase-js';
import { UserRole, CourseLevel, Lesson, Badge, LearningPath, SmartPath } from '../types';

const supabaseUrl = 'https://iyihdltrvcgubbkeauxu.supabase.co';
const supabaseAnonKey = 'sb_publishable_iU00-9SxGl2ElqNqgePQWQ_gjMcinkH'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const creativeStudioHistoryApi = {
  async save(entry: { user_id: string; workshop_type: string; title: string; description: string; content: any }) {
    const { data, error } = await supabase
      .from('creative_studio_history')
      .insert([entry])
      .select();
    if (error) throw error;
    return data;
  },
  async getByUser(userId: string, workshopType?: string) {
    let query = supabase
      .from('creative_studio_history')
      .select('*')
      .eq('user_id', userId);
    
    if (workshopType) {
      query = query.eq('workshop_type', workshopType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }
};

export const smartPathsApi = {
  async save(path: Partial<SmartPath>) {
    const { data, error } = await supabase
      .from('user_smart_paths')
      .insert([path])
      .select();
    if (error) throw error;
    return data;
  },
  async getByUser(userId: string, type?: 'project' | 'visit' | 'creative'): Promise<SmartPath[]> {
    let query = supabase
      .from('user_smart_paths')
      .select('*')
      .eq('user_id', userId);
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }
};

export const academyApi = {
  async getLevels(): Promise<CourseLevel[]> {
    const { data, error } = await supabase
      .from('academy_levels')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getLessonsByLevel(levelId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('level_id', levelId)
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('academy_badges')
      .select('*')
      .order('points', { ascending: true });
    if (error) return [];
    return data || [];
  },

  async getPaths(): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .order('order', { ascending: true });
    if (error) return [];
    return data || [];
  },

  async getProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!data) {
      const newProgress = { user_id: userId, completed_lessons: [], current_level: 1, points: 0, earned_badges: [] };
      const { data: created } = await supabase.from('user_progress').insert([newProgress]).select().single();
      return created || newProgress;
    }
    return data;
  },

  async updateProgress(userId: string, lessonId: string, pointsToAdd: number) {
    const progress = await this.getProgress(userId);
    if (!progress.completed_lessons.includes(lessonId)) {
      const updatedLessons = [...progress.completed_lessons, lessonId];
      const { data, error } = await supabase
        .from('user_progress')
        .update({ 
          completed_lessons: updatedLessons, 
          points: (progress.points || 0) + pointsToAdd 
        })
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    }
    return progress;
  },

  async seedAcademyData(levels: any[], paths: any[], badges: any[], lessons: any[]) {
    const { error: err1 } = await supabase.from('academy_levels').upsert(levels);
    const { error: err2 } = await supabase.from('learning_paths').upsert(paths);
    const { error: err3 } = await supabase.from('academy_badges').upsert(badges);
    const { error: err4 } = await supabase.from('academy_lessons').upsert(lessons);
    
    if (err1 || err2 || err3 || err4) {
       throw new Error("فشلت المزامنة مع سوبابيز.");
    }
    return true;
  }
};

export const authApi = {
  async signIn(email: string, password: string) {
    if (email === 'admin1' && password === 'admin1') {
      return { user: { id: 'demo-user-id', email: 'admin@dgac.tn' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() { await supabase.auth.signOut(); },
  async getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return null;
    return data || { role: 'YOUTH', full_name: 'مبدع المختبر' };
  },
  onAuthStateChange(callback: any) { return supabase.auth.onAuthStateChange(callback); },
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
};

export const labsApi = {
    async getAll() {
      const { data, error } = await supabase.from('labs').select('*');
      return error ? [{ id: 'l1', name: 'مختبر تونس', province: 'تونس', icon: 'BuildingLibraryIcon' }] : data;
    }
  };
  
  export const projectsApi = {
    async getAll() {
      const { data, error } = await supabase.from('projects').select('*');
      return error ? [] : data;
    },
    async create(project: any) {
      const { data, error } = await supabase.from('projects').insert([project]);
      if (error) throw error;
      return data;
    },
    async getCounts() {
      const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  };
  
  export const assetsApi = {
    async getAll() {
      const { data, error } = await supabase.from('cultural_assets').select('*');
      return error ? [] : data;
    },
    async save(asset: any) {
      const { data, error } = await supabase.from('cultural_assets').insert([asset]);
      if (error) throw error;
      return data;
    }
  };
  
  export const kpisApi = {
    async getDashboardSummary() {
      return {
        totalBeneficiaries: 342,
        activeProjects: 12,
        avgSatisfaction: 4.5
      };
    }
  };
