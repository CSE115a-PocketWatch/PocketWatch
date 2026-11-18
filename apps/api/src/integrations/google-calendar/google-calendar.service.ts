import { BadGatewayException, Injectable } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { AuthService } from '../../auth/auth.service.js';
import { BusyTime, toBusyTimes } from './busy-times.js';

export type BusyTimesResult = { timeZone: string; busy: BusyTime[] };

@Injectable()
export class GoogleCalendarService {
  constructor(private readonly authService: AuthService) {}

  async createTestEvent(accessToken: string) {
    const calendar = this.calendarClient(accessToken);

    // Start one hour from now and last 30 minutes.
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'PocketWatch Test Study Session',
        description: 'Test event created by PocketWatch.',
        start: {
          dateTime: start.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
      },
    });

    return {
      eventId: response.data.id,
      eventUrl: response.data.htmlLink,
    };
  }

  // Returns when the user is already busy on their primary calendar between from and to.
  async getBusyTimes(userId: string, from: Date, to: Date): Promise<BusyTimesResult> {
    // Throws 401 if the user hasn't granted Google access.
    const accessToken = await this.authService.getAccessToken(userId);
    const { events, timeZone } = await this.listEvents(accessToken, from, to);
    return { timeZone, busy: toBusyTimes(events, from, to) };
  }

  // Reads every event in the range, following Google's pages of results.
  private async listEvents(
    accessToken: string,
    from: Date,
    to: Date,
  ): Promise<{ events: calendar_v3.Schema$Event[]; timeZone: string }> {
    const calendar = this.calendarClient(accessToken);
    const events: calendar_v3.Schema$Event[] = [];
    let timeZone = 'UTC';
    let pageToken: string | undefined;

    try {
      do {
        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          // Google expands recurring events into one event per occurrence.
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250,
          pageToken,
        });
        events.push(...(response.data.items ?? []));
        timeZone = response.data.timeZone ?? timeZone;
        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);
    } catch {
      // Google failed (revoked permission, outage, etc.), not our server.
      throw new BadGatewayException('Could not read Google Calendar');
    }

    return { events, timeZone };
  }

  // A Calendar API client that acts as the user.
  private calendarClient(accessToken: string): calendar_v3.Calendar {
    const auth = new google.auth.OAuth2();

    auth.setCredentials({
      access_token: accessToken,
    });

    return google.calendar({
      version: 'v3',
      auth,
    });
  }
}
