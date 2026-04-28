import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from './auth.type';

interface AuthenticatedRequest {
  user?: UserContext;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return user;
  },
);
