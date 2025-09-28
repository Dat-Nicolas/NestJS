import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('KAFKA_SERVICE') private kafka: ClientKafka) {}
  @CacheKey('hello')
  @CacheTTL(10)
  getHello(): string {
    return 'Hello World!';
  }
  async sendOrderCreated(data: any) {
    await this.kafka.emit('order.created', data);
  }
}
