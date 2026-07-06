export interface LanguageOption {
  id: string;
  label: string;
  nativeLabel?: string;
  code: string;
  direction: 'ltr' | 'rtl';
  supportsColloquialVariant?: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { id: 'en', label: 'English', nativeLabel: 'English', code: 'en', direction: 'ltr' },
  { id: 'it', label: 'Italian', nativeLabel: 'Italiano', code: 'it', direction: 'ltr' },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español', code: 'es', direction: 'ltr' },
  { id: 'fr', label: 'French', nativeLabel: 'Français', code: 'fr', direction: 'ltr' },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch', code: 'de', direction: 'ltr' },
  { id: 'pt', label: 'Portuguese', nativeLabel: 'Português', code: 'pt', direction: 'ltr' },
  { id: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', code: 'nl', direction: 'ltr' },
  { id: 'sv', label: 'Swedish', nativeLabel: 'Svenska', code: 'sv', direction: 'ltr' },
  { id: 'no', label: 'Norwegian', nativeLabel: 'Norsk', code: 'no', direction: 'ltr' },
  { id: 'da', label: 'Danish', nativeLabel: 'Dansk', code: 'da', direction: 'ltr' },
  { id: 'fi', label: 'Finnish', nativeLabel: 'Suomi', code: 'fi', direction: 'ltr' },
  { id: 'pl', label: 'Polish', nativeLabel: 'Polski', code: 'pl', direction: 'ltr' },
  { id: 'ru', label: 'Russian', nativeLabel: 'Русский', code: 'ru', direction: 'ltr' },
  { id: 'fa', label: 'Persian', nativeLabel: 'فارسی', code: 'fa', direction: 'rtl', supportsColloquialVariant: true },
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية', code: 'ar', direction: 'rtl' },
  { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', code: 'tr', direction: 'ltr' },
  { id: 'zh', label: 'Chinese', nativeLabel: '中文', code: 'zh', direction: 'ltr' },
  { id: 'ja', label: 'Japanese', nativeLabel: '日本語', code: 'ja', direction: 'ltr' },
  { id: 'ko', label: 'Korean', nativeLabel: '한국어', code: 'ko', direction: 'ltr' },
  { id: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', code: 'hi', direction: 'ltr' },
  { id: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', code: 'vi', direction: 'ltr' },
  { id: 'other', label: 'Other / Custom', code: 'other', direction: 'ltr' },
];

export const getLanguageDirection = (label: string): 'ltr' | 'rtl' => {
  const lang = LANGUAGES.find(l => l.label === label);
  return lang ? lang.direction : 'ltr';
};
