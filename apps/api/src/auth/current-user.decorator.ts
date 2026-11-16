import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthUser } from './auth.service.js';

// Gives a route handler the signed-in user: me(@CurrentUser() user: AuthUser).
// Only use on routes protected by SessionGuard, which sets req.user.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<Request>().user as AuthUser,
);
