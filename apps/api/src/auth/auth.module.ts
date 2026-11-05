import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleStrategy } from './google.strategy.js';
import { SessionGuard } from './session.guard.js';
import { SessionCleanupService } from './session-cleanup.service.js';

// Groups everything related to signing in.
@Module({
  // Handles the /auth routes.
  controllers: [AuthController],
  // Classes Nest creates and injects where they're needed.
  providers: [AuthService, GoogleStrategy, SessionGuard, SessionCleanupService],
  // Lets other modules (e.g. Calendar) use AuthService.getAccessToken() and protect routes with SessionGuard.
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
