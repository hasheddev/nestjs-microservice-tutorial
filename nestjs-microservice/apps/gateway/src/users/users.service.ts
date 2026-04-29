import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './models/user.schema';

export interface Input {
  clerkUserId: string;
  email: string;
  name: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async upsertAuthUser(input: Input) {
    const now = new Date();

    return this.userModel.findOneAndUpdate(
      {
        clerkUserId: input.clerkUserId,
      },
      {
        $set: {
          email: input.email,
          name: input.name,
          lastSeenAt: now,
        },
        $setOnInsert: {
          clerkUserId: input.clerkUserId,
          role: 'user',
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        returnDocument: 'after',
      },
    );
  }

  async findByClerkUserId(clerkUserId: string) {
    const user = await this.userModel.findOne({ clerkUserId });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }
}
