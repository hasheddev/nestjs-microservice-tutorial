import { Injectable } from '@nestjs/common';
import { HelloService } from 'src/hello/hello.service';
import { DUMMY_USERS } from './users.data';

@Injectable()
export class UsersService {
  constructor(private readonly helloService: HelloService) {}

  getAllUsers() {
    return DUMMY_USERS;
  }

  getUserById(id: number) {
    return this.getAllUsers().find((user) => user.id === id);
  }

  getWelcomeMessage(userId: number) {
    const user = this.getUserById(userId);
    if (!user) return 'User not found';
    return this.helloService.getHelloWithName(user.username);
  }
}
