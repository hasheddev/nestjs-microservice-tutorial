import { Controller, Get, Param, Query } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  getHello(): string {
    return this.helloService.getHello();
  }

  @Get('/user/:name')
  getHelloUserParam(@Param('name') name: string): string {
    return this.helloService.getHelloWithName(name);
  }

  @Get('/user')
  getHelloUserQuery(@Query('name') name: string): string {
    return this.helloService.getHelloWithName(name || 'World');
  }
}
