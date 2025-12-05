'use client';

import React, { useState } from "react";
import { FlashcardResponse } from '@repo/types';
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
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ 
  flashcard, 
  open, 
  onOpenChange,
  onEdit,
  onDelete
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
      is_remembered: flashcard.is_remembered,
      tags: flashcard.tags,
      review_count: 0,
    });
  };

  if (!flashcard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4" showCloseButton={false}>
        <DialogHeader>
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
        
        <Card className="w-full rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-center">{flashcard.meaning}</h2>
          </div>
          
          {flashcard.usage && flashcard.usage.length > 0 && (
            <div className="w-full space-y-4">
              {flashcard.usage.map((usage, index) => (
                <div key={index} className="mt-4 w-full">
                  {usage.note && (
                    <h3 className="text-xl font-semibold">{usage.note}</h3>
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
          
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="text-sm text-muted-foreground">
              Đã học {flashcard.review_count} lần
            </div>
            {flashcard.is_remembered && (
              <div className="text-xs px-2 py-1 flex justify-center items-center bg-green-600 text-white font-bold rounded-2xl">
                Đã nhớ
              </div>
            )}
          </div>
          
          {flashcard.tags && flashcard.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
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
        </Card>

        <div className="flex justify-center mt-2">
          <ButtonGroup>
            <Button 
              variant="outline" 
              onClick={handleEdit}
              disabled={updateLoading || deleteLoading}
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
              disabled={updateLoading || deleteLoading}
            >
              <MdDelete />
              Xóa
            </Button>
          </ButtonGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardModal;

