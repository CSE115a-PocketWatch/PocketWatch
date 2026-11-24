import { BadRequestException } from '@nestjs/common';
import { MAX_RANGE_MS, parseDateTime } from '../common/date-range.js';
import type { PlacementAssignment } from '../schedule/session-placement.js';

const MAX_ASSIGNMENTS = 50;

// Sessions start on a quarter hour, so the schedule begins at the next one after now.
const QUARTER_HOUR_MS = 15 * 60 * 1000;

export type GenerateRequest = { assignments: PlacementAssignment[]; from: Date; to: Date };

// Checks the request body and works out the range to schedule in, or rejects with 400.
export function parseGenerateRequest(body: unknown, now: Date): GenerateRequest {
  const list = (body as { assignments?: unknown } | null)?.assignments;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_ASSIGNMENTS) {
    throw new BadRequestException(`assignments must be a list of 1 to ${MAX_ASSIGNMENTS} items`);
  }

  const seenIds = new Set<string>();
  const assignments = list.map((item, index): PlacementAssignment => {
    const { id, deadline, estimatedMinutes } = (item ?? {}) as Record<string, unknown>;

    if (typeof id !== 'string' || id.trim() === '' || seenIds.has(id)) {
      throw new BadRequestException(`assignments[${index}].id must be a unique, non-empty string`);
    }
    seenIds.add(id);

    parseDateTime(`assignments[${index}].deadline`, deadline);

    if (!Number.isSafeInteger(estimatedMinutes) || (estimatedMinutes as number) <= 0) {
      throw new BadRequestException(`assignments[${index}].estimatedMinutes must be a positive whole number`);
    }

    return { id, deadline: deadline as string, estimatedMinutes: estimatedMinutes as number };
  });

  // From the next quarter hour (never in the past) to the latest deadline, up to 62 days.
  const from = new Date(Math.ceil(now.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS);
  const latestDeadline = Math.max(...assignments.map((assignment) => Date.parse(assignment.deadline)));
  if (latestDeadline <= from.getTime()) {
    throw new BadRequestException('At least one deadline must be in the future');
  }
  const to = new Date(Math.min(latestDeadline, from.getTime() + MAX_RANGE_MS));

  return { assignments, from, to };
}
