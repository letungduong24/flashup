import { FlashcardResponse, FlashcardRequest } from '@/types/flashcard';

/**
 * Helper functions for spaced repetition algorithm
 */

/**
 * Get end of today (23:59:59.999)
 */
export const getEndOfToday = (): Date => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

/**
 * Get current time
 */
export const getNow = (): Date => {
  return new Date();
};

/**
 * Calculate next review date based on interval (in days)
 * @param interval - Number of days until next review
 * @returns Date object for next review
 */
export const calculateNextReview = (interval: number): Date => {
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + Math.round(interval));
  nextReview.setHours(23, 59, 59, 999);
  return nextReview;
};

/**
 * Handle "Chưa nhớ" action for new flashcard
 */
export const handleNewForgot = (flashcard: FlashcardResponse): FlashcardRequest => {
  return {
    name: flashcard.name,
    meaning: flashcard.meaning,
    folder_id: flashcard.folder_id || undefined,
    audio_url: flashcard.audio_url || undefined,
    usage: flashcard.usage || undefined,
    tags: flashcard.tags,
    status: "new",
    nextReview: getNow(),
    // interval, easeFactor giữ nguyên
  };
};

/**
 * Handle "Đã nhớ" (Good) action for new flashcard
 */
export const handleNewGood = (flashcard: FlashcardResponse): FlashcardRequest => {
  return {
    name: flashcard.name,
    meaning: flashcard.meaning,
    folder_id: flashcard.folder_id || undefined,
    audio_url: flashcard.audio_url || undefined,
    usage: flashcard.usage || undefined,
    tags: flashcard.tags,
    status: "review",
    interval: 1,
    nextReview: getEndOfToday(),
    easeFactor: 1.3,
  };
};

/**
 * Handle "Quên" (Forgot) action for review flashcard
 */
export const handleReviewForgot = (flashcard: FlashcardResponse): FlashcardRequest => {
  // interval = 1, easeFactor -= 0.2 (min 1.3), lapseCount += 1
  const currentEase = flashcard.easeFactor ?? 2.5;
  const currentLapse = flashcard.lapseCount ?? 0;
  const newEaseFactor = Math.max(1.3, currentEase - 0.2);
  const newLapseCount = currentLapse + 1;
  
  return {
    name: flashcard.name,
    meaning: flashcard.meaning,
    folder_id: flashcard.folder_id || undefined,
    audio_url: flashcard.audio_url || undefined,
    usage: flashcard.usage || undefined,
    tags: flashcard.tags,
    interval: 1,
    easeFactor: newEaseFactor,
    lapseCount: newLapseCount,
    // nextReview sẽ được backend tính = today + interval
  };
};

/**
 * Handle "Khó" (Hard) action for review flashcard
 */
export const handleReviewHard = (flashcard: FlashcardResponse): FlashcardRequest => {
  // easeFactor giữ nguyên, interval *= 1.1
  const baseInterval = flashcard.interval ?? 0;
  const newInterval = baseInterval * 1.1;
  
  return {
    name: flashcard.name,
    meaning: flashcard.meaning,
    folder_id: flashcard.folder_id || undefined,
    audio_url: flashcard.audio_url || undefined,
    usage: flashcard.usage || undefined,
    tags: flashcard.tags,
    interval: newInterval,
    // nextReview sẽ được backend tính = today + interval
  };
};

/**
 * Handle "Bình thường" (Normal) action for review flashcard
 */
export const handleReviewNormal = (flashcard: FlashcardResponse): FlashcardRequest => {
  // interval *= easeFactor
  const baseInterval = flashcard.interval ?? 0;
  const ease = flashcard.easeFactor ?? 2.5;
  const newInterval = baseInterval * ease;
  
  return {
    name: flashcard.name,
    meaning: flashcard.meaning,
    folder_id: flashcard.folder_id || undefined,
    audio_url: flashcard.audio_url || undefined,
    usage: flashcard.usage || undefined,
    tags: flashcard.tags,
    interval: newInterval,
    // nextReview sẽ được backend tính = today + interval
  };
};

/**
 * Handle "Dễ" (Easy) action for review flashcard
 */
export const handleReviewEasy = (flashcard: FlashcardResponse): FlashcardRequest => {
  // easeFactor += 0.15, interval *= (easeFactor + 0.3)
  const baseEase = flashcard.easeFactor ?? 2.5;
  const baseInterval = flashcard.interval ?? 0;
  const newEaseFactor = baseEase + 0.15;
  const newInterval = baseInterval * (baseEase + 0.3);
  
  return {
    name: flashcard.name,
    meaning: flashcard.meaning,
    folder_id: flashcard.folder_id || undefined,
    audio_url: flashcard.audio_url || undefined,
    usage: flashcard.usage || undefined,
    tags: flashcard.tags,
    easeFactor: newEaseFactor,
    interval: newInterval,
    // nextReview sẽ được backend tính = today + interval
  };
};

