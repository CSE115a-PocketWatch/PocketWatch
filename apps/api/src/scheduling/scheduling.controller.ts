import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { SessionGuard } from '../auth/session.guard.js';
import { parseDateRange } from '../common/date-range.js';
import { GoogleCalendarService } from '../integrations/google-calendar/google-calendar.service.js';
import { DEFAULT_AVAILABILITY } from './availability.js';
import { findFreeSlots, TimeSlot } from './free-slots.js';

export type FreeSlotsResult = { timeZone: string; free: TimeSlot[] };

// All routes here start with /schedule.
@Controller('schedule')
export class SchedulingController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  // GET /schedule/free-slots?from=...&to=...: when the signed-in user is free to study.
  @Get('free-slots')
  @UseGuards(SessionGuard)
  async freeSlots(
    @CurrentUser() user: AuthUser,
    @Query('from') fromParam: unknown,
    @Query('to') toParam: unknown,
  ): Promise<FreeSlotsResult> {
    const { from, to } = parseDateRange(fromParam, toParam);
    const { timeZone, busy } = await this.googleCalendarService.getBusyTimes(user.id, from, to);

    // Saved study preferences don't exist yet, so use the default availability.
    return { timeZone, free: findFreeSlots(DEFAULT_AVAILABILITY, busy, from, to, timeZone) };
  }
}
