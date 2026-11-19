import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { UpdatePreferencesDto } from './preferences.validation.js';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    return this.prisma.studentPreferences.findUnique({
      where: { userId },
    });
  }

  async updatePreferences(
    userId: string,
    preferences: UpdatePreferencesDto,
  ) {
    return this.prisma.studentPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...preferences,
      },
      update: preferences,
    });
  }
}
