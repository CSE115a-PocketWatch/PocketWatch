import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './auth.service.js';

@Controller('auth')
export class AuthController {
  // The guard redirects to Google's sign-in page, so this body never runs.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: { user: AuthUser }) {
    return req.user;
  }
}
