import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PreferencesController } from './preferences.controller.js';
import type { PreferencesService } from './preferences.service.js';
import type { AuthUser } from '../auth/auth.service.js';

describe('PreferencesController', () => {
  const preferencesService = {
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
  };

  const user = { id: 'user-123' } as AuthUser;

  const validPreferences = {
    dailyStudyLimitMinutes: 240,
    sessionLengthMinutes: 60,
    availableDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '21:00',
  };

  let controller: PreferencesController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PreferencesController(
      preferencesService as unknown as PreferencesService,
    );
  });

  it('retrieves preferences for the authenticated user', async () => {
    preferencesService.getPreferences.mockResolvedValue(validPreferences);

    const result = await controller.getPreferences(user);

    expect(result).toEqual(validPreferences);
    expect(preferencesService.getPreferences).toHaveBeenCalledWith('user-123');
  });

  it('updates preferences for the authenticated user', async () => {
    preferencesService.updatePreferences.mockResolvedValue(validPreferences);

    const result = await controller.updatePreferences(user, validPreferences);

    expect(result).toEqual(validPreferences);
    expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
      'user-123',
      validPreferences,
    );
  });

  it('rejects invalid preferences before updating', () => {
    expect(() =>
      controller.updatePreferences(user, {
        ...validPreferences,
        dailyStudyLimitMinutes: -1,
      }),
    ).toThrow(BadRequestException);

    expect(preferencesService.updatePreferences).not.toHaveBeenCalled();
  });
});
