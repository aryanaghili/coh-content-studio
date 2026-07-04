export interface DefaultSource {
  id: string;
  title: string;
  type: 'PDF' | 'Audio' | 'Text' | 'Video' | 'Image';
  status: 'Ready' | 'Processing' | 'Error';
  useFor: string;
  content: string;
  notes: string;
  createdAt: string;
}

export const DEFAULT_COH_SOURCES: DefaultSource[] = [];
