'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FolderResponse } from '@repo/types';

interface FolderProps {
  folder: FolderResponse;
  status?: string;
}

const Folder: React.FC<FolderProps> = ({ folder, status = 'Chưa hoàn thành' }) => {
  const router = useRouter();

  const handleStudy = () => {
    router.push(`/dashboard/flashcard/folder/${folder.id}`);
  };

  return (
    <Card onClick={handleStudy} className='flex flex-col cursor-pointer hover:bg-orange-50 transition-all duration-300'>
        <CardHeader className='flex-1'>
            <CardTitle>
                <h2 className='text-xl font-bold'>{folder.name}</h2>
            </CardTitle>
            <CardDescription className=''>{folder.description || 'Không có mô tả'}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end items-center">
                <Badge>{status}</Badge>
            </div>
        </CardContent>
        
    </Card>
  );
};

export default Folder;