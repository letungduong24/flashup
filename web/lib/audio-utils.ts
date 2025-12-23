/**
 * Utility functions for playing audio with hybrid approach:
 * 1. Try Cambridge Dictionary audio (if available)
 * 2. Fallback to Web Speech API
 */

/**
 * Play audio using Web Speech API
 * @param text - Text to speak
 * @param lang - Language code (default: 'en-US')
 */
export function playWithWebSpeech(text: string, lang: string = 'en-US'): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Web Speech API is available
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API is not supported in this browser'));
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Normal pitch
    utterance.volume = 1; // Full volume

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (error) => {
      reject(error);
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play audio with hybrid approach:
 * 1. If audioUrl is provided, try to play it
 * 2. If audioUrl fails or is not provided, fallback to Web Speech API
 * @param text - Text to speak (for fallback)
 * @param audioUrl - Cambridge Dictionary audio URL (optional)
 * @param lang - Language code for Web Speech API (default: 'en-US')
 */
export async function playAudioWithFallback(
  text: string,
  audioUrl?: string | null,
  lang: string = 'en-US'
): Promise<void> {
  // If we have audio URL, try to play it first
  if (audioUrl) {
    try {
      await playAudioFile(audioUrl);
      return; // Success, no need for fallback
    } catch (error) {
      // Audio file failed, fallback to Web Speech API
      console.warn('Failed to play audio file, using Web Speech API fallback:', error);
    }
  }

  // Fallback to Web Speech API
  // Clean text: remove "to " prefix if present (e.g., "to taste" -> "taste")
  const cleanText = text.replace(/^to\s+/i, '').trim();
  await playWithWebSpeech(cleanText, lang);
}

/**
 * Play audio from URL
 * @param audioUrl - URL of the audio file
 */
export function playAudioFile(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    // If audio fails to load, reject after timeout
    const timeout = setTimeout(() => {
      reject(new Error('Audio loading timeout'));
    }, 5000);

    audio.onended = () => {
      clearTimeout(timeout);
      resolve();
    };

    audio.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };

    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      audio.play().catch((playError) => {
        clearTimeout(timeout);
        reject(playError);
      });
    };

    audio.load();
  });
}

/**
 * Check if Web Speech API is available
 */
export function isWebSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}

