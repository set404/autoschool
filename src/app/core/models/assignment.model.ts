import { AuthUser } from './auth.model';

export interface Assignment {
  id: string;
  createdAt: string;
  teacher: AuthUser;
  student: AuthUser;
}
