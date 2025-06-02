// src/types/index.ts
import { Timestamp } from 'firebase/firestore';

export type ReactionType = 'like' | 'heart' | 'smile' | 'wow' | 'angry' | 'sad';

export interface Reaction {
  type: ReactionType;
  count: number;
  userIds: string[];
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
  replies: Reply[];
  reactions: Reaction[];
}

export interface Reply {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
  reactions: Reaction[];
}

export interface Rating {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  title: string;
  duration: string;
}

export interface Enrollment {
  courseId: string;
}

export interface Course {
  id: string;
  courseTitle: string;
  description: string;
  instructor: string;
  profileimg: string;
  categories: string;
  duration: string;
  price: number;
  thumbnail: string;
  learningOutcomes: string[];
  modules: Module[];
  startDate: string;
  level: string;
  enrolledStudents: number;
  language: string;
}