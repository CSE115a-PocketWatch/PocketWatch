import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../../auth/auth.service.js';
import { CurrentUser } from '../../auth/current-user.decorator.js';
import { SessionGuard } from '../../auth/session.guard.js';
import { parseDateRange } from '../../common/date-range.js';
import { BusyTimesResult, GoogleCalendarService } from './google-calendar.service.js';

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
    const { from, to } = parseDateRange(fromParam, toParam);
    return this.googleCalendarService.getBusyTimes(user.id, from, to);
  }
}
