import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FolderRequest, folderResponseSchema } from '@repo/types';
import { GeminiService } from '../gemini/gemini.service';
import { getCambridgeUsVoice } from '../utils/cambridge.util';
import { Prisma } from '../generated/client';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async create(userId: string, folderRequest: FolderRequest) {
    return this.prisma.folder.create({
      data: {
        ...folderRequest,
        user_id: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.folder.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        flashcards: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (folder.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập folder này');
    }

    return folder
  }

  async update(userId: string, id: string, folderRequest: FolderRequest) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (folder.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật folder này');
    }

    const updatedFolder = await this.prisma.folder.update({
      where: { id },
      data: folderRequest,
    });

    return updatedFolder;
  }

  async remove(userId: string, id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (folder.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa folder này');
    }

    await this.prisma.folder.delete({
      where: { id },
    });

    return { message: 'Xóa folder thành công' };
  }

  async generateFolderWithFlashcards(userId: string, folderName: string) {
    // Generate folder and flashcards using AI
    const generated = await this.geminiService.generateFolderWithFlashcards(folderName);

    // Create folder
    const folder = await this.prisma.folder.create({
      data: {
        name: generated.folderName,
        description: generated.folderDescription,
        user_id: userId,
      },
    });

    // Create flashcards with audio URLs
    const flashcards = await Promise.all(
      generated.flashcards.map(async (flashcardData) => {
        // Fetch audio URL from Cambridge
        let audioUrl: string | null = null;
        try {
          const result = await getCambridgeUsVoice(flashcardData.name);
          audioUrl = result.audioUrl;
        } catch (error) {
          console.error(`Error fetching Cambridge voice for "${flashcardData.name}":`, error);
        }

        return this.prisma.flashcard.create({
          data: {
            name: flashcardData.name,
            meaning: flashcardData.meaning,
            folder_id: folder.id,
            audio_url: audioUrl,
            usage: flashcardData.usage === null ? Prisma.JsonNull : flashcardData.usage,
            tags: flashcardData.tags || [],
            review_count: 0,
            is_remembered: false,
          },
        });
      })
    );

    // Return folder with flashcards
    return {
      ...folder,
      flashcards,
    };
  }
}
