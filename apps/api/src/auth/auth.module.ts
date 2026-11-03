import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleStrategy } from './google.strategy.js';

// Groups everything related to signing in.
@Module({
  // Handles the /auth routes.
  controllers: [AuthController],
  // Classes Nest creates and injects where they're needed.
  providers: [AuthService, GoogleStrategy],
  // Lets other modules (e.g. Calendar) use AuthService.getAccessToken().
  exports: [AuthService],
})
export class AuthModule {}
