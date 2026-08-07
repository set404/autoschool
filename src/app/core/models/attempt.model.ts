import { LocalizedText } from './i18n.model';

export interface TestAttempt {
  id: string;
  testId: string | null;
  testTitle: LocalizedText;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  elapsedSeconds: number;
  completedAt: number;
}
