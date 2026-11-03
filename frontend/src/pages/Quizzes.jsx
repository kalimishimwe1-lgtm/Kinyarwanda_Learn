import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { quiz as fallbackQuestions } from '../data/content';
import { api } from '../lib/api';
import { saveQuizAttempt } from '../lib/progress';

function normalizeQuestion(question) {
  return {
    id: question.id,
    question: question.question,
    options: question.options || [question.option1, question.option2, question.option3, question.option4],
  };
}

export default function Quizzes() {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadNotice, setLoadNotice] = useState('');
  const [progressNotice, setProgressNotice] = useState('');
  const completionRecorded = useRef(false);

  useEffect(() => {
    let active = true;
    api('/quizzes')
      .then((data) => {
        if (active) setQuestions(data.map(normalizeQuestion));
      })
      .catch(() => {
        if (!active) return;
        setQuestions(fallbackQuestions.map(normalizeQuestion));
        setLoadNotice('Showing practice questions while the server connection is unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const question = questions[questionIndex];

  async function checkAnswer(event) {
    event.preventDefault();
    if (!question || !selected || submitting) return;

    setError('');
    setSubmitting(true);
    try {
      const answerResult = await api(`/quizzes/${question.id}/answer`, {
        method: 'POST',
        body: { answer: selected },
      });
      setResult(answerResult);
      if (answerResult.correct) setScore((currentScore) => currentScore + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      if (!completionRecorded.current) {
        const saved = saveQuizAttempt(score, questions.length);
        completionRecorded.current = true;
        if (!saved.success) setProgressNotice(saved.error);
      }
      setComplete(true);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelected('');
    setResult(null);
    setError('');
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelected('');
    setResult(null);
    setScore(0);
    setComplete(false);
    setError('');
    setProgressNotice('');
    completionRecorded.current = false;
  }

  if (loading) {
    return <section className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">Loading questions…</section>;
  }

  if (!questions.length) {
    return <section className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">No quiz questions are available yet.</section>;
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Quick check</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">Vocabulary quiz</h1>

        {loadNotice && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadNotice}</p>}

        {complete ? (
          <div className="mt-8 rounded-2xl bg-emerald-50 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Quiz complete</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">You scored {score} of {questions.length}</h2>
            <p className="mt-3 text-slate-600">
              {progressNotice || 'Your result is saved in this browser only.'}
            </p>
            <button type="button" onClick={restartQuiz} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
              Try again
            </button>
          </div>
        ) : (
          <form className="mt-8" onSubmit={checkAnswer}>
            <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
              <span>Question {questionIndex + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
            </div>

            <fieldset className="mt-6">
              <legend className="text-xl font-bold text-slate-900">{question.question}</legend>
              <div className="mt-5 grid gap-3">
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrect = result?.correct && isSelected;
                  const isIncorrect = result && isSelected && !result.correct;

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : isIncorrect
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : isSelected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={isSelected}
                        disabled={Boolean(result)}
                        onChange={() => setSelected(option)}
                        className="accent-emerald-600"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

            {result && (
              <p className={`mt-5 rounded-xl px-4 py-3 ${result.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {result.correct
                  ? 'Correct! Great work.'
                  : `Not quite. The correct answer is “${result.correctAnswer}”.`}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {result ? (
                <button type="button" onClick={nextQuestion} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
                  {questionIndex === questions.length - 1 ? 'See results' : 'Next question'}
                </button>
              ) : (
                <button type="submit" disabled={!selected || submitting} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                  {submitting ? 'Checking…' : 'Submit answer'}
                </button>
              )}
              <Link to="/lessons" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:border-emerald-300">
                Review lessons
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
