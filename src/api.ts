import type { Question, Answer, ScoreResult } from './types.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchAllQuestions = async (): Promise<Question[]> => {
  const response = await fetch(`${API_BASE_URL}/questions/fetchAll`);

  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }

  const data = await response.json();
  return data.data || data;
};

export const calculateScore = async (answers: Answer[]): Promise<ScoreResult> => {
  const response = await fetch(`${API_BASE_URL}/questions/calculateScore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });

  console.log(answers)

  if (!response.ok) {
    throw new Error('Failed to calculate score');
  }

  const data = await response.json();
  return data.data;
};
