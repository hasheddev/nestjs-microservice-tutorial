import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostExistsPipe implements PipeTransform {
  constructor(private readonly postService: PostsService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: number, metadata: ArgumentMetadata) {
    try {
      this.postService.findOne(value);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new NotFoundException(`Post with ID ${value} not found`);
    }
    return value;
  }
}
