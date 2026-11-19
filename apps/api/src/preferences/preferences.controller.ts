import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { SessionGuard } from '../auth/session.guard.js';
import type { AuthUser } from '../auth/auth.service.js';
import { PreferencesService } from './preferences.service.js';
import { validatePreferences } from './preferences.validation.js';

@Controller('preferences')
@UseGuards(SessionGuard)
export class PreferencesController {
  constructor(
    private readonly preferencesService: PreferencesService,
  ) {}

  @Get()
  getPreferences(@CurrentUser() user: AuthUser) {
    return this.preferencesService.getPreferences(user.id);
  }

  @Put()
  updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body() body: unknown,
  ) {
    const preferences = validatePreferences(body);

    return this.preferencesService.updatePreferences(
      user.id,
      preferences,
    );
  }
}
