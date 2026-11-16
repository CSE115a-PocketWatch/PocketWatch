import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class SessionCleanupService {
  constructor(private readonly prisma: PrismaService) {}

  // Delete sessions that have expired by this time.
  // Tests can pass a fixed time so results are predictable.
  async deleteExpiredSessions(now: Date = new Date()): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    return result.count;
  }

  // Run at midnight UTC each day while the backend is running.
  @Cron('0 0 0 * * *', {
    name: 'expired-session-cleanup',
    timeZone: 'UTC',
  })
  async handleNightlyCleanup(): Promise<void> {
    await this.deleteExpiredSessions();
  }
}
