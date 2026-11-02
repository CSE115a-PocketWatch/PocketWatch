import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService, AuthUser } from './auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar.events'],
    });
  }

  // Google only returns a refresh token for offline access, and only on consent.
  authorizationParams(): Record<string, string> {
    return { access_type: 'offline', prompt: 'consent' };
  }

  validate(_accessToken: string, refreshToken: string, profile: Profile): Promise<AuthUser> {
    return this.authService.upsertUser(profile, refreshToken);
  }
}
