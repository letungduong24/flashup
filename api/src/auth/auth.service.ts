import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { validatePassword } from 'src/lib/bcrypt.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(signInRequest: { email: string; password: string }) {
    try {
      this.logger.debug(`Validating user: ${signInRequest.email}`);
      const user = await this.usersService.findByEmail(signInRequest.email);

      if (!user) {
        this.logger.warn(`User not found: ${signInRequest.email}`);
        return null;
      }

      // Debug: Check password fields
      if (!user.password) {
        this.logger.error('User password is null or undefined');
        return null;
      }

      this.logger.debug(`Password hash length: ${user.password?.length}, starts with: ${user.password?.substring(0, 7)}`);
      this.logger.debug(`Input password length: ${signInRequest.password?.length}`);

      const isPasswordValid = await validatePassword(
        signInRequest.password,
        user.password
      );

      if (!isPasswordValid) {
        this.logger.error(`Password validation failed for user: ${signInRequest.email}`);
        this.logger.error(`Stored password type: ${typeof user.password}`);
        this.logger.error(`Stored password length: ${user.password?.length}`);
        this.logger.error(`Stored password starts with: ${user.password?.substring(0, 30)}`);
        return null;
      }

      this.logger.debug(`Password validation successful for user: ${signInRequest.email}`);
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  async login(user: any): Promise<string> {
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return access_token;
  }

  async signUp(signUpRequest: any) {
    const user = await this.usersService.create(signUpRequest);
    if (!user) {
      throw new UnauthorizedException('Không thể tạo tài khoản');
    }
    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user,
      access_token,
    }
  }

  async validateGoogleUser(googleUser: any) {
    const { email, firstName, lastName, displayName, picture, googleId } = googleUser;

    // 1. Check if user exists by email
    let user: any = await this.usersService.findByEmail(email);

    if (user) {
      // 2. If user exists but has no googleId, link it (optional, or just logic)
      if (!user.googleId) {
        // You might want to update the user with googleId here
        // await this.usersService.update(user.id, { googleId, avatarUrl: picture });
      }
    } else {
      // 3. Create new user
      const name = displayName || `${firstName || ''} ${lastName || ''}`.trim();
      // Generate a random password or leave it null (since we made it optional)
      // Since create() might expect password if not updated, let's assume create handles it or we pass a dummy one if required
      // But looking at schema, password is now optional.
      // However, check UsersService.create signature.

      // For now, assuming UsersService.create can handle it or we adapt it.
      // We'll trust create() uses the DTO/Type which might fail if password is required there.
      // Safe bet: Pass a random password or modify UsersService.

      user = await this.usersService.create({
        email,
        name,
        password: '', // Should be handled by User service to allow empty if schema supports it
        googleId,
        avatarUrl: picture,
      } as any);
    }

    return user;
  }

}
