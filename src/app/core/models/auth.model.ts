export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  avatarUrl: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: AuthUser;
}
