import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { GoogleCalendarModule } from '../integrations/google-calendar/google-calendar.module.js';
import { SchedulingController } from './scheduling.controller.js';

@Module({
  // SessionGuard (signed-in routes) and GoogleCalendarService (busy times).
  imports: [AuthModule, GoogleCalendarModule],
  controllers: [SchedulingController],
})
export class SchedulingModule {}
