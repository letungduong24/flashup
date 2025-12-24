import { create } from 'zustand';
import api from '@/lib/axios';
import {
    Question,
    PracticeSession,
    CreateSessionResponse,
    FinishSessionResponse,
    SubmitSentenceResponse,
    EvaluateSentenceResponse,
} from '@/types/practice';

interface SentencePracticeState {
    // Session data
    sessionId: string | null;
    folderId: string | null;
    questions: Question[];
    currentIndex: number;

    // Answer state
    userSentence: string;
    isAnswered: boolean;
    evaluation: EvaluateSentenceResponse | null;

    // Stats
    correctCount: number;
    incorrectCount: number;

    // Status
    loading: boolean;
    submitting: boolean;
    isFinished: boolean;
    result: FinishSessionResponse | null;

    summary: string | null;
    isOutdated: boolean;

    // Actions
    createSession: (folderId: string) => Promise<void>;
    restoreSession: (sessionId: string) => Promise<{ restored: boolean; isFinished: boolean }>;
    submitSentence: (sentence: string) => Promise<void>;
    nextQuestion: () => void;
    finishSession: () => Promise<void>;
    saveSessionId: (id: string, folderId: string) => void;
    clearSessionId: (folderId: string) => void;
    setUserSentence: (sentence: string) => void;
    resetAnswerState: () => void;
    reset: () => void;
    restartSession: (folderId: string) => Promise<void>;
    setIsOutdated: (isOutdated: boolean) => void;
}

const useSentencePracticeStore = create<SentencePracticeState>((set, get) => ({
    // Initial state
    sessionId: null,
    folderId: null,
    questions: [],
    currentIndex: 0,
    userSentence: '',
    isAnswered: false,
    evaluation: null,
    correctCount: 0,
    incorrectCount: 0,
    loading: false,
    submitting: false,
    isFinished: false,
    result: null,
    summary: null,
    isOutdated: false,

    // Save sessionId to localStorage and URL
    // ... (unchanged)
    saveSessionId: (id: string, folderId: string) => {
        set({ sessionId: id });
        const key = `practice:sentence:session:${folderId}`;
        localStorage.setItem(key, id);

        // Update URL
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('sessionId', id);
            window.history.replaceState({}, '', url.toString());
        }
    },

    // Clear sessionId from localStorage and URL
    clearSessionId: (folderId: string) => {
        const { sessionId } = get();
        if (sessionId) {
            localStorage.removeItem(`practice:sentence:session:${sessionId}`);
        }
        localStorage.removeItem(`practice:sentence:session:${folderId}`);

        // Update URL
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('sessionId');
            window.history.replaceState({}, '', url.toString());
        }
    },

    // Create new session
    // ... (unchanged partially, need to ensure summary is reset)
    createSession: async (folderId: string) => {
        set({ loading: true });
        try {
            // Reset all state before creating new session
            set({
                sessionId: null,
                folderId: null,
                questions: [],
                currentIndex: 0,
                userSentence: '',
                isAnswered: false,
                evaluation: null,
                isFinished: false,
                result: null,
                summary: null,
                isOutdated: false,
            });

            const response = await api.post<CreateSessionResponse>('/practice/sessions', {
                folderId,
                mode: 'fill-in-the-blank', // Reusing the same session creation but handling answer differently
            });

            const { sessionId, questions, isOutdated } = response.data;

            set({
                sessionId,
                folderId,
                questions,
                currentIndex: 0,
                correctCount: 0,
                incorrectCount: 0,
                isFinished: false,
                result: null,
                summary: null,
                isOutdated: !!isOutdated,
            });

            get().saveSessionId(sessionId, folderId);
        } catch (error: any) {
            console.error('Error creating session:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Restore session
    restoreSession: async (sessionId: string): Promise<{ restored: boolean; isFinished: boolean }> => {
        set({ loading: true });
        try {
            const response = await api.get<PracticeSession>(`/practice/sessions/${sessionId}`);
            const session = response.data;

            // Check if session is already completed
            if (session.currentIndex >= session.questions.length) {
                return { restored: false, isFinished: true };
            }

            // We can reuse fill-in-the-blank sessions for sentence practice as structure is same
            if (session.questions.length > 0 && session.questions[0]?.options) {
                return { restored: false, isFinished: false };
            }

            set({
                sessionId: session.id,
                folderId: session.folderId,
                questions: session.questions,
                currentIndex: session.currentIndex,
                correctCount: session.correctCount,
                incorrectCount: session.incorrectCount,
                isFinished: false,
                result: null,
                summary: null,
                isOutdated: !!session.isOutdated,
            });

            return { restored: true, isFinished: false };
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('Session not found or expired, will create new session');
            } else {
                console.error('Error restoring session:', error);
            }
            return { restored: false, isFinished: false };
        } finally {
            set({ loading: false });
        }
    },

    // Submit sentence
    // ... (unchanged)
    submitSentence: async (sentence: string) => {
        const { sessionId, submitting } = get();
        if (!sessionId || submitting || !sentence.trim()) return;

        set({ submitting: true });
        try {
            const response = await api.post<SubmitSentenceResponse & { evaluationFailed?: boolean }>(
                `/practice/sessions/${sessionId}/evaluate-sentence`,
                { sentence }
            );

            const { evaluation, evaluationFailed } = response.data;

            // If evaluation failed, set special error state
            if (evaluationFailed || evaluation.status === 'evaluation-error') {
                set({
                    evaluation: {
                        ...evaluation,
                        status: 'evaluation-error' as any,
                    },
                    isAnswered: true,
                    submitting: false,
                });
                return;
            }

            const { correctCount, incorrectCount } = get();

            const isCorrect = evaluation.status === 'correct' || evaluation.status === 'suggestion';

            let newCorrectCount = correctCount;
            let newIncorrectCount = incorrectCount;

            if (isCorrect) {
                newCorrectCount++;
            } else {
                newIncorrectCount++;
            }

            set({
                evaluation,
                isAnswered: true,
                correctCount: newCorrectCount,
                incorrectCount: newIncorrectCount,
            });
        } catch (error: any) {
            console.error('Error submitting sentence:', error);
            throw error;
        } finally {
            set({ submitting: false });
        }
    },

    // Move to next question
    nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
            set({
                currentIndex: currentIndex + 1,
                userSentence: '',
                isAnswered: false,
                evaluation: null,
            });
        }
    },

    // Finish session
    finishSession: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ loading: true }); // Show loading while summarizing

        try {
            // 1. Fetch Summary
            let summary = null;
            try {
                const summaryRes = await api.post<{ summary: string; }>(
                    `/practice/sessions/${sessionId}/summary`
                );
                summary = summaryRes.data.summary;
            } catch (err) {
                console.error('Failed to fetch summary', err);
                summary = 'Không thể tạo tổng kết bài tập.';
            }

            // 2. Finish Session (deletes from Redis)
            const response = await api.post<FinishSessionResponse>(
                `/practice/sessions/${sessionId}/finish`
            );

            set({
                result: response.data,
                summary: summary,
                isFinished: true,
            });
        } catch (error: any) {
            console.error('Error finishing session:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Set user sentence
    setUserSentence: (sentence: string) => {
        set({ userSentence: sentence });
    },

    // Reset answer state
    resetAnswerState: () => {
        set({
            userSentence: '',
            isAnswered: false,
            evaluation: null,
        });
    },

    // Reset all state
    reset: () => {
        set({
            sessionId: null,
            folderId: null,
            questions: [],
            currentIndex: 0,
            userSentence: '',
            isAnswered: false,
            evaluation: null,
            correctCount: 0,
            incorrectCount: 0,
            loading: false,
            submitting: false,
            isFinished: false,
            result: null,
        });
    },

    // Restart session
    restartSession: async (folderId: string) => {
        const { sessionId } = get();
        if (sessionId) {
            try {
                await api.post(`/practice/sessions/${sessionId}/finish`);
            } catch (error) {
                console.log('Session already deleted or not found');
            }
        }
        get().clearSessionId(folderId);
        get().reset();
        await get().createSession(folderId);
    },
    setIsOutdated: (isOutdated: boolean) => {
        set({ isOutdated });
    },
}));

export default useSentencePracticeStore;
