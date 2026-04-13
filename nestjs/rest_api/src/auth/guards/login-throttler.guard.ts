import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

interface LoginRequest {
  body?: {
    email?: string;
  };
}

@Injectable()
export class LoginThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: LoginRequest) {
    const email: string = req.body?.email || 'anonymous';
    return Promise.resolve(`login-${email}`);
  }
  protected getLimit() {
    return Promise.resolve(5);
  }

  protected getTtl() {
    return Promise.resolve(60000);
  }

  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'too many attempts please try again after 1 minute',
    );
  }
}
