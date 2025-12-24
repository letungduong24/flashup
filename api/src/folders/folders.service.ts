import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { getCambridgeUsVoice } from '../utils/cambridge.util';
import { Prisma } from '../generated/client';
import { FolderRequestDto } from './dto/folder-request.dto';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) { }

  async create(userId: string, folderRequest: FolderRequestDto) {
    const folder = await this.prisma.folder.create({
      data: {
        ...folderRequest,
        user_id: userId,
      },
    });

    // New folder has 0 new and review cards
    return {
      ...folder,
      newCount: 0,
      reviewCount: 0,
    };
  }

  /**
   * Calculate newCount and reviewCount for a folder
   */
  private async getFolderStatistics(folderId: string) {
    const now = new Date();

    // Count new cards
    const newCount = await this.prisma.flashcard.count({
      where: {
        folder_id: folderId,
        status: 'new',
      },
    });

    // Count review cards that need to be studied (nextReview <= now)
    const reviewCount = await this.prisma.flashcard.count({
      where: {
        folder_id: folderId,
        status: 'review',
        nextReview: {
          lte: now,
          not: null,
        },
      },
    });

    return { newCount, reviewCount };
  }

  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: 'name' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      page = 1,
      limit = 12,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {
      user_id: userId,
    };

    // Search filter
    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.folder.count({ where });

    // Get paginated data
    const folders = await this.prisma.folder.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Calculate statistics for each folder
    const data = await Promise.all(
      folders.map(async (folder) => {
        const { newCount, reviewCount } = await this.getFolderStatistics(folder.id);
        return {
          ...folder,
          newCount,
          reviewCount,
        };
      })
    );

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

    // Calculate statistics
    const { newCount, reviewCount } = await this.getFolderStatistics(id);

    return {
      ...folder,
      newCount,
      reviewCount,
    };
  }

  async update(userId: string, id: string, folderRequest: FolderRequestDto) {
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
      data: {
        ...folderRequest,
        version: { increment: 1 },
      },
    });

    // Calculate statistics
    const { newCount, reviewCount } = await this.getFolderStatistics(id);

    return {
      ...updatedFolder,
      newCount,
      reviewCount,
    };
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
            status: 'new',
            interval: 0,
            easeFactor: 2.5,
            lapseCount: 0,
          },
        });
      })
    );

    // Return folder with flashcards and statistics
    // All newly created flashcards have status 'new'
    return {
      ...folder,
      flashcards,
      newCount: flashcards.length,
      reviewCount: 0,
    };
  }

  async findPublic(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: 'name' | 'createdAt' | 'saves';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      page = 1,
      limit = 12,
      search,
      sortBy = 'saves',
      sortOrder = 'desc',
    } = options;

    const where: any = {
      isPublic: true,
    };

    // Search filter
    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.folder.count({ where });

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'saves') {
      orderBy.saves = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get paginated data
    const folders = await this.prisma.folder.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate statistics for each folder
    const data = await Promise.all(
      folders.map(async (folder) => {
        const { newCount, reviewCount } = await this.getFolderStatistics(folder.id);
        return {
          ...folder,
          newCount,
          reviewCount,
        };
      })
    );

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

  async togglePublic(userId: string, id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (folder.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái chia sẻ folder này');
    }

    const updatedFolder = await this.prisma.folder.update({
      where: { id },
      data: {
        isPublic: !folder.isPublic,
      },
    });

    // Calculate statistics
    const { newCount, reviewCount } = await this.getFolderStatistics(id);

    return {
      ...updatedFolder,
      newCount,
      reviewCount,
    };
  }

  async findOnePublic(id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        flashcards: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (!folder.isPublic) {
      throw new ForbiddenException('Folder này không được chia sẻ công khai');
    }

    // Calculate statistics
    const { newCount, reviewCount } = await this.getFolderStatistics(id);

    return {
      ...folder,
      newCount,
      reviewCount,
    };
  }

  async savePublicFolder(userId: string, publicFolderId: string) {
    // Get the public folder with flashcards
    const publicFolder = await this.prisma.folder.findUnique({
      where: { id: publicFolderId },
      include: {
        flashcards: true,
      },
    });

    if (!publicFolder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (!publicFolder.isPublic) {
      throw new ForbiddenException('Folder này không được chia sẻ công khai');
    }

    // Create new folder for the user
    const newFolder = await this.prisma.folder.create({
      data: {
        name: publicFolder.name,
        description: publicFolder.description,
        user_id: userId,
        isPublic: false,
        saves: 0,
      },
    });

    // Copy all flashcards
    if (publicFolder.flashcards && publicFolder.flashcards.length > 0) {
      await this.prisma.flashcard.createMany({
        data: publicFolder.flashcards.map((flashcard) => ({
          name: flashcard.name,
          meaning: flashcard.meaning,
          folder_id: newFolder.id,
          review_count: 0,
          audio_url: flashcard.audio_url,
          usage: flashcard.usage === null ? Prisma.JsonNull : (flashcard.usage as Prisma.InputJsonValue),
          status: 'new',
          interval: 0,
          easeFactor: 2.5,
          lapseCount: 0,
          tags: flashcard.tags,
        })),
      });
    }

    // Increment saves count of the public folder
    await this.prisma.folder.update({
      where: { id: publicFolderId },
      data: {
        saves: {
          increment: 1,
        },
      },
    });

    // Calculate statistics for the new folder
    const { newCount, reviewCount } = await this.getFolderStatistics(newFolder.id);

    return {
      ...newFolder,
      newCount,
      reviewCount,
    };
  }
}
