import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorators';

// 1. Describe the object structure (Destructuring Syntax)
// const { user }: { user: UserType } = context.switchToHttp().getRequest();

// 2. Or, use "as" (Type Assertion) - often cleaner for requests
// const { user } = context.switchToHttp().getRequest() as { user: UserType };

export interface AuthenticatedRequest {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

// checks user permission
@Injectable()
export class RolesGuard implements CanActivate {
  //reflector accesses metadata
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // method level metadata
      context.getClass(), //class level metsdata
    ]);
    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    const hasPermission = roles.some((role) => user.role === role);

    if (!hasPermission) throw new ForbiddenException('Insufficient permission');

    return true;
  }
}
