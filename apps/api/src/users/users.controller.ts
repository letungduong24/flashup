import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { signInRequestSchema, signUpRequestSchema, userSchema } from '@repo/types';
import { createZodDto } from 'nestjs-zod';

class SignUpDto extends createZodDto(signUpRequestSchema) {}
class SignInDto extends createZodDto(signInRequestSchema) {}
class UserDto extends createZodDto(userSchema) {}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() signUpDto: SignUpDto) {
    return this.usersService.create(signUpDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body(signUpRequestSchema.partial()) updateUserDto: Partial<SignUpRequest>) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
