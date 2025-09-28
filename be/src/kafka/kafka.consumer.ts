import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ClientKafka, MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class KafkaConsumerController {
  @MessagePattern(process.env.KAFKA_TOPIC || 'test-topic')
  handleTest(@Payload() message: any) {
    console.log('[Kafka][consume]', JSON.stringify(message.value?.toString?.() ?? message, null, 2));
  }
}

// kafka.controller.ts
@Controller('kafka')
export class KafkaController {
  constructor(@Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka) {}

  @Post('test')
  async send(@Body() body: any) {
    const topic = process.env.KAFKA_TOPIC || 'test-topic';
    this.kafka.emit(topic, body ?? { hello: 'world' });
    return { ok: true, topic, body };
  }
}
