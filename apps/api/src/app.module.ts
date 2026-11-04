import { Module } from '@nestjs/common';
import { GoogleCalendarModule } from './integrations/google-calendar/google-calendar.module.js';

@Module({
  imports: [GoogleCalendarModule],
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
