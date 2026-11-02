import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
    });
  }

  // Google only returns a refresh token for offline access, and only on consent.
  authorizationParams(): Record<string, string> {
    return { access_type: 'offline', prompt: 'consent' };
  }

  validate(_accessToken: string, refreshToken: string, profile: Profile) {
    console.log(profile, refreshToken);
    return profile;
  }
}
