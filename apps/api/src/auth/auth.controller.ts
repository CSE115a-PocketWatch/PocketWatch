import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Profile } from 'passport-google-oauth20';

@Controller('auth')
export class AuthController {
  // The guard redirects to Google's sign-in page, so this body never runs.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: { user: Profile }) {
    return req.user;
  }
}
