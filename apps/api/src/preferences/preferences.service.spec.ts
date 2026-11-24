import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreferencesService } from './preferences.service.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('PreferencesService', () => {
  const prisma = {
    studentPreferences: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  };

  let service: PreferencesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PreferencesService(prisma as unknown as PrismaService);
  });

  it('retrieves preferences for the authenticated user', async () => {
    const preferences = {
      userId: 'user-123',
      dailyStudyLimitMinutes: 240,
    };

    prisma.studentPreferences.findUnique.mockResolvedValue(preferences);

    const result = await service.getPreferences('user-123');

    expect(result).toEqual(preferences);
    expect(prisma.studentPreferences.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    });
  });

  it('creates preferences when none exist', async () => {
    const input = {
      dailyStudyLimitMinutes: 240,
      sessionLengthMinutes: 60,
      availableDays: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '21:00',
    };

    prisma.studentPreferences.upsert.mockResolvedValue({
      userId: 'user-123',
      ...input,
    });

    await service.updatePreferences('user-123', input);

    expect(prisma.studentPreferences.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      create: { userId: 'user-123', ...input },
      update: input,
    });
  });

  it('uses the supplied authenticated user ID for updates', async () => {
    const input = {
      dailyStudyLimitMinutes: 120,
      sessionLengthMinutes: 30,
      availableDays: [1, 3, 5],
      startTime: '10:00',
      endTime: '18:00',
    };

    await service.updatePreferences('another-user', input);

    expect(prisma.studentPreferences.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'another-user' },
        create: expect.objectContaining({ userId: 'another-user' }),
      }),
    );
  });
});
