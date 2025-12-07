import { AntiqueAnalysis, HistoryItem } from '../types';

const HISTORY_KEY = 'antika_ai_history';

export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Geçmiş yüklenirken hata oluştu:", e);
    return [];
  }
};

export const saveToHistory = (analysis: AntiqueAnalysis, imageUrl: string) => {
  try {
    const history = getHistory();
    // Check if duplicate analysis (simple check by title and date to avoid re-saving on re-renders if logic is loose)
    // Using timestamp ID prevents this mostly, but good to be safe if calling multiple times.
    
    const newItem: HistoryItem = {
      ...analysis,
      id: Date.now().toString(),
      imageUrl,
      timestamp: Date.now(),
    };
    
    // Limit to last 12 items to prevent LocalStorage quota issues with base64 images
    const updatedHistory = [newItem, ...history].slice(0, 12);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Geçmiş kaydedilirken hata oluştu. Depolama alanı dolmuş olabilir.", e);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const deleteHistoryItem = (id: string) => {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
}