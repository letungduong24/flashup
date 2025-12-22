import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [PrismaModule],
  exports: [AttendanceService],
})
export class AttendanceModule {}

