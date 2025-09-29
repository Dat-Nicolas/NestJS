import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';
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
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'bkav-server',
        brokers: [process.env.KAFKA_BROKERS_INTERNAL || 'kafka:9092'],
      },
      consumer: {
        groupId: 'bkav-server-consumer',
        allowAutoTopicCreation: true,
      },
    },
  });
  app.enableCors({
    origin: ['http://localhost:4001', 'http://localhost:5173'],       
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
