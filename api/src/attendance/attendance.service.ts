import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check in (điểm danh) for today
   */
  async checkIn(userId: string): Promise<{ id: string; date: Date }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await this.prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Bạn đã điểm danh hôm nay rồi');
    }

    // Create attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        user_id: userId,
        date: today,
      },
    });

    return {
      id: attendance.id,
      date: attendance.date,
    };
  }

  /**
   * Get attendance calendar data for a month
   */
  async getCalendarData(
    userId: string,
    year: number,
    month: number,
  ): Promise<{ date: string; checked: boolean }[]> {
    // Get start and end of month
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get all attendances in this month
    const attendances = await this.prisma.attendance.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
      },
    });

    // Create a set of dates that have attendance
    const attendanceDates = new Set(
      attendances.map((a) => {
        const d = new Date(a.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }),
    );

    // Generate all dates in the month
    const result: { date: string; checked: boolean }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      result.push({
        date: dateStr,
        checked: attendanceDates.has(dateStr),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Get attendance statistics
   */
  async getStatistics(userId: string): Promise<{
    totalDays: number;
    currentStreak: number;
    longestStreak: number;
    thisMonth: number;
  }> {
    // Get all attendances
    const attendances = await this.prisma.attendance.findMany({
      where: {
        user_id: userId,
      },
      select: {
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (attendances.length === 0) {
      return {
        totalDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        thisMonth: 0,
      };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (const attendance of attendances) {
      const attendanceDate = new Date(attendance.date);
      attendanceDate.setHours(0, 0, 0, 0);

      if (attendanceDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (attendanceDate < checkDate) {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const attendance of attendances) {
      const attendanceDate = new Date(attendance.date);
      attendanceDate.setHours(0, 0, 0, 0);

      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.floor(
          (prevDate.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevDate = attendanceDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Count this month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const thisMonth = attendances.filter((a) => {
      const d = new Date(a.date);
      return d >= thisMonthStart;
    }).length;

    return {
      totalDays: attendances.length,
      currentStreak,
      longestStreak,
      thisMonth,
    };
  }
}

