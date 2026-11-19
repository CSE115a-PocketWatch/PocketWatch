import { describe, expect, it } from 'vitest';
import { SchedulingAssignmentSchema, type SchedulingAssignment } from './index.js';

const validAssignment = {
  title: 'CSE 115A report',
  deadline: '2030-11-20T23:59:00-08:00',
  estimatedMinutes: 90,
};

describe('Scheduling assignment validation', () => {
  it('assignment-validation-1 accepts valid input through the public export', () => {
    // safeParse returns a success/failure result instead of throwing.
    const result = SchedulingAssignmentSchema.safeParse(validAssignment);

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error('Expected valid assignment to pass');
    }

    // Also check that the public TypeScript type is available.
    const assignment: SchedulingAssignment = result.data;
    expect(assignment).toEqual(validAssignment);
  });

  it('assignment-validation-1 trims titles and rejects blank titles', () => {
    const result = SchedulingAssignmentSchema.parse({
      ...validAssignment,
      title: '  CSE 115A report  ',
    });

    expect(result.title).toBe('CSE 115A report');

    for (const title of ['', '   ', '\t\n']) {
      expect(
        SchedulingAssignmentSchema.safeParse({
          ...validAssignment,
          title,
        }).success,
      ).toBe(false);
    }
  });

  // 1. Check that normal assignment data passes and is returned correctly.
  it('assignment-validation-1 accepts UTC, offset, and past deadlines', () => {
    for (const deadline of [
      '2030-11-20T23:59:00Z',
      '2030-11-20T23:59:00-08:00',
      '2030-11-20T23:59:00+05:30',
      '2000-01-01T00:00:00Z',
    ]) {
      expect(
        SchedulingAssignmentSchema.safeParse({
          ...validAssignment,
          deadline,
        }).success,
      ).toBe(true);
    }
  });

  // 2. Check that invalid dates and missing time zones are rejected.
  it('assignment-validation-1 rejects invalid dates and missing time zones', () => {
    for (const deadline of [
      'next friday',
      '',
      '2030-02-30T12:00:00Z',
      '2030-13-01T12:00:00Z',
      '2030-11-20T25:00:00Z',
      '2030-11-20T12:00:00',
      '2030-11-20',
    ]) {
      expect(
        SchedulingAssignmentSchema.safeParse({
          ...validAssignment,
          deadline,
        }).success,
      ).toBe(false);
    }
  });

  // 3. Check that estimated minutes must be finite, positive, and whole numbers.
  it('assignment-validation-1 requires finite positive whole-minute estimates', () => {
    for (const estimatedMinutes of [1, 60, 150]) {
      expect(
        SchedulingAssignmentSchema.safeParse({
          ...validAssignment,
          estimatedMinutes,
        }).success,
      ).toBe(true);
    }

    for (const estimatedMinutes of [0, -30, 12.5, Infinity, -Infinity, NaN, '90']) {
      expect(
        SchedulingAssignmentSchema.safeParse({
          ...validAssignment,
          estimatedMinutes,
        }).success,
      ).toBe(false);
    }
  });

  // 4. Check that missing fields and incorrect types are rejected.
  it('assignment-validation-1 rejects missing fields and incorrect types', () => {
    for (const field of ['title', 'deadline', 'estimatedMinutes'] as const) {
      const missing: Record<string, unknown> = { ...validAssignment };
      delete missing[field];

      expect(SchedulingAssignmentSchema.safeParse(missing).success).toBe(false);
    }

    for (const invalid of [
      null,
      [],
      'assignment',
      { ...validAssignment, title: 123 },
      { ...validAssignment, deadline: 123 },
      { ...validAssignment, estimatedMinutes: true },
    ]) {
      expect(SchedulingAssignmentSchema.safeParse(invalid).success).toBe(false);
    }
  });

  // 5. Check that invalid fields are identified in validation issues.
  it('assignment-validation-1 identifies invalid fields in validation issues', () => {
    const result = SchedulingAssignmentSchema.safeParse({
      title: ' ',
      deadline: 'invalid',
      estimatedMinutes: 0,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected invalid assignment to fail');
    }

    const fields = result.error.issues.map((issue) => issue.path[0]);

    expect(fields).toContain('title');
    expect(fields).toContain('deadline');
    expect(fields).toContain('estimatedMinutes');

    for (const issue of result.error.issues) {
      expect(issue.message.length).toBeGreaterThan(0);
    }
  });

  // 6. Check that unknown fields are stripped from the parsed result.
  it('assignment-validation-1 strips unknown fields including priority', () => {
    const result = SchedulingAssignmentSchema.parse({
      ...validAssignment,
      priority: 'high',
      userId: 'another-user',
      extra: 'not needed',
    });

    expect(result).toEqual(validAssignment);
    expect(result).not.toHaveProperty('priority');
    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('extra');
  });
});
