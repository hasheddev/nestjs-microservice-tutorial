import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as userEventsService from '../user-events.service';

@Injectable()
export class UserRegisteredEventListener {
  private readonly logger = new Logger(UserRegisteredEventListener.name);

  @OnEvent(userEventsService.USER_REGISTERED)
  userRegisteredHandler(event: userEventsService.UserRegisteredEventData) {
    const { user, timestamp } = event;
    this.logger.log(
      `Welcome, ${user.name} Your account was created with email ${user.email}  at ${timestamp.toISOString()}`,
    );
  }
}
