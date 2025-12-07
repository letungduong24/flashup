'use client';

import { FlashcardResponse } from '@repo/types';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={{ 
          scale: 1.02,
          y: -4,
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      >
      <Card 
          className="flex flex-col h-full cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className='flex-1'>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
            <CardTitle>
                <h2 className='text-xl font-bold'>{flashcard.name}</h2>
            </CardTitle>
              <CardDescription>{flashcard.meaning}</CardDescription>
            </motion.div>
        </CardHeader>
        <CardContent>
            <motion.div 
              className="flex flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {flashcard.status === "review" && flashcard.nextReview && (
                <motion.div 
                  className="italic text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  Lần ôn tập tiếp theo: {new Date(flashcard.nextReview).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </motion.div>
              )}
              <motion.div 
                className="flex justify-end items-center gap-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <Badge>Đã học {flashcard.review_count} lần</Badge>
                <div className="text-xs px-2 py-1 flex justify-center items-center bg-blue-600 text-white font-bold rounded-2xl">
                  {flashcard.status === "new" ? "Mới" : "Ôn tập"}
                </div>
                {flashcard.lapseCount > 0 && (
                  <motion.div 
                    className="text-xs px-2 py-1 flex justify-center items-center bg-red-600 text-white font-bold rounded-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20, 
                      delay: 0.4 
                    }}
                  >
                    Quên {flashcard.lapseCount} lần
                  </motion.div>
            )}
              </motion.div>
            </motion.div>
        </CardContent>
      </Card>
      </motion.div>
      
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