import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorators';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from './guards/roles.guard';
import { LoginThrottleGuard } from './guards/login-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LoginThrottleGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getCurrentUser(
    @CurrentUser()
    user?: ReturnType<typeof this.authService.getUserById>,
  ) {
    return user;
  }

  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create-admin')
  async createAdminUser(@Body() registerDto: RegisterDto) {
    return this.authService.createAdmin(registerDto);
  }
}
