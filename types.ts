
export enum Category {
  RELATIONSHIPS = 'Relacionamentos',
  CAREER = 'Carreira e Propósito',
  EMOTIONAL = 'Equilíbrio Emocional',
  FINANCE = 'Vida Financeira',
  HEALTH = 'Saúde e Bem-estar',
  SPIRITUALITY = 'Espiritualidade',
  OTHER = 'Outro'
}

export interface CustomCategory {
  id: string;
  name: string;
  icon: string; // Can be a Lucide icon name or a base64 string
}

export interface ReflectionRequest {
  category: string;
  context: string;
}

export interface ReflectionResponse {
  reflection: string;
  advice: string;
  affirmation: string;
  quote: {
    text: string;
    author: string;
  };
}

export interface JournalEntry {
  id: string;
  reflectionId: string;
  text: string;
  timestamp: number;
}

export interface HistoryItem extends ReflectionResponse {
  id: string;
  category: string;
  context: string;
  timestamp: number;
  journalEntry?: string;
}
