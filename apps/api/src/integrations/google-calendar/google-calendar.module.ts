import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { GoogleCalendarController } from './google-calendar.controller.js';
import { GoogleCalendarService } from './google-calendar.service.js';

@Module({
  // AuthService (Google access tokens) and SessionGuard (signed-in routes).
  imports: [AuthModule],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
