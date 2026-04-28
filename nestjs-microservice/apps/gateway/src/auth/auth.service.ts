import { createClerkClient, verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserContext } from './auth.type';

export interface ClerkJwtPayload {
  sub?: string;
  userId?: string; // Sometimes used in older setups
  email?: string;
  email_address?: string;
  primaryEmailAddress?: string;
  name?: string;
  fullName?: string;
  username?: string;
  metadata?: {
    role?: 'user' | 'admin';
  };
}

@Injectable()
export class AuthService {
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });

  private jwtVerifyOptions(): Record<string, any> {
    return {
      secretKey: process.env.CLERK_SECRET_KEY,
    };
  }

  async verifyAndBuildContext(token: string): Promise<UserContext> {
    try {
      const verified = await verifyToken(token, this.jwtVerifyOptions());

      const value = verified?.payload ?? verified;

      const payload = value as unknown as ClerkJwtPayload;

      const clerkUserId = payload?.sub ?? payload?.userId;

      if (!clerkUserId) {
        throw new UnauthorizedException('token is missing user id');
      }

      const role: 'user' | 'admin' = 'user';

      const emailFromToken =
        payload?.email ??
        payload?.email_address ??
        payload?.primaryEmailAddress ??
        '';
      const nameFromToken =
        payload?.name ?? payload?.fullName ?? payload?.username ?? '';

      if (emailFromToken && nameFromToken) {
        return {
          clerkUserId,
          email: emailFromToken,
          name: nameFromToken,
          role,
        };
      }
      const user = await this.clerk.users.getUser(clerkUserId);

      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
        user.emailAddresses[0];

      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        primaryEmail.emailAddress ||
        clerkUserId;

      return {
        clerkUserId,
        email: emailFromToken || primaryEmail.emailAddress || '',
        name: nameFromToken || fullName,
        role,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
