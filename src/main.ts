import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permite peticiones desde el Frontend (React Native Web, etc.)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
