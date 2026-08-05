import { LocalizedText } from './i18n.model';

export interface QuestionOption {
  id: string;
  text: LocalizedText;
}

export interface Question {
  id: string;
  imageUrl?: string;
  text: LocalizedText;
  options: QuestionOption[];
  correctOptionId: string;
  info?: LocalizedText;
}
