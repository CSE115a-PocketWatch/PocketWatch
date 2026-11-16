import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port);

  console.log(`PocketWatch API running on port ${port}`);
}

void bootstrap();

