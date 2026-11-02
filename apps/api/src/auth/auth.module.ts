import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { GoogleStrategy } from './google.strategy.js';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy],
})
export class AuthModule {}
