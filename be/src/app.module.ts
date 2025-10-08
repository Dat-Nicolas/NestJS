import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { LikesModule } from '@/modules/likes/likes.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemOptionsModule } from '@/modules/menu.item.options/menu.item.options.module';
import { MenuItemsModule } from '@/modules/menu.items/menu.items.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { OrderDetailModule } from '@/modules/order.detail/order.detail.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TransformInterceptor } from './core/transform.interceptor';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { KafkaController } from './kafka/kafka.controller';
import { KafkaConsumerController } from './kafka/kafka.consumer';
import { SearchModule } from './search/search.module';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    UsersModule,
    LikesModule,
    MenuItemOptionsModule,
    MenuItemsModule,
    MenusModule,
    OrderDetailModule,
    OrdersModule,
    RestaurantsModule,
    ReviewsModule,
    AuthModule,
    SearchModule,
    ChatModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          // ignoreTLS: true,
          // secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        // preview: true,
        template: {
          dir: process.cwd() + '/src/mail/template/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS_INTERNAL || 'kafka:9092'],
          },
          consumer: { groupId: 'my-consumer' },
        },
      },
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: cfg.get('REDIS_HOST') ?? '127.0.0.1',
            port: Number(cfg.get('REDIS_PORT') ?? 6379),
          },
          password: cfg.get('REDIS_PASSWORD') || undefined,
          ttl: 30_000, // ms – TTL mặc định (30s)
        }),
        // max: 0 // Redis là remote store, không cần LRU local
      }),
    }),
    
    //  GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // code-first: tự sinh schema
    //   sortSchema: true,
    //   playground: true, // tắt ở prod nếu cần
    //   subscriptions: {
    //     // dùng graphql-ws (chuẩn mới)
    //     'graphql-ws': true,
    //   },
    //   context: ({ req, connectionParams }) => {
    //     // nhét user vào context (JWT ở HTTP/WS)
    //     const authHeader = req?.headers?.authorization ?? connectionParams?.Authorization ?? connectionParams?.authorization;
    //     return { authHeader };
    //   },
    //   cors: {
    //     origin: ['http://localhost:4001', 'http://localhost:5173'],
    //     credentials: true,
    //   },
    // }),
  ],
  controllers: [AppController, KafkaController, KafkaConsumerController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
