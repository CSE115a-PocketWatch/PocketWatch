import { describe, expect, it } from 'vitest';
import {
  AssignmentSchema,
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
} from './assignment.js';

const validCreate = {
  title: 'CSE 115A sprint report',
  deadline: '2026-11-20T23:59:00-08:00',
  estimatedMinutes: 90,
  priority: 'high',
};

describe('CreateAssignmentSchema', () => {
  it('accepts a valid assignment', () => {
    expect(CreateAssignmentSchema.safeParse(validCreate).success).toBe(true);
  });

  it('defaults priority to medium', () => {
    const { priority, ...noPriority } = validCreate;
    expect(CreateAssignmentSchema.parse(noPriority).priority).toBe('medium');
  });

  it('trims the title and rejects an empty one', () => {
    expect(CreateAssignmentSchema.safeParse({ ...validCreate, title: '   ' }).success).toBe(false);
  });

  it('rejects zero, negative, or fractional time estimates', () => {
    for (const estimatedMinutes of [0, -30, 12.5]) {
      expect(CreateAssignmentSchema.safeParse({ ...validCreate, estimatedMinutes }).success).toBe(false);
    }
  });

  it('rejects a deadline that is not an ISO date-time', () => {
    expect(CreateAssignmentSchema.safeParse({ ...validCreate, deadline: 'next friday' }).success).toBe(false);
  });

  it('rejects an unknown priority', () => {
    expect(CreateAssignmentSchema.safeParse({ ...validCreate, priority: 'urgent' }).success).toBe(false);
  });

  it('ignores a userId sent by the client', () => {
    const parsed = CreateAssignmentSchema.parse({ ...validCreate, userId: 'someone-else' });
    expect(parsed).not.toHaveProperty('userId');
  });
});

describe('UpdateAssignmentSchema', () => {
  it('accepts a single changed field', () => {
    expect(UpdateAssignmentSchema.safeParse({ status: 'done' }).success).toBe(true);
  });

  it('rejects an empty update', () => {
    expect(UpdateAssignmentSchema.safeParse({}).success).toBe(false);
  });
});

describe('AssignmentSchema', () => {
  it('requires id and status', () => {
    expect(AssignmentSchema.safeParse({ ...validCreate, description: null }).success).toBe(false);
    expect(
      AssignmentSchema.safeParse({ ...validCreate, id: 'a1', description: null, status: 'todo' }).success,
    ).toBe(true);
  });
});