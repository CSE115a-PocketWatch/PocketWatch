import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './auth.service.js';

// All routes here start with /auth.
@Controller('auth')
export class AuthController {
  // GET /auth/google: starts sign-in.
  // The guard redirects to Google's sign-in page, so this body never runs.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  // GET /auth/google/callback: Google sends the user back here after they approve.
  // The guard finishes sign-in and puts the saved user on req.user.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: { user: AuthUser }) {
    return req.user;
  }
}
