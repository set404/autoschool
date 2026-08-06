import { LocalizedText } from './models/i18n.model';

export const PASS_RATIO = 0.9;

/** Reserved test id for the synthetic "practice your missed questions" session. */
export const MISSED_TEST_ID = 'missed-questions';

export const MISSED_TEST_TITLE: LocalizedText = {
  hy: 'Սխալ պատասխանված հարցեր',
  en: 'Missed Questions',
  ru: 'Вопросы с ошибками',
};

export const MISSED_TEST_DESCRIPTION: LocalizedText = {
  hy: 'Կրկնեք այն հարցերը, որոնց սխալ եք պատասխանել նախորդ թեստերում։',
  en: 'Practice the questions you got wrong in previous tests.',
  ru: 'Повторите вопросы, на которые вы ответили неправильно в прошлых тестах.',
};
