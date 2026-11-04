
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';
import { GoogleCalendarModule } from './integrations/google-calendar/google-calendar.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GoogleCalendarModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
