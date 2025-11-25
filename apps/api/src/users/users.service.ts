import { Injectable } from '@nestjs/common';
import { SignUpRequest } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {
    
  }
  create(signUpRequest: SignUpRequest) {
    return this.prisma.user.create({
      data: signUpRequest,
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

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
