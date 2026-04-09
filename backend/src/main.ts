import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,              // strips properties not in the DTO
    forbidNonWhitelisted: true,   // throws 400 if unknown fields are sent
  }),
);  await app.listen(process.env.PORT || 3001);
}
bootstrap();
