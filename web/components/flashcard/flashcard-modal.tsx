'use client';

import React, { useState } from "react";
import { FlashcardResponse } from '@/types/flashcard';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import { FaVolumeLow } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import useFlashcardStore from "@/store/flashcard.store";
import { playAudioWithFallback } from "@/lib/audio-utils";

interface FlashcardModalProps {
  flashcard: FlashcardResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (flashcard: FlashcardResponse) => void;
  onDelete?: () => void;
  previewMode?: boolean;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({
  flashcard,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  previewMode = false
}) => {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const { updateFlashcard, deleteFlashcard, updateLoading, deleteLoading } = useFlashcardStore();

  const playWordSound = async () => {
    if (!flashcard || isPlayingWord) return;

    setIsPlayingWord(true);
    try {
      await playAudioWithFallback(
        flashcard.name,
        flashcard.audio_url || null,
        'en-US'
      );
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlayingWord(false);
    }
  };

  const handleEdit = () => {
    if (flashcard && onEdit) {
      onEdit(flashcard);
    }
  };

  const handleDelete = async () => {
    if (!flashcard) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa flashcard này?')) {
      await deleteFlashcard(flashcard.id);
      onOpenChange(false);
      if (onDelete) {
        onDelete();
      }
    }
  };

  const handleResetReviewCount = async () => {
    if (!flashcard) return;

    await updateFlashcard(flashcard.id, {
      name: flashcard.name,
      meaning: flashcard.meaning,
      folder_id: flashcard.folder_id || undefined,
      audio_url: flashcard.audio_url || undefined,
      usage: flashcard.usage || undefined,
      tags: flashcard.tags,
      review_count: 0,
      interval: 0,
      easeFactor: 2.5,
      lapseCount: 0,
      status: "new",
      nextReview: null,
    });
  };

  if (!flashcard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(42rem,calc(100%-2rem))] max-h-[85vh] flex flex-col overflow-hidden" showCloseButton={false}>
        {/* Header cố định */}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <DialogTitle className="text-2xl font-bold text-center">
              {flashcard.name}
            </DialogTitle>
            <Button
              variant="ghost"
              onClick={playWordSound}
              disabled={isPlayingWord}
            >
              <FaVolumeLow className={isPlayingWord ? 'animate-pulse' : ''} />
            </Button>
          </div>
        </DialogHeader>

        {/* Nghĩa - cố định */}
        <div className="flex-shrink-0 text-center py-2 border-b">
          <p className="text-base text-muted-foreground">{flashcard.meaning}</p>
        </div>

        {/* Nội dung scroll được */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full flex flex-col gap-4 items-center justify-center border-0 ">
            {flashcard.usage && flashcard.usage.length > 0 && (
              <div className="w-full space-y-2">
                {flashcard.usage.map((usage, index) => (
                  <div key={index} className="w-full">
                    {usage.note && (
                      <h3 className="text-lg font-semibold">{usage.note}</h3>
                    )}
                    {usage.example && (
                      <p className="mt-2 italic">"{usage.example}"</p>
                    )}
                    {usage.translate && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {usage.translate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!previewMode && (
              <div className="flex items-center justify-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Đã học {flashcard.review_count} lần
                </div>
                <div className="text-xs px-2 py-1 flex justify-center items-center bg-blue-600 text-white font-bold rounded-2xl">
                  {flashcard.status === "new" ? "Mới" : "Ôn tập"}
                </div>
                {(flashcard.lapseCount ?? 0) > 0 && (
                  <div className="text-xs px-2 py-1 flex justify-center items-center bg-red-600 text-white font-bold rounded-2xl">
                    Quên {flashcard.lapseCount ?? 0} lần
                  </div>
                )}
              </div>
            )}

            {flashcard.tags && flashcard.tags.length > 0 && (
              <div className=" flex flex-wrap gap-2 justify-center">
                {flashcard.tags.map((tag, index) => (
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

        {/* Footer cố định */}
        {!previewMode && (
          <div className="flex-shrink-0 flex justify-center pt-4 border-t">
            <ButtonGroup>
              <Button
                variant="outline"
                onClick={handleEdit}
                disabled={updateLoading || deleteLoading || !onEdit}
              >
                <FaEdit />
                Sửa
              </Button>
              <Button
                variant="outline"
                onClick={handleResetReviewCount}
                disabled={updateLoading || deleteLoading}
              >
                <RotateCcw />
                Reset lần học
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={updateLoading || deleteLoading || !onDelete}
              >
                <MdDelete />
                Xóa
              </Button>
            </ButtonGroup>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardModal;

