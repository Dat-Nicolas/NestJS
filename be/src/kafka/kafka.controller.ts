import { Public } from '@/decorator/customize';
import { Controller, Post, Body, OnModuleInit, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('kafka')
export class KafkaController implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    await this.kafka.connect(); 
  }

  @Post('test')
  @Public()
  async send(@Body() body: any) {
    const topic = process.env.KAFKA_TOPIC || 'test-topic';
    this.kafka.emit(topic, body ?? { hello: 'world' });
    return { ok: true, topic, body };
  }
}
