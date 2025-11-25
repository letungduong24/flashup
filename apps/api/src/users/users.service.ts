import { Injectable } from '@nestjs/common';
import { SignUpRequest } from '@repo/types';
import { hashPassword } from 'src/lib/bcrypt.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {
    
  }
  async create(signUpRequest: SignUpRequest) {
    const user = await this.prisma.user.findUnique({
      where: { email: signUpRequest.email },
    });

    if (user) {
      throw new Error('Người dùng đã tồn tại');
    }

    const hashedPassword = await hashPassword(signUpRequest.password);

    return this.prisma.user.create({
      data: {
        ...signUpRequest,
        password: hashedPassword,
      },
      omit: {
        password: true,
      }
    });
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
