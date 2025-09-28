import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true , transform : true }));
  app.setGlobalPrefix('api', { exclude: ['/'] });
  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'API Docs',
  });
  await app.listen(port);
}
bootstrap();
