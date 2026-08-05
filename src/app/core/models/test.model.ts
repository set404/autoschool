import { LocalizedText } from './i18n.model';

export interface TestSummary {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  questionIds: string[];
}
