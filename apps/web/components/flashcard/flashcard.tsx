'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { FaVolumeLow } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { FlashcardResponse } from '@repo/types';
import useFlashcardStore from "@/store/flashcard.store";
import { playAudioWithFallback } from "@/lib/audio-utils";

type StudyAction = 
  | 'new_forgot'
  | 'new_good'
  | 'review_forgot'
  | 'review_hard'
  | 'review_normal'
  | 'review_easy';

interface FlashCardProps {
  flashcard: FlashcardResponse;
  isMock?: boolean;
  onStudyComplete?: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ flashcard, isMock = false, onStudyComplete }) => {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardResponse>(flashcard);
  const [submittingAction, setSubmittingAction] = useState<StudyAction | null>(null);
  const { handleStudyAction, studyLoading } = useFlashcardStore();

  // Update local state when flashcard prop changes
  React.useEffect(() => {
    setCurrentFlashcard(flashcard);
    setSubmittingAction(null); // Reset action when flashcard changes
  }, [flashcard]);

  const playWordSound = async () => {
    if (isMock || isPlayingWord) return;
    
    setIsPlayingWord(true);
    try {
      await playAudioWithFallback(
        currentFlashcard.name,
        currentFlashcard.audio_url || null,
        'en-US'
      );
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlayingWord(false);
    }
  };

  const handleStudyActionClick = async (action: StudyAction) => {
    if (isMock || studyLoading || submittingAction !== null) return;
    
    setSubmittingAction(action);
    
    try {
      await handleStudyAction(currentFlashcard.id, action);
      // Call callback to notify parent (study page) that action is complete
      // Parent will fetch the next flashcard and update the component
      if (onStudyComplete) {
        await onStudyComplete();
      } else {
        setSubmittingAction(null);
      }
    } catch (error) {
      console.error('Error handling study action:', error);
      setSubmittingAction(null);
    }
  };

  const usage = currentFlashcard.usage || [];

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.95, 
        y: -20,
        transition: {
          duration: 0.25,
          ease: [0.4, 0, 1, 1],
        }
      }}
    >
      <Card className="w-full rounded-2xl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="flashcard-content" className="border-0">
             <AccordionTrigger className="px-6 py-4 hover:no-underline">
               <div className="flex items-center justify-between w-full pr-4">
                 <div className="flex items-center gap-2">
                   <h2 className="text-3xl font-bold">{currentFlashcard.name}</h2>
                   <div
                     className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                     onClick={(e) => {
                       e.stopPropagation();
                       playWordSound();
                     }}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.stopPropagation();
                         e.preventDefault();
                         playWordSound();
                       }
                     }}
                     aria-label="Phát âm"
                   >
                     <FaVolumeLow className={isPlayingWord ? 'animate-pulse' : ''} />
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Badge>Đã học {currentFlashcard.review_count} lần</Badge>
                   {currentFlashcard.status === "new" && (
                     <Badge variant="secondary">Mới</Badge>
                   )}
                   {currentFlashcard.status === "review" && (
                     <Badge variant="secondary">Ôn tập</Badge>
                   )}
                   {currentFlashcard.lapseCount > 0 && (
                     <Badge variant="destructive">Quên {currentFlashcard.lapseCount} lần</Badge>
                   )}
                 </div>
               </div>
             </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex flex-col gap-4">
                {/* Nghĩa */}
                <div className="text-center py-2 border-b">
                  <p className="text-base text-muted-foreground">{currentFlashcard.meaning}</p>
                </div>
                
                {/* Nội dung scroll được */}
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="w-full flex flex-col gap-4 items-center justify-center py-4">
                    {usage.length > 0 && (
                      <div className="w-full space-y-2">
                        {usage.map((item, index) => (
                          <div key={index} className="w-full">
                            {item.note && (
                              <h3 className="text-lg font-semibold">{item.note}</h3>
                            )}
                            {item.example && (
                              <p className="mt-2 italic">"{item.example}"</p>
                            )}
                            {item.translate && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.translate}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {currentFlashcard.tags && currentFlashcard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {currentFlashcard.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer với buttons */}
                <div className="flex justify-center pt-4 border-t">
                  <ButtonGroup>
                    {currentFlashcard.status === "new" ? (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => handleStudyActionClick('new_forgot')}
                          disabled={studyLoading || isMock || submittingAction !== null}
                        >
                          {submittingAction === 'new_forgot' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Chưa nhớ'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStudyActionClick('new_good')}
                          disabled={studyLoading || isMock || submittingAction !== null}
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950"
                        >
                          {submittingAction === 'new_good' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Đã nhớ'
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => handleStudyActionClick('review_forgot')}
                          disabled={studyLoading || isMock || submittingAction !== null}
                        >
                          {submittingAction === 'review_forgot' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Quên'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStudyActionClick('review_hard')}
                          disabled={studyLoading || isMock || submittingAction !== null}
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-950"
                        >
                          {submittingAction === 'review_hard' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Khó'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStudyActionClick('review_normal')}
                          disabled={studyLoading || isMock || submittingAction !== null}
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:border-yellow-500 dark:text-yellow-500 dark:hover:bg-yellow-950"
                        >
                          {submittingAction === 'review_normal' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Bình thường'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStudyActionClick('review_easy')}
                          disabled={studyLoading || isMock || submittingAction !== null}
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950"
                        >
                          {submittingAction === 'review_easy' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Dễ'
                          )}
                        </Button>
                      </>
                    )}
                  </ButtonGroup>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </motion.div>
  );
};

export default FlashCard;
