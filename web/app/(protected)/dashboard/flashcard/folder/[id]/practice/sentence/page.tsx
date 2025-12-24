'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { PiStarFour } from 'react-icons/pi';
import { motion, AnimatePresence } from 'framer-motion';
import useSentencePracticeStore from '@/store/sentence-practice.store';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SentencePracticePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const folderId = params.id as string;

    // Store state
    const {
        sessionId,
        questions,
        currentIndex,
        userSentence,
        isAnswered,
        evaluation,
        loading,
        submitting,
        correctCount,
        incorrectCount,
        isFinished,
        result,
        createSession,
        restoreSession,
        submitSentence,
        nextQuestion,
        finishSession,
        saveSessionId,
        clearSessionId,
        setUserSentence,
        restartSession,
        isOutdated,
        setIsOutdated,
    } = useSentencePracticeStore();

    // Reset store if there's old finished result when entering page
    useEffect(() => {
        const storeState = useSentencePracticeStore.getState();
        if (storeState.isFinished && storeState.result && !storeState.sessionId) {
            useSentencePracticeStore.getState().reset();
        }
    }, []);

    // Initialize or restore session
    useEffect(() => {
        let isMounted = true;
        const currentStoreState = useSentencePracticeStore.getState();

        // If folderId changed, reset store first
        if (currentStoreState.folderId && currentStoreState.folderId !== folderId) {
            useSentencePracticeStore.getState().reset();
        }

        const initializeOrRestoreSession = async () => {
            try {
                // ... (rest of the logic remains similar but safe now)
                const sessionIdFromUrl = searchParams.get('sessionId');
                const sessionIdToRestore = sessionIdFromUrl ||
                    (typeof window !== 'undefined'
                        ? localStorage.getItem(`practice:sentence:session:${folderId}`)
                        : null);

                // Check if current session in store is valid for this folder
                const storeState = useSentencePracticeStore.getState();
                if (storeState.sessionId && storeState.folderId === folderId && !storeState.isFinished) {
                    return; // Already has valid session
                }

                if (sessionIdToRestore) {
                    // ... restore logic
                    try {
                        const { restored, isFinished: sessionFinished } = await restoreSession(sessionIdToRestore);
                        if (restored && isMounted && !sessionFinished) {
                            saveSessionId(sessionIdToRestore, folderId);
                            return;
                        }
                        if (isMounted) clearSessionId(folderId);
                    } catch (restoreError) {
                        if (isMounted) clearSessionId(folderId);
                    }
                }

                if (isMounted) {
                    await createSession(folderId);
                }
            } catch (error: any) {
                // ... error handling
                if (!isMounted) return;
                if (error.response?.status === 404 && error.response?.data?.message?.includes('Folder')) {
                    router.push(`/dashboard/flashcard/folder/${folderId}`);
                } else if (error.response?.status !== 404) {
                    router.push(`/dashboard/flashcard/folder/${folderId}`);
                }
            }
        };

        initializeOrRestoreSession();

        return () => { isMounted = false; };
    }, [folderId]);

    const handleFinish = async () => {
        try {
            await finishSession();
            clearSessionId(folderId);
        } catch (error) {
            console.error('Error finishing session:', error);
        }
    };

    const handleNext = useCallback(async () => {
        if (currentIndex < questions.length - 1) {
            nextQuestion();
        } else {
            await handleFinish();
        }
    }, [currentIndex, questions.length, nextQuestion, handleFinish]);

    const handleSubmit = async () => {
        if (!userSentence.trim() || submitting) return;
        try {
            await submitSentence(userSentence);
        } catch (error) {
            console.error('Error submitting sentence:', error);
        }
    };

    const handleRetryEvaluation = () => {
        // Reset answered state to allow retry
        useSentencePracticeStore.setState({ isAnswered: false, evaluation: null });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Đang tải câu hỏi...</p>
            </div>
        );
    }

    if (isFinished && result && sessionId) {
        return (
            <div className="flex flex-col gap-6 min-h-[60vh]">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}
                        className="w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                </div>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Kết quả luyện tập</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Tổng số câu</p>
                                <p className="text-3xl font-bold">{result.totalCount}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Đúng</p>
                                <p className="text-3xl font-bold text-green-600">{result.correctCount}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Cần cải thiện</p>
                                <p className="text-3xl font-bold text-red-600">{result.incorrectCount}</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}
                            className="w-full"
                            size="lg"
                        >
                            Quay lại Flashbook
                        </Button>

                        {/* Summary Section */}
                        {useSentencePracticeStore.getState().summary && (
                            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    Tổng kết bài tập
                                </h3>
                                <div className="prose dark:prose-invert max-w-none text-sm text-foreground">
                                    {useSentencePracticeStore.getState().summary?.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 last:mb-0">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-sm text-muted-foreground">Không có câu hỏi nào</p>
                <Button onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}>
                    Quay lại
                </Button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    // Determine feedback config based on status
    const getFeedbackConfig = (status: string) => {
        switch (status) {
            case 'correct':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 dark:bg-green-950/20',
                    borderColor: 'border-green-200 dark:border-green-800',
                    label: 'Chính xác'
                };
            case 'minor-error':
                return {
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    label: 'Có lỗi nhỏ'
                };
            case 'suggestion':
                return {
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    label: 'Gợi ý hoàn thiện'
                };
            case 'wrong':
                return {
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 dark:bg-red-950/20',
                    borderColor: 'border-red-200 dark:border-red-800',
                    label: 'Chưa chính xác'
                };
            case 'evaluation-error':
                return {
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
                    borderColor: 'border-orange-200 dark:border-orange-800',
                    label: 'Lỗi đánh giá'
                };
            default:
                return {
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    label: ''
                };
        }
    };

    const feedbackConfig = evaluation ? getFeedbackConfig(evaluation.status) : null;

    return (
        <div className="flex flex-col gap-6 min-h-[60vh] max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}
                    className="w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        Câu {currentIndex + 1} / {questions.length}
                    </div>
                    {(currentIndex > 0 || correctCount > 0 || incorrectCount > 0) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restartSession(folderId)}
                            disabled={loading || submitting}
                        >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Bắt đầu lại
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Question Card */}
            <Card className="flex-1 border-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Đặt câu với từ vựng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Target Word */}
                    <div className="space-y-2 text-center py-6 bg-accent/20 rounded-xl">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Từ khóa</p>
                        <p className="text-4xl font-bold text-primary">{currentQuestion.flashcard.name}</p>
                        <p className="text-lg text-muted-foreground">{currentQuestion.flashcard.meaning}</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium">Viết một câu tiếng Anh sử dụng từ trên:</label>
                        <Textarea
                            placeholder="Ví dụ: Since it was raining, we decided to stay indoors..."
                            value={userSentence}
                            onChange={(e) => setUserSentence(e.target.value)}
                            className="text-lg min-h-[120px] resize-none p-4"
                            disabled={isAnswered || submitting}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && userSentence.trim() && !submitting && !isAnswered) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                    </div>

                    {/* Feedback Section */}
                    <AnimatePresence mode="wait">
                        {isAnswered && evaluation && feedbackConfig && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`rounded-xl border-2 p-6 space-y-4 ${feedbackConfig.bgColor} ${feedbackConfig.borderColor}`}
                            >
                                {/* Status Label */}
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`font-bold text-lg ${feedbackConfig.color}`}>
                                        {feedbackConfig.label}
                                    </h3>
                                </div>

                                {/* Content based on status */}
                                <div className="grid gap-4">

                                    {/* Correct: Minimal info */}
                                    {evaluation.status === 'correct' && (
                                        <div className="text-sm text-muted-foreground">
                                            Bạn đã viết câu rất tốt!
                                        </div>
                                    )}

                                    {/* Minor Error: Suggestion + Explanation */}
                                    {evaluation.status === 'minor-error' && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-muted-foreground">Câu gợi ý:</p>
                                                <p className="text-lg font-medium">{evaluation.suggestion}</p>
                                                {evaluation.suggestionTranslation && (
                                                    <p className="text-sm text-muted-foreground">{evaluation.suggestionTranslation}</p>
                                                )}
                                            </div>
                                            {evaluation.explanation && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-muted-foreground">Giải thích:</p>
                                                    <p className="text-sm text-foreground bg-background/50 p-3 rounded-lg border">
                                                        {evaluation.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Suggestion: Good but... + Suggestion + Explanation */}
                                    {evaluation.status === 'suggestion' && (
                                        <>
                                            {evaluation.explanation && (
                                                <div className="space-y-1">
                                                    <p className="text-sm italic">
                                                        {evaluation.explanation}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-muted-foreground">Tham khảo câu này nhé:</p>
                                                <p className="text-lg font-medium">{evaluation.suggestion}</p>
                                                {evaluation.suggestionTranslation && (
                                                    <p className="text-sm text-muted-foreground">{evaluation.suggestionTranslation}</p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Wrong: Suggestion + Explanation + Word Usage */}
                                    {evaluation.status === 'wrong' && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-muted-foreground">Câu gợi ý:</p>
                                                <p className="text-lg font-medium">{evaluation.suggestion}</p>
                                                {evaluation.suggestionTranslation && (
                                                    <p className="text-sm text-muted-foreground">{evaluation.suggestionTranslation}</p>
                                                )}
                                            </div>

                                            {evaluation.explanation && (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-muted-foreground">Lỗi sai:</p>
                                                    <p className="text-sm text-foreground bg-background/50 p-3 rounded-lg border">
                                                        {evaluation.explanation}
                                                    </p>
                                                </div>
                                            )}

                                            {evaluation.wordUsageExplanation && (
                                                <div className="space-y-1 mt-2">
                                                    <p className="text-sm font-semibold text-muted-foreground">Cách dùng "{currentQuestion.flashcard.name}":</p>
                                                    <div className="text-sm text-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                                                        {evaluation.wordUsageExplanation}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Evaluation Error: Error message + Action buttons */}
                                    {evaluation.status === 'evaluation-error' && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-sm text-foreground bg-background/50 p-3 rounded-lg border">
                                                    Có vẻ câu bạn nhập vào không hợp lệ. Bạn có muốn thử lại không?
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                <Button
                                                    onClick={handleRetryEvaluation}
                                                    className="w-full"
                                                >
                                                    Thử lại
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-6">
                    {!isAnswered ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!userSentence.trim() || submitting}
                            size="lg"
                            className="w-full md:w-auto min-w-[150px]"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang chấm...
                                </>
                            ) : (
                                'Kiểm tra'
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            size="lg"
                            className="w-full md:w-auto min-w-[150px]"
                        >
                            {isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <AlertDialog open={isOutdated} onOpenChange={setIsOutdated}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Flashbook đã thay đổi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Flashbook này đã được cập nhật kể từ lần luyện tập trước của bạn. Bạn có muốn tiếp tục phiên hiện tại hay bắt đầu lại với dữ liệu mới?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsOutdated(false)}>Tiếp tục</AlertDialogCancel>
                        <AlertDialogAction onClick={() => restartSession(folderId)}>Bắt đầu lại</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
