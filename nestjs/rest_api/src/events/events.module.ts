import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEventsService } from './user-events.service';
import { UserRegisteredEventListener } from './listeners/user-registeration.listener';

const EventEmitterModuleConfig = EventEmitterModule.forRoot({
  global: true,
  wildcard: false,
  maxListeners: 15,
  verboseMemoryLeak: true,
});

@Module({
  imports: [EventEmitterModuleConfig],
  providers: [UserEventsService, UserRegisteredEventListener],
  exports: [UserEventsService],
})
export class EventsModule {}
