import { randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { PrismaService } from '../database/prisma.service.js';
import { decryptToken, encryptToken } from './token-crypto.js';

// Google's endpoint for exchanging a refresh token for a new access token.
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// How long a sign-in lasts before the user has to sign in again.
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Never includes googleRefreshToken, so it's safe to return from routes.
const authUserSelect = { id: true, email: true, name: true, avatarUrl: true } as const;
export type AuthUser = { id: string; email: string; name: string | null; avatarUrl: string | null };

// Sign-in logic: saving users and getting Google tokens for them.
@Injectable()
export class AuthService {
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    // The key is stored in .env as base64 text; convert it back to raw bytes.
    this.encryptionKey = Buffer.from(config.getOrThrow<string>('TOKEN_ENCRYPTION_KEY'), 'base64');
    // AES-256 needs exactly 32 bytes. Fail at startup instead of on every sign-in.
    if (this.encryptionKey.length !== 32) {
      throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded');
    }
  }

  // Find by googleId, otherwise create. Profile fields are refreshed on every sign-in.
  async upsertUser(profile: Profile, refreshToken: string | undefined): Promise<AuthUser> {
    // Email is required by the User table.
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    // Columns to save from the Google profile.
    const fields = {
      email,
      name: profile.displayName || null,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      // Keep the stored token if Google didn't send a new one.
      ...(refreshToken && { googleRefreshToken: encryptToken(refreshToken, this.encryptionKey) }),
    };

    // Update the user if they exist, otherwise create them. googleId never changes, unlike email.
    return this.prisma.user.upsert({
      where: { googleId: profile.id },
      update: fields,
      create: { googleId: profile.id, ...fields },
      select: authUserSelect,
    });
  }

  // Creates a session for the user and returns its ID (stored in the cookie).
  async createSession(userId: string): Promise<string> {
    // Random and unguessable, since anyone with this ID is signed in as the user.
    const id = randomBytes(32).toString('base64url');
    await this.prisma.session.create({
      data: { id, userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
    });
    return id;
  }

  // Looks up who a session cookie belongs to. Returns null if it's missing or expired.
  async getUserFromSession(sessionId: string): Promise<AuthUser | null> {
    // Load the session together with its user (safe fields only, never the token).
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { expiresAt: true, user: { select: authUserSelect } },
    });
    if (!session) {
      return null;
    }

    // Expired sessions don't count. Delete them as we find them to keep the table clean.
    if (session.expiresAt < new Date()) {
      await this.prisma.session.deleteMany({ where: { id: sessionId } });
      return null;
    }

    return session.user;
  }

  // Returns a fresh Google access token for calling Google APIs (e.g. Calendar) on the user's behalf.
  async getAccessToken(userId: string): Promise<string> {
    // Load only the encrypted refresh token.
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });
    if (!user.googleRefreshToken) {
      throw new UnauthorizedException('User has not granted Google access');
    }

    // Ask Google for a new access token using the user's refresh token.
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        refresh_token: decryptToken(user.googleRefreshToken, this.encryptionKey),
        grant_type: 'refresh_token',
      }),
    });
    // Usually means the user revoked access, so they need to sign in again.
    if (!response.ok) {
      throw new UnauthorizedException('Google rejected the refresh token');
    }

    // Access tokens expire after about an hour, so callers should get a new one each time.
    const { access_token } = (await response.json()) as { access_token: string };
    return access_token;
  }
}
