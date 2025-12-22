'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { playAudioWithFallback } from '@/lib/audio-utils';
import { motion, AnimatePresence } from 'framer-motion';
import useMultipleChoiceStore from '@/store/multiple-choice.store';

export default function MultipleChoicePracticePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = params.id as string;

  // Store state
  const {
    sessionId,
    questions,
    currentIndex,
    isAnswered,
    isCorrect,
    loading,
    submitting,
    correctCount,
    incorrectCount,
    isFinished,
    result,
    createSession,
    restoreSession,
    submitAnswer,
    nextQuestion,
    finishSession,
    saveSessionId,
    clearSessionId,
    restartSession,
  } = useMultipleChoiceStore();

  const [localIsPlayingAudio, setLocalIsPlayingAudio] = useState(false);
  
  const {
    selectedOption,
    setSelectedOption: setSelectedOptionStore,
  } = useMultipleChoiceStore();

  // Reset store if there's old finished result when entering page
  useEffect(() => {
    const storeState = useMultipleChoiceStore.getState();
    if (storeState.isFinished && storeState.result && !storeState.sessionId) {
      useMultipleChoiceStore.getState().reset();
    }
  }, []);

  // Initialize or restore session (only once)
  useEffect(() => {
    let isMounted = true;
    
    const initializeOrRestoreSession = async () => {
      try {
        const sessionIdFromUrl = searchParams.get('sessionId');
        const sessionIdToRestore = sessionIdFromUrl || 
          (typeof window !== 'undefined' 
            ? localStorage.getItem(`practice:multiple-choice:session:${folderId}`)
            : null);

        if (sessionIdToRestore) {
          try {
            const { restored, isFinished: sessionFinished } = await restoreSession(sessionIdToRestore);
            if (restored && isMounted && !sessionFinished) {
              // Session restored successfully and not finished
              saveSessionId(sessionIdToRestore, folderId);
              return;
            }
            if (isMounted) {
              clearSessionId(folderId);
            }
          } catch (restoreError) {
            if (isMounted) {
              clearSessionId(folderId);
            }
          }
        }

        if (isMounted) {
          await createSession(folderId);
        }
      } catch (error: any) {
        if (!isMounted) return;
        console.error('Error initializing session:', error);
        if (error.response?.status === 404 && error.response?.data?.message?.includes('Folder')) {
          router.push(`/dashboard/flashcard/folder/${folderId}`);
        } else if (error.response?.status !== 404) {
          router.push(`/dashboard/flashcard/folder/${folderId}`);
        }
      }
    };

    if (folderId && (!sessionId || isFinished)) {
      initializeOrRestoreSession();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setSelectedOptionStore(null);
    } else {
      await handleFinish();
    }
  }, [currentIndex, questions.length, nextQuestion, handleFinish, setSelectedOptionStore]);

  const handleSelectOption = async (option: string) => {
    if (isAnswered || submitting || !option) return;
    
    setSelectedOptionStore(option);
    try {
      await submitAnswer(option);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSelectedOptionStore(null);
    }
  };

  // Keyboard shortcut: Enter to go to next question when answered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isAnswered && !submitting && !localIsPlayingAudio) {
        e.preventDefault();
        handleNext();
      }
    };

    if (isAnswered) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnswered, submitting, localIsPlayingAudio, handleNext]);

  const handlePlayAudio = async () => {
    if (!questions[currentIndex] || localIsPlayingAudio) return;
    
    setLocalIsPlayingAudio(true);
    try {
      await playAudioWithFallback(
        questions[currentIndex].flashcard.name,
        questions[currentIndex].flashcard.audio_url || null,
        'en-US'
      );
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setLocalIsPlayingAudio(false);
    }
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
                <p className="text-sm text-muted-foreground">Sai</p>
                <p className="text-3xl font-bold text-red-600">{result.incorrectCount}</p>
              </div>
            </div>

            <div className="text-center space-y-2 border-t pt-6">
              <p className="text-sm text-muted-foreground">Độ chính xác</p>
              <p className="text-4xl font-bold">{result.accuracy}%</p>
            </div>

            <Button
              onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}
              className="w-full"
              size="lg"
            >
              Quay lại folder
            </Button>
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
  const options = currentQuestion.options || [];

  return (
    <div className="flex flex-col gap-6 min-h-[60vh]">
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
          {/* Restart button */}
          {(currentIndex > 0 || correctCount > 0 || incorrectCount > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await restartSession(folderId);
                  setSelectedOptionStore(null);
                } catch (error) {
                  console.error('Error restarting session:', error);
                }
              }}
              disabled={loading || submitting}
            >
              Bắt đầu lại
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-center">
        <div className="text-sm">
          <span className="text-muted-foreground">Đúng: </span>
          <span className="font-semibold text-green-600">{correctCount}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Sai: </span>
          <span className="font-semibold text-red-600">{incorrectCount}</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl">Trắc nghiệm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nghĩa của từ:</p>
            <p className="text-2xl font-semibold">{currentQuestion.question}</p>
          </div>

          {/* Options */}
          {!isAnswered ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? 'default' : 'outline'}
                  className="h-16 text-lg"
                  onClick={() => handleSelectOption(option)}
                  disabled={submitting || !!selectedOption}
                >
                  {submitting && selectedOption === option ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    option
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={isCorrect ? 'correct' : 'incorrect'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Result Icon */}
                <div className="flex items-center justify-center py-4">
                  {isCorrect ? (
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500" />
                  )}
                </div>

                {/* Correct Answer */}
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">Từ tiếng Anh:</p>
                  <p className="text-3xl font-bold">{currentQuestion.flashcard.name}</p>
                </div>

                {/* Show selected option if wrong */}
                {!isCorrect && selectedOption && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Bạn đã chọn:</p>
                    <p className="text-xl font-semibold text-red-600">{selectedOption}</p>
                  </div>
                )}

                {/* Audio Button */}
                {currentQuestion.flashcard.audio_url && (
                  <Button
                    variant="outline"
                    onClick={handlePlayAudio}
                    disabled={localIsPlayingAudio}
                    className="w-full"
                  >
                    {localIsPlayingAudio ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang phát...
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Phát âm thanh
                      </>
                    )}
                  </Button>
                )}

                {/* Usage Examples */}
                {currentQuestion.flashcard.usage && currentQuestion.flashcard.usage.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-semibold">Ví dụ sử dụng:</p>
                    <div className="space-y-2">
                      {currentQuestion.flashcard.usage.map((usage, index) => (
                        <div key={index} className="text-sm space-y-1 p-3 bg-muted rounded-md">
                          {usage.example && (
                            <p className="font-medium">"{usage.example}"</p>
                          )}
                          {usage.translate && (
                            <p className="text-muted-foreground">{usage.translate}</p>
                          )}
                          {usage.note && (
                            <p className="text-xs text-muted-foreground italic">{usage.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Button */}
                <Button
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                >
                  {isLastQuestion ? (
                    'Hoàn thành'
                  ) : (
                    <>
                      Câu tiếp
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

