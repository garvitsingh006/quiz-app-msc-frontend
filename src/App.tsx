import { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, Loader2, Brain } from 'lucide-react';
import { fetchAllQuestions, calculateScore } from './api';
import type { Question, Answer, ScoreResult } from './types';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllQuestions();
      setQuestions(data);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, option: string) => {
    if (result) return;

    setSelectedAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, option);
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (selectedAnswers.size !== questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const answers: Answer[] = Array.from(selectedAnswers.entries()).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      const scoreResult = await calculateScore(answers);
      setResult(scoreResult);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to submit answers. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers(new Map());
    setResult(null);
    setError(null);
    loadQuestions();
  };

  const getOptionClassName = (questionId: string, option: string) => {
    const selected = selectedAnswers.get(questionId) === option;

    if (!result) {
      return `p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
      }`;
    }

    const questionResult = result.details.find(d => d.questionId === questionId);
    if (!questionResult) return 'p-4 rounded-xl border-2 border-gray-200';

    const isCorrect = option === questionResult.correctAnswer;
    const isSelected = option === questionResult.selectedOption;

    if (isCorrect) {
      return 'p-4 rounded-xl border-2 border-green-500 bg-green-50 shadow-md';
    }

    if (isSelected && !isCorrect) {
      return 'p-4 rounded-xl border-2 border-red-500 bg-red-50 shadow-md';
    }

    return 'p-4 rounded-xl border-2 border-gray-200 opacity-50';
  };

  const getOptionIcon = (questionId: string, option: string) => {
    if (!result) return null;

    const questionResult = result.details.find(d => d.questionId === questionId);
    if (!questionResult) return null;

    const isCorrect = option === questionResult.correctAnswer;
    const isSelected = option === questionResult.selectedOption;

    if (isCorrect) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }

    if (isSelected && !isCorrect) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Challenge
          </h1>
          <p className="text-gray-600 text-lg">
            Test your knowledge and see how well you score!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slide-in">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slide-in">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600">{result.score}</p>
                  <p className="text-gray-600 mt-1">Correct Answers</p>
                </div>
                <div className="w-px h-16 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-purple-600">{result.percentage.toFixed(0)}%</p>
                  <p className="text-gray-600 mt-1">Score</p>
                </div>
              </div>
              <button
                onClick={handleRetake}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 flex-1 pt-1">
                  {question.questionText}
                </h3>
              </div>

              <div className="space-y-3 ml-14">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    onClick={() => handleOptionSelect(question._id, option)}
                    className={getOptionClassName(question._id, option)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedAnswers.get(question._id) === option && !result
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswers.get(question._id) === option && !result && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-800 font-medium">{option}</span>
                      </div>
                      {getOptionIcon(question._id, option)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!result && questions.length > 0 && (
          <div className="mt-8 text-center animate-fade-in">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedAnswers.size !== questions.length}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Quiz'
              )}
            </button>
            <p className="mt-3 text-gray-500 text-sm">
              {selectedAnswers.size} of {questions.length} questions answered
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
