const STORAGE_KEY = 'kinyarwanda-quiz-history';
const MAX_SAVED_ATTEMPTS = 50;

function isQuizAttempt(value) {
  return value
    && Number.isInteger(value.score)
    && Number.isInteger(value.total)
    && value.total > 0
    && value.score >= 0
    && value.score <= value.total
    && typeof value.completedAt === 'string';
}

export function readQuizHistory() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { attempts: [], error: '' };

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return { attempts: [], error: 'Saved progress could not be read. New results will not overwrite it.' };
    }

    return { attempts: parsed.filter(isQuizAttempt), error: '' };
  } catch {
    return { attempts: [], error: 'Progress storage is unavailable in this browser.' };
  }
}

export function saveQuizAttempt(score, total) {
  const { attempts, error } = readQuizHistory();
  if (error) return { success: false, error };

  try {
    const attempt = { score, total, completedAt: new Date().toISOString() };
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...attempts, attempt].slice(-MAX_SAVED_ATTEMPTS)),
    );
    return { success: true, error: '' };
  } catch {
    return { success: false, error: 'This quiz result could not be saved in this browser.' };
  }
}
