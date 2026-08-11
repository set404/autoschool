import { AuthUser } from './auth.model';

export type LessonType = 'ONLINE' | 'OFFLINE';
export type LessonStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface Lesson {
  id: string;
  student: AuthUser;
  teacher: AuthUser;
  scheduledAt: number;
  durationMinutes: number;
  type: LessonType;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  status: LessonStatus;
  createdAt: number;
}

export interface LessonCreatePayload {
  scheduledAt: number;
  durationMinutes: number;
  type: LessonType;
  location?: string;
  meetingLink?: string;
  notes?: string;
}
