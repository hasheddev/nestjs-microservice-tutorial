import {
  ConflictException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEventsService } from 'src/events/user-events.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userEventService: UserEventsService,
  ) {}

  private get secret() {
    return this.configService.get<string>('JWT_SECRET');
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('user not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('user with given email already exists!');
    }
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const hashedPassword = await this.hashPasswd(registerDto.password);
    const userEntity = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.User,
    });
    const user = await this.userRepository.save(userEntity);

    this.userEventService.emitUserRegistered(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return {
      user: result,
      message: 'Registeration successfull! Please login to continue',
    };
  }

  async createAdmin(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('user with given email already exists!');
    }
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const hashedPassword = await this.hashPasswd(registerDto.password);
    const userEntity = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.Admin,
    });
    const user = await this.userRepository.save(userEntity);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return {
      user: result,
      message: 'Admin user created successfully! Please login to continue',
    };
  }

  async login(credentials: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: credentials.email },
      select: [
        'password',
        'id',
        'email',
        'createdAt',
        'updatedAt',
        'name',
        'role',
      ],
    });
    if (
      !user ||
      !(await this.verifyPassword(credentials.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...details } = user;
    return {
      user: details,
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload: { id: number } = this.jwtService.verify(token, {
        secret: this.secret,
      });
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });
      if (!user) throw new UnauthorizedException('Invalid token');
      return this.generateAccessToken(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    const payload = { email: user.email, id: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: '1h',
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = { id: user.id };
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: '1d',
    });
  }

  private async hashPasswd(password: string) {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
