import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { 
  SignInRequest, 
  SignUpRequest, 
} from '@repo/types';
import { UsersService } from 'src/users/users.service';
import { validatePassword } from 'src/lib/bcrypt.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(signInRequest: SignInRequest) {
    try {
      const user = await this.usersService.findByEmail(signInRequest.email);
      
      if (!user) {
        return null;
      }

      const isPasswordValid = await validatePassword(
        signInRequest.password,
        user.password
      );

      if (!isPasswordValid) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
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

  async signUp(signUpRequest: SignUpRequest){
    const user = await this.usersService.create(signUpRequest);
    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user,
      access_token,
    }
  }
}
