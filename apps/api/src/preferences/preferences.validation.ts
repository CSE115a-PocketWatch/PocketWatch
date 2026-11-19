import { BadRequestException } from '@nestjs/common';

export interface UpdatePreferencesDto {
  dailyStudyLimitMinutes: number;
  sessionLengthMinutes: number;
  availableDays: number[];
  startTime: string;
  endTime: string;
}

export function validatePreferences(
  body: unknown,
): UpdatePreferencesDto {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Invalid preferences payload');
  }

  const data = body as Record<string, unknown>;

  const {
    dailyStudyLimitMinutes,
    sessionLengthMinutes,
    availableDays,
    startTime,
    endTime,
  } = data;

  if (
    !Number.isInteger(dailyStudyLimitMinutes) ||
    (dailyStudyLimitMinutes as number) <= 0 ||
    !Number.isInteger(sessionLengthMinutes) ||
    (sessionLengthMinutes as number) <= 0
  ) {
    throw new BadRequestException('Study durations must be positive integers');
  }

  if (
    !Array.isArray(availableDays) ||
    availableDays.length === 0 ||
    !availableDays.every(
      (day) => Number.isInteger(day) && day >= 1 && day <= 7,
    ) ||
    new Set(availableDays).size !== availableDays.length
  ) {
    throw new BadRequestException(
      'Available days must contain unique weekdays from 1 to 7',
    );
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    typeof startTime !== 'string' ||
    typeof endTime !== 'string' ||
    !timePattern.test(startTime) ||
    !timePattern.test(endTime) ||
    startTime >= endTime
  ) {
    throw new BadRequestException('Invalid available time range');
  }

  return {
    dailyStudyLimitMinutes: dailyStudyLimitMinutes as number,
    sessionLengthMinutes: sessionLengthMinutes as number,
    availableDays: availableDays as number[],
    startTime,
    endTime,
  };
}
