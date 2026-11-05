import { Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService, AuthUser, SESSION_COOKIE, SESSION_TTL_MS } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { SessionGuard } from './session.guard.js';

// Shared by setting and clearing the cookie. The browser only clears it if these match.
const sessionCookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript in the page can't read it
  sameSite: 'lax', // other sites can't use it in POST requests
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  path: '/',
};

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
    // It expires at the same time as the session.
    res.cookie(SESSION_COOKIE, sessionId, { ...sessionCookieOptions, maxAge: SESSION_TTL_MS });

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

  // POST /auth/logout: ends the session and removes the cookie.
  // Not guarded, so logging out twice (or with an expired session) still succeeds.
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const sessionId: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof sessionId === 'string') {
      await this.authService.deleteSession(sessionId);
    }
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
  }

  // POST /auth/logout-all: signs the current user out on every device.
  @Post('logout-all')
  @HttpCode(204) // Success, with no response body.
  @UseGuards(SessionGuard) // Reject requests without a valid session.
  async logoutAll(
    // Get the user from their session
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.deleteAllSessions(user.id);
    // Remove this browser's cookie. Other devices' cookies no longer
    // work because their sessions have been deleted.
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
  }
}
