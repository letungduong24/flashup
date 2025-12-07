import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FlashcardRequest } from '@repo/types';
import { Prisma } from '../generated/client';
import { getCambridgeUsVoice } from '../utils/cambridge.util';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class FlashcardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async create(userId: string, folderId: string | null, flashcardRequest: FlashcardRequest) {
    // If folder_id is provided, verify ownership
    if (flashcardRequest.folder_id) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: flashcardRequest.folder_id },
      });

      if (!folder) {
        throw new NotFoundException('Folder không tồn tại');
      }

      if (folder.user_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền thêm flashcard vào folder này');
      }
    }

    // Tự động lấy audio_url từ Cambridge nếu không được cung cấp
    let audioUrl = flashcardRequest.audio_url;
    if (!audioUrl && flashcardRequest.name) {
      try {
        const result = await getCambridgeUsVoice(flashcardRequest.name);
        audioUrl = result.audioUrl;
      } catch (error) {
        console.error(`Error fetching Cambridge voice for "${flashcardRequest.name}":`, error);
      }
    }

    return this.prisma.flashcard.create({
      data: {
        name: flashcardRequest.name,
        meaning: flashcardRequest.meaning,
        folder_id: flashcardRequest.folder_id || null,
        review_count: flashcardRequest.review_count ?? 0,
        audio_url: audioUrl ?? null,
        usage: flashcardRequest.usage === null ? Prisma.JsonNull : flashcardRequest.usage,
        status: flashcardRequest.status ?? 'new',
        interval: flashcardRequest.interval ?? 0,
        nextReview: flashcardRequest.nextReview || null,
        easeFactor: flashcardRequest.easeFactor ?? 2.5,
        lapseCount: flashcardRequest.lapseCount ?? 0,
        tags: flashcardRequest.tags ?? [],
      },
    });
  }

  async findAll(
    userId: string,
    options: {
      folderId?: string;
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: 'name' | 'createdAt' | 'review_count';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      folderId,
      page = 1,
      limit = 12,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};

    if (folderId) {
      // Verify folder ownership
      const folder = await this.prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        throw new NotFoundException('Folder không tồn tại');
      }

      if (folder.user_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền truy cập folder này');
      }

      where.folder_id = folderId;
    } else {
      // Get all flashcards from user's folders
      const userFolders = await this.prisma.folder.findMany({
        where: { user_id: userId },
        select: { id: true },
      });

      const folderIds = userFolders.map((f) => f.id);
      where.folder_id = { in: folderIds };
    }

    // Search filter
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { meaning: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.flashcard.count({ where });

    // Get paginated data
    const data = await this.prisma.flashcard.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + data.length < total,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        folder: true,
      },
    });

    if (!flashcard) {
      throw new NotFoundException('Flashcard không tồn tại');
    }

    // If flashcard belongs to a folder, verify ownership
    if (flashcard.folder_id && flashcard.folder) {
      if (flashcard.folder.user_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền truy cập flashcard này');
      }
    }

    return flashcard;
  }

  async update(userId: string, id: string, flashcardRequest: FlashcardRequest) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        folder: true,
      },
    });

    if (!flashcard) {
      throw new NotFoundException('Flashcard không tồn tại');
    }

    // Verify ownership
    if (flashcard.folder_id && flashcard.folder) {
      if (flashcard.folder.user_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền cập nhật flashcard này');
      }
    }

    // If updating folder_id, verify new folder ownership
    if (flashcardRequest.folder_id && flashcardRequest.folder_id !== flashcard.folder_id) {
      const newFolder = await this.prisma.folder.findUnique({
        where: { id: flashcardRequest.folder_id },
      });

      if (!newFolder) {
        throw new NotFoundException('Folder không tồn tại');
      }

      if (newFolder.user_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền di chuyển flashcard vào folder này');
      }
    }

    // Auto-fetch audio URL if name changed and audio_url not provided
    let audioUrl: string | null | undefined = flashcardRequest.audio_url;
    if (!audioUrl && flashcardRequest.name && flashcardRequest.name !== flashcard.name) {
      try {
        const result = await getCambridgeUsVoice(flashcardRequest.name);
        // Luôn update audioUrl: có audio thì dùng, không có thì set null
        audioUrl = result.audioUrl || null;
      } catch (error) {
        console.error(`Error fetching Cambridge voice for "${flashcardRequest.name}":`, error);
        // Nếu lỗi, set null để update thành không có url
        audioUrl = null;
      }
    }

    const updateData: any = {
      name: flashcardRequest.name,
      meaning: flashcardRequest.meaning,
      tags: flashcardRequest.tags,
    };

    if (flashcardRequest.review_count !== undefined) {
      updateData.review_count = flashcardRequest.review_count;
    }
    // Update audio_url if provided or fetched
    if (audioUrl !== undefined) {
      updateData.audio_url = audioUrl ?? null;
    }
    if (flashcardRequest.usage !== undefined) {
      updateData.usage = flashcardRequest.usage === null ? Prisma.JsonNull : flashcardRequest.usage;
    }
    if (flashcardRequest.folder_id !== undefined) {
      updateData.folder_id = flashcardRequest.folder_id || null;
    }
    if (flashcardRequest.status !== undefined) {
      updateData.status = flashcardRequest.status;
    }
    if (flashcardRequest.interval !== undefined) {
      updateData.interval = flashcardRequest.interval;
    }
    if (flashcardRequest.nextReview !== undefined) {
      updateData.nextReview = flashcardRequest.nextReview || null;
    }
    if (flashcardRequest.easeFactor !== undefined) {
      updateData.easeFactor = flashcardRequest.easeFactor;
    }
    if (flashcardRequest.lapseCount !== undefined) {
      updateData.lapseCount = flashcardRequest.lapseCount;
    }

    const updatedFlashcard = await this.prisma.flashcard.update({
      where: { id },
      data: updateData,
    });

    return updatedFlashcard;
  }

  async checkAudioAvailability(word: string) {
    const result = await getCambridgeUsVoice(word);
    return {
      word,
      hasAudio: !!result.audioUrl,
      wordExists: result.wordExists,
      audioUrl: result.audioUrl || null,
    };
  }

  async generateFlashcard(word: string, folderId?: string | null) {
    // Generate flashcard content from Gemini
    const generated = await this.geminiService.generateFlashcardFromWord(word);

    // Get audio URL from Cambridge
    let audioUrl: string | null = null;
    try {
      const result = await getCambridgeUsVoice(word);
      audioUrl = result.audioUrl;
    } catch (error) {
      console.error(`Error fetching Cambridge voice for "${word}":`, error);
    }

    // Return generated flashcard data (not saved yet)
    return {
      name: generated.name,
      meaning: generated.meaning,
      folder_id: folderId || undefined,
      usage: generated.usage,
      tags: generated.tags,
      audio_url: audioUrl,
      status: 'new',
      interval: 0,
      easeFactor: 2.5,
      lapseCount: 0,
    } as FlashcardRequest;
  }

  async remove(userId: string, id: string) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        folder: true,
      },
    });

    if (!flashcard) {
      throw new NotFoundException('Flashcard không tồn tại');
    }

    // Verify ownership
    if (flashcard.folder_id && flashcard.folder) {
      if (flashcard.folder.user_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền xóa flashcard này');
      }
    }

    await this.prisma.flashcard.delete({
      where: { id },
    });

    return { message: 'Xóa flashcard thành công' };
  }
}
