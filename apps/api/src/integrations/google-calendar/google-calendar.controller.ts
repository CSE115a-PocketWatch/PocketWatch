import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../../auth/auth.service.js';
import { CurrentUser } from '../../auth/current-user.decorator.js';
import { SessionGuard } from '../../auth/session.guard.js';
import { BusyTimesResult, GoogleCalendarService } from './google-calendar.service.js';

// Longest range one request can ask for, so a single call can't read years of events.
const MAX_RANGE_MS = 62 * 24 * 60 * 60 * 1000;

// date-time that ends in Z or an offset like -08:00, so it's an exact moment.
const ISO_WITH_TIME_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// Parses a from/to query value, or rejects the request with 400.
function parseDateTime(name: string, value: unknown): Date {
  if (typeof value !== 'string' || !ISO_WITH_TIME_ZONE.test(value)) {
    throw new BadRequestException(`${name} must be an ISO date-time with a time zone`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${name} is not a valid date-time`);
  }
  return date;
}

// All routes here start with /calendar.
@Controller('calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  // GET /calendar/busy?from=...&to=...: when the signed-in user is already busy.
  @Get('busy')
  @UseGuards(SessionGuard)
  async busy(
    @CurrentUser() user: AuthUser,
    @Query('from') fromParam: unknown,
    @Query('to') toParam: unknown,
  ): Promise<BusyTimesResult> {
    const from = parseDateTime('from', fromParam);
    const to = parseDateTime('to', toParam);
    if (from >= to) {
      throw new BadRequestException('from must be before to');
    }
    if (to.getTime() - from.getTime() > MAX_RANGE_MS) {
      throw new BadRequestException('Range must be 62 days or less');
    }

    return this.googleCalendarService.getBusyTimes(user.id, from, to);
  }
}
