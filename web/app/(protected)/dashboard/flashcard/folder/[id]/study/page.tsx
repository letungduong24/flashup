'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import FlashCard from '@/components/flashcard/flashcard';
import useFlashcardStore from '@/store/flashcard.store';
import { FlashcardResponse } from '@/types/flashcard';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;
  const { getNextFlashcardToStudy, studyLoading, studyStatistics } = useFlashcardStore();
  
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch next flashcard to study
  const fetchNextFlashcard = async () => {
    setLoading(true);
    try {
      const flashcard = await getNextFlashcardToStudy(folderId);
      setCurrentFlashcard(flashcard);
    } catch (error) {
      console.error('Error fetching next flashcard:', error);
      setCurrentFlashcard(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial flashcard
  useEffect(() => {
    if (folderId) {
      fetchNextFlashcard();
    }
  }, [folderId]);

  // Callback khi học xong một flashcard
  const handleStudyComplete = async () => {
    try {
      await fetchNextFlashcard();
    } catch (error) {
      console.error('Error fetching next flashcard after study:', error);
    }
  };

  if (loading || (studyLoading && !currentFlashcard)) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!loading && !currentFlashcard && !studyLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex justify-center items-center py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>Không có flashcard cần học</EmptyTitle>
              <EmptyDescription>
                Tất cả flashcard đã được học hoặc chưa đến thời gian ôn tập.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}>
                Quay lại folder
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}`)}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-xl font-bold">Chế độ học</h1>
            <p className="text-sm text-muted-foreground">
              {currentFlashcard?.status === "new" ? "Thẻ mới" : "Ôn tập"}
            </p>
            {studyStatistics && (
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-muted-foreground">
                  Cần ôn tập: <span className="font-semibold text-foreground">{studyStatistics.reviewCount}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Từ mới: <span className="font-semibold text-foreground">{studyStatistics.newCount}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={fetchNextFlashcard} disabled={studyLoading || loading}>
          <Loader2 className={`mr-2 h-4 w-4 ${(studyLoading || loading) ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {currentFlashcard ? (
              <FlashCard 
                key={currentFlashcard.id}
                flashcard={currentFlashcard}
                isMock={false}
                onStudyComplete={handleStudyComplete}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
