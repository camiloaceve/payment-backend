import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';

console.log('--- LOADING MAIN.SERVERLESS.JS ---');

let server: any;

async function bootstrap() {
  console.log('--- RUNNING BOOTSTRAP ---');
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

const handler = async (event: any, context: any) => {
  console.log('--- RUNNING HANDLER ---');
  server = server ?? (await bootstrap());
  return server(event, context);
};

// Export in all possible ways to appease AWS Lambda ESM/CJS loaders
module.exports = { handler };
module.exports.handler = handler;
module.exports.default = handler;
export default handler;
