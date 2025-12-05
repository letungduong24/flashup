'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import useFolderStore from '@/store/folder.store';
import { ArrowLeft } from 'lucide-react';
import { BsCardText } from 'react-icons/bs';
import MiniFlashcard from '@/components/flashcard/mini-flashcard';
import { FaPlus } from 'react-icons/fa';
import { ButtonGroup } from '@/components/ui/button-group';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import CreateFlashcardModal from '@/components/flashcard/create-flashcard-modal';
import useFlashcardStore from '@/store/flashcard.store';

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;
  const { currentFolder, loading, getFolder, removeFlashcardFromCurrentFolder } = useFolderStore();
  const { fetchFlashcards } = useFlashcardStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (folderId) {
      getFolder(folderId);
      fetchFlashcards(folderId);
    }
  }, [folderId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/flashcard')}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex justify-center items-center py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BsCardText />
              </EmptyMedia>
              <EmptyTitle>Không tìm thấy folder</EmptyTitle>
              <EmptyDescription>Folder không tồn tại hoặc bạn không có quyền truy cập.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => router.push('/dashboard/flashcard')}>
                Quay lại danh sách
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  const flashcards = currentFolder.flashcards || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/dashboard/flashcard')}
          className="w-fit"
        >
          <ArrowLeft />
        </Button>
        <div className="flex-1 flex justify-between items-center gap-4 min-w-0">
          <h1 className="text-xl font-bold truncate min-w-0">{currentFolder.name}</h1>
          <ButtonGroup className="flex-shrink-0">
            <Button variant={'outline'}><FaEdit /></Button>
            <Button variant={'outline'}><MdDelete /></Button>
          </ButtonGroup>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={() => setIsCreateModalOpen(true)}><FaPlus /><p className='hidden sm:block'>Tạo Flashcard</p></Button>
        
      </div>

      {flashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {flashcards.map((flashcard) => (
            <MiniFlashcard 
              key={flashcard.id} 
              flashcard={flashcard}
              onDelete={() => {
                // Xóa flashcard khỏi currentFolder bằng set spread
                removeFlashcardFromCurrentFolder(flashcard.id);
              }}
              onEdit={() => {
                // Refresh folder sau khi sửa flashcard
                if (folderId) {
                  getFolder(folderId);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BsCardText />
              </EmptyMedia>
              <EmptyTitle>Chưa có flashcard</EmptyTitle>
              <EmptyDescription>Folder này chưa có flashcard nào. Hãy thêm flashcard để bắt đầu học.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsCreateModalOpen(true)}>Thêm flashcard</Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
      
      <CreateFlashcardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        folderId={folderId}
        onSuccess={() => {
          // Chỉ refresh khi tạo thành công
          if (folderId) {
            getFolder(folderId);
            fetchFlashcards(folderId);
          }
        }}
      />
    </div>
  );
}

