import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/auth/entities/user.entity';

export interface UserRegisteredEventData {
  user: {
    id: number;
    email: string;
    name: string;
  };
  timestamp: Date;
}

export const USER_REGISTERED = 'user:registered';

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitUserRegistered(user: User): void {
    const { id, email, name } = user;
    const eventData: UserRegisteredEventData = {
      user: {
        id,
        email,
        name,
      },
      timestamp: new Date(),
    };
    this.eventEmitter.emit(USER_REGISTERED, eventData);
  }
}
