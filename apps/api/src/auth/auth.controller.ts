import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService, AuthUser, SESSION_COOKIE, SESSION_TTL_MS } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { SessionGuard } from './session.guard.js';

// All routes here start with /auth.
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // GET /auth/google: starts sign-in.
  // The guard redirects to Google's sign-in page, so this body never runs.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  // GET /auth/google/callback: Google sends the user back here after they approve.
  // The guard finishes sign-in and puts the saved user on req.user.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: { user: AuthUser }, @Res() res: Response): Promise<void> {
    const sessionId = await this.authService.createSession(req.user.id);

    // The browser sends this cookie back on every request, so the API knows who it is.
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true, // JavaScript in the page can't read it
      sameSite: 'lax', // other sites can't use it in POST requests
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: SESSION_TTL_MS, // expires with the session
      path: '/',
    });

    // Send the user back to the app.
    res.redirect(this.config.getOrThrow<string>('FRONTEND_URL'));
  }

  // GET /auth/me: returns the signed-in user, or 401 if not signed in.
  // The frontend calls this to check whether someone is logged in.
  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
