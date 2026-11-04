import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService, AuthUser } from './auth.service.js';

// Tells Passport how to sign in with Google. Registered under the name 'google',
// which is what AuthGuard('google') uses.
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // Our app's credentials from Google Cloud (stored in .env).
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      // Where Google sends the user back. Must match the redirect URI in Google Cloud.
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      // What we ask permission for: basic profile info, plus creating calendar events.
      scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar.events'],
    });
  }

  // Google only returns a refresh token for offline access, and only on consent.
  authorizationParams(): Record<string, string> {
    return { access_type: 'offline', prompt: 'consent' };
  }

  // Runs after Google signs the user in. Whatever we return becomes req.user.
  validate(_accessToken: string, refreshToken: string, profile: Profile): Promise<AuthUser> {
    return this.authService.upsertUser(profile, refreshToken);
  }
}
