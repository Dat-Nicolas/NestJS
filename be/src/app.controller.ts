import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @MessagePattern('order.created')
  handleOrderCreated(@Payload() message: any) {
    console.log('Order Created:', message.value);
  }
}
