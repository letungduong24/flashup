'use client';

import Folder from '@/components/flashcard/folder';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import useFolderStore from '@/store/folder.store';
import { useEffect, useState } from 'react';
import { BsFolder } from "react-icons/bs";
import { PiStarFour } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { Progress } from "@/components/ui/progress"
import { ButtonGroup } from '@/components/ui/button-group';
import CreateFolderModal from '@/components/flashcard/create-folder-modal';
import AIAssistantModal from '@/components/flashcard/ai-assistant-modal';

export default function FlashcardPage() {
  const { folders, loading, fetchFolders } = useFolderStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Học Flashcard</h1>
          <ButtonGroup>
            <Button variant={'secondary'}><IoMdSearch />Khám phá</Button>
            <Button onClick={() => setIsCreateModalOpen(true)}><FaPlus /><p className='hidden sm:block'>Tạo bộ sưu tập</p></Button>
          </ButtonGroup>
      </div>
      <div className='grid md:grid-cols-[1fr_3fr] lg:grid-cols-[1fr_4fr] flex-1 gap-4'>
        <div className="flex md:flex-col gap-2">
          <div 
            className="group cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br w-full from-orange-300 to-orange-500 p-3 rounded-2xl flex flex-col justify-center items-start"
            onClick={() => setIsAIModalOpen(true)}
          >
            <div className="flex justify-start">
              <PiStarFour className='group-hover:scale-140 group-hover:rotate-180 transition-all duration-300 text-xl font-bold text-white'/>
            </div>
            <div className="flex flex-col items-end w-full">
              <h1 className='font-bold text-white text-xl'>Trợ lý AI</h1>
              <p className='text-xs text-white'>Tạo bộ sưu tập với AI</p>
            </div>
          </div>

          <div className="w-full border-2 border-orange-300 p-3 rounded-2xl flex flex-col justify-center items-start">
            <div className="flex flex-col items-end w-full gap-2">
              <h1 className='font-bold text-xl'>Tiến độ</h1>
              <Progress value={33} />
              <div className="flex justify-between w-full">
                <div className="">
                  <h1 className='text-sm font-bold'>Đã học</h1>
                  <p className='text-xs font-medium'>70</p>
                </div>
                <div className="">
                  <h1 className='text-sm font-bold'>Flashcard</h1>
                  <p className='text-xs font-medium'>250</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : folders && folders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <Folder
                  key={folder.id}
                  folder={folder}
                  status="Chưa hoàn thành"
                />
              ))}
            </div>
          ) : (
            <div className="w-full flex justify-center items-center py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BsFolder />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có folder</EmptyTitle>
                  <EmptyDescription>Bạn chưa có bộ sưu tập Flashcard nào. Hãy tạo bộ sưu tập mới để bắt đầu học.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setIsCreateModalOpen(true)}>Tạo folder mới</Button>
                </EmptyContent>
              </Empty>
            </div>
          )}

        </div>
      </div>
      
      <CreateFolderModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <AIAssistantModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />
    </div>
  );
}

