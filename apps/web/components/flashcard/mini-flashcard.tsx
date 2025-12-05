'use client';

import { FlashcardResponse } from '@repo/types';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import FlashcardModal from './flashcard-modal';
import EditFlashcardModal from './edit-flashcard-modal';

interface MiniFlashcardProps {
  flashcard: FlashcardResponse;
  onDelete?: () => void;
  onEdit?: () => void;
}

const MiniFlashcard: React.FC<MiniFlashcardProps> = ({ flashcard, onDelete, onEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card 
        className="flex flex-col cursor-pointer hover:bg-orange-50 transition-all duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className='flex-1'>
            <CardTitle>
                <h2 className='text-xl font-bold'>{flashcard.name}</h2>
            </CardTitle>
              <CardDescription>{flashcard.meaning}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end items-center gap-2">
            <Badge>Đã học {flashcard.review_count} lần</Badge>
            {flashcard.is_remembered && (
              <div className="text-xs px-2 py-1 flex justify-center items-center bg-green-600 text-white font-bold rounded-2xl">Đã nhớ</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <FlashcardModal
        flashcard={flashcard}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDelete={onDelete}
        onEdit={handleEdit}
      />
      
      <EditFlashcardModal
        flashcard={flashcard}
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open && onEdit) {
            onEdit();
          }
        }}
        onSuccess={onEdit}
      />
    </>
  );
};

export default MiniFlashcard;