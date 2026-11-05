import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './database/prisma.module.js';
import { GoogleCalendarModule } from './integrations/google-calendar/google-calendar.module.js';
import { ScheduleModule } from '@nestjs/schedule';

// Root module: everything the app uses is registered here.
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Loads apps/api/.env and makes ConfigService available everywhere.
    ConfigModule.forRoot({ isGlobal: true }),
    // Database access (PrismaService).
    PrismaModule,
    // Google sign-in.
    AuthModule,

    GoogleCalendarModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
