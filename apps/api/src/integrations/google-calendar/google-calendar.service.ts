import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  async createTestEvent(accessToken: string) {
    const auth = new google.auth.OAuth2();

    auth.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth,
    });

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
}