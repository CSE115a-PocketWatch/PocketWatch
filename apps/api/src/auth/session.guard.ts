import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, SESSION_COOKIE } from './auth.service.js';

// Only lets a request through if it has a valid session cookie.
// Use on any route that needs a signed-in user: @UseGuards(SessionGuard)
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // cookie-parser (set up in main.ts) puts the browser's cookies here.
    const sessionId: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof sessionId !== 'string') {
      throw new UnauthorizedException('Not signed in');
    }

    const user = await this.authService.getUserFromSession(sessionId);
    if (!user) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Make the user available to the route handler.
    req.user = user;
    return true;
  }
}
