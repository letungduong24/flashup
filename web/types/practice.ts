export interface FlashcardResponse {
  id: string;
  name: string;
  meaning: string;
  folder_id: string | null;
  review_count: number;
  audio_url: string | null;
  usage: any;
  status: string;
  interval: number;
  nextReview: Date | null;
  easeFactor: number;
  lapseCount: number;
  tags: string[];
  [key: string]: any;
}

export interface Question {
  flashcardId: string;
  question: string;
  answer: string;
  flashcard: FlashcardResponse;
  options?: string[];
}

export interface Answer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  folderId: string;
  questions: Question[];
  currentIndex: number;
  answers: Answer[];
  startTime: number;
  correctCount: number;
  incorrectCount: number;
  isOutdated?: boolean;
}

export interface CreateSessionResponse {
  sessionId: string;
  questions: Question[];
  isOutdated?: boolean;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  flashcard: FlashcardResponse;
}

export interface FinishSessionResponse {
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  duration: number;
  accuracy: number;
}

export interface EvaluateSentenceResponse {
  status: 'correct' | 'minor-error' | 'suggestion' | 'wrong' | 'evaluation-error';
  suggestion?: string;
  suggestionTranslation?: string; // Vietnamese translation of the suggestion
  explanation?: string;
  wordUsageExplanation?: string;
  errorTag?: string; // Granular error category
  correction: string; // Keep for backward compatibility if needed, map to suggestion logic
  tip: string; // Keep for backward compatibility if needed
}

export interface SubmitSentenceResponse {
  evaluation: EvaluateSentenceResponse;
  flashcard: FlashcardResponse;
}

