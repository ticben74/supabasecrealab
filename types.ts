
export type UserRole = 'PROJECT_MANAGER' | 'LAB_MANAGER' | 'YOUTH' | 'GUEST' | null;

export interface GPS {
  lat: number;
  lng: number;
}

// ========== Academy Types ==========
export interface Lesson {
  id: string;
  level_id: string;
  title: string;
  duration: string;
  content: string;
  type: 'video' | 'article' | 'workshop';
  order: number;
  points: number;
  is_published: boolean;
}

export interface CourseLevel {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  lessons?: Lesson[];
  status: 'locked' | 'available' | 'completed';
  category: string;
  duration_hours: number;
  points: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  type: 'basic' | 'intermediate' | 'advanced' | 'special';
  requirement: string;
  is_earned?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  courses_count: number;
  badge_id: string;
  level_ids: string[];
  order: number;
  category: string;
}

export interface SmartPath {
  id: string;
  user_id: string;
  type: 'project' | 'visit' | 'creative';
  project_title: string;
  description: string;
  content: any; // JSON containing roadmap, itinerary, or creative text
  created_at: string;
}

// ========== Existing Types ==========
export interface CulturalAsset {
  id: string;
  category: "material" | "immaterial" | "natural" | "social";
  documentation: {
    name: string;
    localName: string;
    location: GPS;
    historicalContext: string;
    currentState: "endangered" | "preserved" | "thriving";
    images: string[];
  };
  culturalValue: {
    identitySignificance: "عالي" | "متوسط" | "منخفض";
    socialCohesion: string;
    storytellingPower: number;
  };
  valorisationPaths: {
    digital: string[];
    product: string[];
    experience: string[];
  };
}

export interface Project {
  id: string;
  labId: string;
  title: string;
  owner: string;
  category: 'فنون' | 'رقمنة' | 'اقتصاد اجتماعي' | 'بيئة';
  status: 'idea' | 'prototype' | 'launched' | 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  canvas: any;
}

export interface Lab {
  id: string;
  code: string;
  name: string;
  province: string;
  gps: GPS;
  managerEmail: string;
  managerName?: string;  // Added for GM control
  managerImage?: string; // Added for GM control
  description: string;
  icon?: string;
  budget: {
    allocated: number;
    spent: number;
  };
}

export type MentorContext = 
  | 'general' | 'ideation' | 'canvas' | 'swot' | 'budget' | 'planning' | 'pitch' | 'validation' | 'cultural_asset' | 'education';

export interface Message {
  role: 'user' | 'model';
  text: string;
}
