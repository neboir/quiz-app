/**
 * LocalStorage helpers for persisting exam state
 */

const KEY_PREFIX = 'quizapp_';
const EXAM_KEY = KEY_PREFIX + 'exam_state';
const THEME_KEY = KEY_PREFIX + 'theme';
const STATS_KEY = KEY_PREFIX + 'stats';

export const storage = {
  // Exam state
  saveExamState(state) {
    try {
      localStorage.setItem(EXAM_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save exam state:', e);
    }
  },

  loadExamState() {
    try {
      const raw = localStorage.getItem(EXAM_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearExamState() {
    localStorage.removeItem(EXAM_KEY);
  },

  hasExamState() {
    return !!localStorage.getItem(EXAM_KEY);
  },

  // Theme
  saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  },

  loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  },

  // Stats history
  saveStats(stats) {
    try {
      const existing = this.loadStats();
      existing.push({ ...stats, timestamp: Date.now() });
      // Keep last 50 results
      const trimmed = existing.slice(-50);
      localStorage.setItem(STATS_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Could not save stats:', e);
    }
  },

  loadStats() {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
