import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  getAllUserById(@Param('id', ParseIntPipe) id: number) {
    const user = this.userService.getUserById(id);
    return user ? user : { error: 'User Not Found' };
  }

  @Get(':id/welcome')
  getWelcome(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getWelcomeMessage(id);
  }
}
