import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() request,
    @Res() res: Response,
  ) {
    const access_token = await this.authService.login(request.user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      // Only set secure when explicitly enabled (e.g. HTTPS). For HTTP/IP deployment, keep false.
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json(request.user);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ) {
    const { user, access_token } = await this.authService.signUp(signUpDto);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return res.json(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() request) {
    return request.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) { }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user);
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=Google_Auth_Failed`);
    }

    const access_token = await this.authService.login(user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }

}
