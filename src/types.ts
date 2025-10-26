export interface Question {
  _id: string;
  questionText: string;
  options: string[];
}

export interface Answer {
  questionId: string;
  selectedOption: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ScoreResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  details: QuestionResult[];
}
