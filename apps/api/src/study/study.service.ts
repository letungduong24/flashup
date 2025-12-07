import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum StudyAction {
  NEW_FORGOT = 'new_forgot',
  NEW_GOOD = 'new_good',
  REVIEW_FORGOT = 'review_forgot',
  REVIEW_HARD = 'review_hard',
  REVIEW_NORMAL = 'review_normal',
  REVIEW_EASY = 'review_easy',
}

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get end of today (23:59:59.999)
   */
  private getEndOfToday(): Date {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }

  /**
   * Get current time + 5 hours
   */
  private getNowPlus5Hours(): Date {
    const now = new Date();
    now.setHours(now.getHours() + 5);
    return now;
  }

  /**
   * Get current time
   */
  private getNow(): Date {
    return new Date();
  }

  /**
   * Calculate next review date based on interval (in days)
   */
  private calculateNextReview(interval: number): Date {
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.round(interval));
    nextReview.setHours(23, 59, 59, 999);
    return nextReview;
  }

  /**
   * Get study statistics (count of review cards and new cards)
   */
  async getStudyStatistics(userId: string, folderId?: string) {
    const now = new Date();
    
    // Build base where clause for folder/user filtering
    let whereClause: any = {
      folder: {
        user_id: userId,
      },
    };
    
    if (folderId) {
      whereClause.folder_id = folderId;
    }

    // Count review cards that need to be studied (nextReview <= now)
    const reviewCount = await this.prisma.flashcard.count({
      where: {
        ...whereClause,
        status: 'review',
        nextReview: {
          lte: now,
          not: null,
        },
      },
    });

    // Count new cards
    const newCount = await this.prisma.flashcard.count({
      where: {
        ...whereClause,
        status: 'new',
      },
    });

    return {
      reviewCount,
      newCount,
    };
  }

  /**
   * Get summary statistics for dashboard
   * Returns total flashcards, folders, new words, and review words
   */
  async getSummaryStatistics(userId: string) {
    const now = new Date();

    // Get all user's folders
    const folders = await this.prisma.folder.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    const folderIds = folders.map((f) => f.id);

    // Count total flashcards
    const totalFlashcards = await this.prisma.flashcard.count({
      where: {
        folder_id: { in: folderIds },
      },
    });

    // Count new words
    const newWordsCount = await this.prisma.flashcard.count({
      where: {
        folder_id: { in: folderIds },
        status: 'new',
      },
    });

    // Count review words (that need to be reviewed)
    const reviewWordsCount = await this.prisma.flashcard.count({
      where: {
        folder_id: { in: folderIds },
        status: 'review',
        nextReview: {
          lte: now,
          not: null,
        },
      },
    });

    return {
      totalFlashcards,
      totalFlashbooks: folders.length,
      newWordsCount,
      reviewWordsCount,
    };
  }

  /**
   * Get daily study statistics from StudyCount table
   * Returns data grouped by date with total count (newCount + reviewCount)
   */
  async getDailyStudyStatistics(
    userId: string,
    days: number = 7,
    folderId?: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1));

    // Build where clause
    let whereClause: any = {
      user_id: userId,
      day: {
        gte: startDate,
        lte: today,
      },
    };

    // If folderId is provided, we need to filter by folder
    // Since StudyCount doesn't have folder_id, we'll get all counts for the user
    // and filter by folder later if needed (or we can add folder_id to StudyCount if needed)
    // For now, we'll return all user's study counts

    // Get all study counts in the date range
    const studyCounts = await this.prisma.studyCount.findMany({
      where: whereClause,
      orderBy: {
        day: 'asc',
      },
    });

    // Create a map for all dates in range
    const dailyStatsMap = new Map<string, { count: number; newCount: number; reviewCount: number }>();

    // Initialize all dates in range
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0] as string;
      dailyStatsMap.set(dateKey, { count: 0, newCount: 0, reviewCount: 0 });
    }

    // Fill in actual data
    studyCounts.forEach((studyCount) => {
      const dateKey = studyCount.day.toISOString().split('T')[0] as string;
      const stats = dailyStatsMap.get(dateKey);
      
      if (stats) {
        stats.newCount = studyCount.newCount;
        stats.reviewCount = studyCount.reviewCount;
        stats.count = studyCount.newCount + studyCount.reviewCount;
      }
    });

    // Convert map to array
    const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return dailyStats;
  }

  /**
   * Get next flashcard that needs to be studied
   * - Ưu tiên: status = "review" AND nextReview <= now, sắp xếp theo nextReview DESC (xa nhất trước)
   * - Nếu không có: lấy status = "new"
   * Trả về 1 flashcard duy nhất (flashcard cần học tiếp theo) và thống kê
   */
  async getNextFlashcardToStudy(userId: string, folderId?: string) {
    const now = new Date();
    
    // Build base where clause for folder/user filtering
    let whereClause: any = {
      folder: {
        user_id: userId, // Đảm bảo flashcard thuộc về user
      },
    };
    
    if (folderId) {
      // Verify folder exists and belongs to user
      const folder = await this.prisma.folder.findFirst({
        where: { 
          id: folderId,
          user_id: userId,
        },
      });

      if (!folder) {
        throw new NotFoundException('Folder không tồn tại hoặc bạn không có quyền truy cập');
      }

      whereClause.folder_id = folderId;
    }

    // Ưu tiên 1: Tìm review cards với nextReview <= now, sắp xếp theo nextReview DESC (xa nhất trước)
    const reviewFlashcard = await this.prisma.flashcard.findFirst({
      where: {
        ...whereClause,
        status: 'review',
        nextReview: {
          lte: now,
          not: null, // Đảm bảo nextReview không null
        },
      },
      orderBy: {
        nextReview: 'desc', // DESC: xa nhất (quên lâu nhất) học trước
      },
    });

    if (reviewFlashcard) {
      // Get statistics
      const statistics = await this.getStudyStatistics(userId, folderId);
      return {
        flashcard: reviewFlashcard,
        statistics,
      };
    }

    // Ưu tiên 2: Nếu không có review cards, lấy new cards
    const newFlashcard = await this.prisma.flashcard.findFirst({
      where: {
        ...whereClause,
        status: 'new',
      },
    });

    // Get statistics
    const statistics = await this.getStudyStatistics(userId, folderId);
    
    return {
      flashcard: newFlashcard || null,
      statistics,
    };
  }

  /**
   * Handle study action for a flashcard
   */
  async handleStudyAction(userId: string, flashcardId: string, action: StudyAction) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id: flashcardId },
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
        throw new ForbiddenException('Bạn không có quyền học flashcard này');
      }
    }

    // Validate action based on status
    if (flashcard.status === 'new') {
      if (action !== StudyAction.NEW_FORGOT && action !== StudyAction.NEW_GOOD) {
        throw new BadRequestException('Action không hợp lệ cho flashcard mới');
      }
    } else if (flashcard.status === 'review') {
      if (
        action !== StudyAction.REVIEW_FORGOT &&
        action !== StudyAction.REVIEW_HARD &&
        action !== StudyAction.REVIEW_NORMAL &&
        action !== StudyAction.REVIEW_EASY
      ) {
        throw new BadRequestException('Action không hợp lệ cho flashcard đang ôn tập');
      }
    }

    let updateData: any = {};

    switch (action) {
      case StudyAction.NEW_FORGOT:
        // Giữ trạng thái new, nextReview là ngay bây giờ
        updateData = {
          status: 'new',
          nextReview: this.getNow(),
        };
        break;

      case StudyAction.NEW_GOOD:
        // Chuyển sang review, interval = 1, easeFactor = 1.3, nextReview = now + 5 hours
        updateData = {
          status: 'review',
          interval: 1,
          easeFactor: 1.3,
          nextReview: this.getNowPlus5Hours(),
        };
        break;

      case StudyAction.REVIEW_FORGOT:
        // interval = 1, easeFactor -= 0.2 (min 1.3), lapseCount += 1
        const newEaseFactor = Math.max(1.3, flashcard.easeFactor - 0.2);
        updateData = {
          interval: 1,
          easeFactor: newEaseFactor,
          lapseCount: flashcard.lapseCount + 1,
          nextReview: this.calculateNextReview(1),
        };
        break;

      case StudyAction.REVIEW_HARD:
        // easeFactor giữ nguyên, interval *= 1.1
        const newIntervalHard = flashcard.interval * 1.1;
        updateData = {
          interval: newIntervalHard,
          nextReview: this.calculateNextReview(newIntervalHard),
        };
        break;

      case StudyAction.REVIEW_NORMAL:
        // interval *= easeFactor
        const newIntervalNormal = flashcard.interval * flashcard.easeFactor;
        updateData = {
          interval: newIntervalNormal,
          nextReview: this.calculateNextReview(newIntervalNormal),
        };
        break;

      case StudyAction.REVIEW_EASY:
        // easeFactor += 0.15, interval *= (easeFactor + 0.3)
        const newEaseFactorEasy = flashcard.easeFactor + 0.15;
        const newIntervalEasy = flashcard.interval * (flashcard.easeFactor + 0.3);
        updateData = {
          easeFactor: newEaseFactorEasy,
          interval: newIntervalEasy,
          nextReview: this.calculateNextReview(newIntervalEasy),
        };
        break;
    }

    // Increment review_count for all actions except NEW_FORGOT
    if (action !== StudyAction.NEW_FORGOT) {
      updateData.review_count = flashcard.review_count + 1;
    }

    const updatedFlashcard = await this.prisma.flashcard.update({
      where: { id: flashcardId },
      data: updateData,
    });

    // Increment study count for today (only for actions that count as studying)
    if (action !== StudyAction.NEW_FORGOT) {
      await this.incrementStudyCount(userId, flashcard, action);
    }

    return updatedFlashcard;
  }

  /**
   * Increment study count for a user on today's date
   */
  private async incrementStudyCount(
    userId: string,
    flashcard: any,
    action: StudyAction,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determine if it's a new word or review
    // A word is "new" if it was just studied for the first time (status was 'new' and now becomes 'review')
    const isNewWord = flashcard.status === 'new' && 
                      (action === StudyAction.NEW_GOOD);

    // Try to find existing study count for today
    const existing = await this.prisma.studyCount.findFirst({
      where: {
        user_id: userId,
        day: today,
      },
    });

    if (existing) {
      // Update count
      await this.prisma.studyCount.update({
        where: { id: existing.id },
        data: {
          newCount: isNewWord ? existing.newCount + 1 : existing.newCount,
          reviewCount: isNewWord ? existing.reviewCount : existing.reviewCount + 1,
        },
      });
    } else {
      // Create new study count
      await this.prisma.studyCount.create({
        data: {
          user_id: userId,
          day: today,
          newCount: isNewWord ? 1 : 0,
          reviewCount: isNewWord ? 0 : 1,
        },
      });
    }
  }

  /**
   * Get folder with flashcard that needs review soonest
   * Returns folder with the nearest nextReview date
   */
  async getFolderWithNearestReview(userId: string) {
    const now = new Date();

    // Find flashcard with nearest nextReview date that needs review
    const nearestFlashcard = await this.prisma.flashcard.findFirst({
      where: {
        folder: {
          user_id: userId,
        },
        status: 'review',
        nextReview: {
          lte: now, // Only get cards that need review now or in the past
          not: null,
        },
      },
      orderBy: {
        nextReview: 'asc', // Get the one with nearest review date
      },
      include: {
        folder: true,
      },
    });

    if (nearestFlashcard && nearestFlashcard.folder) {
      // Get folder statistics using the same method from folders service
      const newCount = await this.prisma.flashcard.count({
        where: {
          folder_id: nearestFlashcard.folder.id,
          status: 'new',
        },
      });

      const reviewCount = await this.prisma.flashcard.count({
        where: {
          folder_id: nearestFlashcard.folder.id,
          status: 'review',
          nextReview: {
            lte: now,
            not: null,
          },
        },
      });

      return {
        ...nearestFlashcard.folder,
        newCount,
        reviewCount,
        nearestReviewDate: nearestFlashcard.nextReview,
        nearestFlashcardName: nearestFlashcard.name,
        isReviewMode: true,
      };
    }

    // If no folder needs review, get folder with most new words
    const folders = await this.prisma.folder.findMany({
      where: {
        user_id: userId,
      },
      include: {
        flashcards: {
          where: {
            status: 'new',
          },
        },
      },
    });

    if (folders.length === 0) {
      return null;
    }

    // Find folder with most new words
    if (folders.length === 0) {
      return null;
    }

    let folderWithMostNew = folders[0]!;
    let maxNewCount = folderWithMostNew.flashcards.length;

    for (let i = 1; i < folders.length; i++) {
      const folder = folders[i];
      if (!folder) continue;
      const newCount = folder.flashcards.length;
      if (newCount > maxNewCount) {
        folderWithMostNew = folder;
        maxNewCount = newCount;
      }
    }

    if (folderWithMostNew.flashcards.length === 0) {
      return null;
    }

    // Get folder statistics
    const newCount = await this.prisma.flashcard.count({
      where: {
        folder_id: folderWithMostNew.id,
        status: 'new',
      },
    });

    const reviewCount = await this.prisma.flashcard.count({
      where: {
        folder_id: folderWithMostNew.id,
        status: 'review',
        nextReview: {
          lte: now,
          not: null,
        },
      },
    });

    return {
      ...folderWithMostNew,
      newCount,
      reviewCount,
      isReviewMode: false,
    };
  }
}

