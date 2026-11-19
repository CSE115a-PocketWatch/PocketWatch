import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { validatePreferences } from './preferences.validation.js';

describe('validatePreferences', () => {
  const validPreferences = {
    dailyStudyLimitMinutes: 240,
    sessionLengthMinutes: 60,
    availableDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '21:00',
  };

  it('accepts valid preferences', () => {
    expect(validatePreferences(validPreferences)).toEqual(
      validPreferences,
    );
  });

  it('rejects non-positive study durations', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        dailyStudyLimitMinutes: 0,
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      validatePreferences({
        ...validPreferences,
        sessionLengthMinutes: -30,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid available days', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        availableDays: [0, 8],
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects duplicate available days', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        availableDays: [1, 1, 2],
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid time formats', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        startTime: '25:00',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects an end time before the start time', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        startTime: '18:00',
        endTime: '09:00',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a missing preferences payload', () => {
    expect(() => validatePreferences(null)).toThrow(
      BadRequestException,
    );
  });

  // S3-T26: Additional validation regression tests

  it('rejects fractional study durations', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        dailyStudyLimitMinutes: 120.5,
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      validatePreferences({
        ...validPreferences,
        sessionLengthMinutes: 30.5,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects an empty available days array', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        availableDays: [],
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects missing required fields', () => {
    const { startTime, ...incompletePreferences } = validPreferences;

    expect(() =>
      validatePreferences(incompletePreferences),
    ).toThrow(BadRequestException);
  });

  it('rejects identical start and end times', () => {
    expect(() =>
      validatePreferences({
        ...validPreferences,
        startTime: '12:00',
        endTime: '12:00',
      }),
    ).toThrow(BadRequestException);
  });
});
