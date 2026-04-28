import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Request } from 'express';
import { REQUIRED_ROLE_KEY } from './admin.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const authorization: unknown = request.headers['authorization'];

    if (!authorization || typeof authorization !== 'string') {
      throw new UnauthorizedException('missing authorization header');
    }
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      throw new UnauthorizedException('invalid token');
    }
    const authUser = await this.authService.verifyAndBuildContext(token);

    const dbUser = await this.userService.upsertAuthUser({
      clerkUserId: authUser.clerkUserId,
      email: authUser.email,
      name: authUser.name,
    });

    const user = {
      ...authUser,
      role: dbUser.role,
    };
    request.user = user;

    const requredRole = this.reflector.getAllAndOverride<string>(
      REQUIRED_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requredRole === 'admin' && user.role !== 'admin')
      throw new ForbiddenException('admin access requried');
    return true;
  }
}
