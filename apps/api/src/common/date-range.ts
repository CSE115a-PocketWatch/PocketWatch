import { BadRequestException } from '@nestjs/common';

// Longest range one request can ask for, so a single call can't read years of events.
export const MAX_RANGE_MS = 62 * 24 * 60 * 60 * 1000;

// date-time that ends in Z or an offset like -08:00, so it's an exact moment.
const ISO_WITH_TIME_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// Parses a date-time value (like from/to or a deadline), or rejects the request with 400.
export function parseDateTime(name: string, value: unknown): Date {
  if (typeof value !== 'string' || !ISO_WITH_TIME_ZONE.test(value)) {
    throw new BadRequestException(`${name} must be an ISO date-time with a time zone`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${name} is not a valid date-time`);
  }
  return date;
}

// Parses the from/to query values shared by calendar and scheduling routes, or rejects with 400.
export function parseDateRange(fromParam: unknown, toParam: unknown): { from: Date; to: Date } {
  const from = parseDateTime('from', fromParam);
  const to = parseDateTime('to', toParam);
  if (from >= to) {
    throw new BadRequestException('from must be before to');
  }
  if (to.getTime() - from.getTime() > MAX_RANGE_MS) {
    throw new BadRequestException('Range must be 62 days or less');
  }
  return { from, to };
}
