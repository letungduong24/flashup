import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { hashPassword } from 'src/lib/bcrypt.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) { }

  async create(signUpRequest: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signUpRequest.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await hashPassword(signUpRequest.password);
    this.logger.debug(`Hashed password for ${signUpRequest.email}, hash length: ${hashedPassword.length}, starts with: ${hashedPassword.substring(0, 7)}`);

    // Ensure password is properly hashed and not overwritten by spread
    const { password: _, ...restSignUpData } = signUpRequest;

    const newUser = await this.prisma.user.create({
      data: {
        ...restSignUpData,
        password: hashedPassword,
      },
      omit: {
        password: true,
      }
    });

    // Verify password was saved correctly
    const savedUser = await this.prisma.user.findUnique({
      where: { id: newUser.id },
      select: { password: true }
    });
    this.logger.debug(`Saved password hash length: ${savedUser?.password?.length}, starts with: ${savedUser?.password?.substring(0, 7)}`);

    return newUser;
  }

  findAll() {
    return this.prisma.user.findMany({
      omit: {
        password: true,
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      }
    });
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      omit: {
        password: true,
      },
    });
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      omit: {
        password: true,
      },
    });
  }

  async getUserStats(userId: string) {
    // Get total flashbooks
    const totalFlashbooks = await this.prisma.folder.count({
      where: { user_id: userId },
    });

    // Get total flashcards
    const totalFlashcards = await this.prisma.flashcard.count({
      where: {
        folder: {
          user_id: userId,
        },
      },
    });

    // Get completed practice sessions
    const completedSessions = await this.prisma.practiceSession.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    });

    // Calculate overall accuracy
    const sessions = await this.prisma.practiceSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      select: {
        correctCount: true,
        incorrectCount: true,
      },
    });

    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
    const totalIncorrect = sessions.reduce((sum, s) => sum + s.incorrectCount, 0);
    const totalAnswers = totalCorrect + totalIncorrect;
    const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    return {
      totalFlashbooks,
      totalFlashcards,
      completedSessions,
      accuracy,
      totalCorrect,
      totalIncorrect,
    };
  }
}
