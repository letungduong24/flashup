import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { hashPassword } from 'src/lib/bcrypt.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

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
}
