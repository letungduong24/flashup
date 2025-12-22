'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FolderResponse } from '@repo/types';

interface FolderProps {
  folder: FolderResponse;
  isSummaryMode?: boolean;
  mode?: 'review' | 'new';
  isExplore?: boolean;
}

const Folder: React.FC<FolderProps> = ({ folder, isSummaryMode = false, mode, isExplore = false }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleStudy = () => {
    if (isExplore || pathname?.includes('/explore')) {
      router.push(`/dashboard/explore/folder/${folder.id}`);
    } else {
      router.push(`/dashboard/flashcard/folder/${folder.id}`);
    }
  };

  return (
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
      {isSummaryMode ? (
        <div 
          onClick={handleStudy} 
          className='flex flex-col h-full cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all duration-300 hover:shadow-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-900 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 shadow-sm dark:shadow-[0_2px_8px_0_rgb(255_255_255_/_0.15),0_1px_4px_-1px_rgb(255_255_255_/_0.1)] gap-6 py-6'
        >
          <div className='flex-1 px-6'>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className='gap-2 flex flex-col'
            >
              <h3 className='leading-none font-semibold'>
                {mode === 'review' ? 'Flashbook sắp tới hạn review' : 'Học từ mới'}
              </h3>
              <h2 className='text-xl font-bold'>{folder.name}</h2>
              <p className='text-sm text-muted-foreground'>{folder.description || 'Không có mô tả'}</p>
            </motion.div>
          </div>
          <div className='px-6'>
            <motion.div 
              className="flex justify-end items-center gap-2 flex-wrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              {!isExplore && (
                <>
                  <Badge variant="default">
                    {folder.newCount} từ mới
                  </Badge>
                  <Badge variant="secondary">
                    {folder.reviewCount} cần review
                  </Badge>
                </>
              )}
              {folder.saves !== undefined && folder.saves > 0 && (
                <Badge variant="outline">
                  {folder.saves} lượt lưu
                </Badge>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        <Card 
          onClick={handleStudy} 
          className='flex flex-col h-full cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900'
        >
          <CardHeader className='flex-1'>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <CardTitle>
                <h2 className='text-xl font-bold'>{folder.name}</h2>
              </CardTitle>
              <CardDescription className=''>{folder.description || 'Không có mô tả'}</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex justify-end items-center gap-2 flex-wrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              {!isExplore && (
                <>
                  <Badge variant="default">
                    {folder.newCount} từ mới
                  </Badge>
                  <Badge variant="secondary">
                    {folder.reviewCount} cần review
                  </Badge>
                </>
              )}
              {folder.saves !== undefined && folder.saves > 0 && (
                <Badge variant="outline">
                  {folder.saves} lượt lưu
                </Badge>
              )}
            </motion.div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default Folder;