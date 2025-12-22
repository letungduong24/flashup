import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Check in (điểm danh) for today
   * POST /attendance/check-in
   */
  @Post('check-in')
  async checkIn(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.attendanceService.checkIn(userId);
  }

  /**
   * Get attendance calendar data for a month
   * GET /attendance/calendar?year=2024&month=12
   */
  @Get('calendar')
  async getCalendarData(
    @Req() req: AuthenticatedRequest,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const userId = req.user.id;
    const now = new Date();
    const yearNum = year ? parseInt(year, 10) : now.getFullYear();
    const monthNum = month ? parseInt(month, 10) : now.getMonth() + 1;

    return this.attendanceService.getCalendarData(userId, yearNum, monthNum);
  }

  /**
   * Get attendance statistics
   * GET /attendance/statistics
   */
  @Get('statistics')
  async getStatistics(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.attendanceService.getStatistics(userId);
  }
}

