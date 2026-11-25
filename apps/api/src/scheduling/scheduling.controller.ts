import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { SessionGuard } from '../auth/session.guard.js';
import { parseDateRange } from '../common/date-range.js';
import { GoogleCalendarService } from '../integrations/google-calendar/google-calendar.service.js';
import { placeSessions, PlacementResult } from '../schedule/session-placement.js';
import { DEFAULT_AVAILABILITY } from './availability.js';
import { findFreeSlots, TimeSlot } from './free-slots.js';
import { parseGenerateRequest } from './generate-request.js';
import { DEFAULT_STUDY_LIMITS } from './study-limits.js';

export type FreeSlotsResult = { timeZone: string; free: TimeSlot[] };
export type GeneratedSchedule = { timeZone: string } & PlacementResult;

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

  // POST /schedule/generate: a draft study plan for the given assignments. Nothing is saved.
  @Post('generate')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  async generate(@CurrentUser() user: AuthUser, @Body() body: unknown): Promise<GeneratedSchedule> {
    const { assignments, from, to } = parseGenerateRequest(body, new Date());
    const { timeZone, busy } = await this.googleCalendarService.getBusyTimes(user.id, from, to);

    // Keep free gaps as short as the minimum session so they can still be used.
    const availability = { ...DEFAULT_AVAILABILITY, sessionLengthMinutes: DEFAULT_STUDY_LIMITS.minSessionMinutes };
    const free = findFreeSlots(availability, busy, from, to, timeZone);

    try {
      return { timeZone, ...placeSessions(assignments, free, DEFAULT_STUDY_LIMITS, timeZone) };
    } catch (error) {
      // placeSessions does its own strict checks (like Feb 30); treat those as bad input.
      if (error instanceof RangeError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
