import { Module } from '@nestjs/common';
import { GoogleCalendarModule } from './integrations/google-calendar/google-calendar.module.js';

@Module({
  imports: [GoogleCalendarModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
