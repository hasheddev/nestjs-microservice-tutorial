import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { FindPostQueryDto } from './dto/find-post-query.dto';
import { PaginatedResponse } from 'src/common/interface/pagination-response.interface';

@Injectable()
export class PostsService {
  private postListCacheKeys: Set<string> = new Set();

  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: FindPostQueryDto): Promise<PaginatedResponse<Post>> {
    const cacheKey = this.generatePostListCacheKey(query);
    this.postListCacheKeys.add(cacheKey);
    const cachedData =
      await this.cacheManager.get<PaginatedResponse<Post>>(cacheKey);
    if (cachedData) {
      console.log(`Caache hit ------> Returning posts for key ${cacheKey}`);
      return cachedData;
    }
    console.log(`cache Miss ------> Returning data from Db`);
    const { page = 1, limit = 10, title } = query;
    const skip = (page - 1) * limit;
    const queyBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (title) {
      queyBuilder.andWhere('post.title ILIKE :title', { title: `%${title}%` });
    }
    const [items, totalItems] = await queyBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);
    const resposnse: PaginatedResponse<Post> = {
      items,
      metadata: {
        currentPage: page,
        perPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
    await this.cacheManager.set(cacheKey, resposnse, 30000);
    return resposnse;
  }

  async findOne(id: number): Promise<Post> {
    const cacheKey = `post_${id}`;
    const cachedPost = await this.cacheManager.get<Post>(cacheKey);
    if (cachedPost) {
      console.log('Cache Hit returning post');
      return cachedPost;
    }

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException(`Post with Id ${id} not found`);
    console.log('Cache Miss returning Post from db');
    await this.cacheManager.set(cacheKey, post, 30000);
    return post;
  }

  async create(
    createPostData: CreatePostDto,
    user: Omit<User, 'posts' | 'password'>,
  ): Promise<Post> {
    const { title, content } = createPostData;
    const newPost = this.postRepository.create({
      title,
      content,
      author: user,
    });
    await this.invalidateAllExistingListCache();
    return this.postRepository.save(newPost);
  }

  async update(
    id: number,
    updatePostData: UpdatePostDto,
    user: Omit<User, 'posts' | 'password'>,
  ): Promise<Post> {
    const { authorId, ...rest } = updatePostData;
    const post = await this.findOne(id);

    if (user.role !== UserRole.Admin && post.author.id !== user.id) {
      throw new ForbiddenException('update unauthorized');
    }
    if (authorId) {
      post.author = { id: authorId } as User;
    }

    Object.assign(post, rest);

    const updatedPost = await this.postRepository.save(post);
    await this.cacheManager.del(`post_${updatedPost.id}`);
    await this.invalidateAllExistingListCache();
    return updatedPost;
  }

  async delete(
    id: number,
    user: Omit<User, 'posts' | 'password'>,
  ): Promise<void> {
    const post = await this.findOne(id);
    if (user.role !== UserRole.Admin && post.author.id !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.postRepository.remove(post);
    await this.cacheManager.del(`post_${id}`);
    await this.invalidateAllExistingListCache();
  }

  private async invalidateAllExistingListCache() {
    console.log(`Invalidating cache of size ${this.postListCacheKeys.size}`);
    for (const key of this.postListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.postListCacheKeys.clear();
  }

  private generatePostListCacheKey(query: FindPostQueryDto) {
    const { page = 1, limit = 10, title } = query;
    const sanitizedTitle = title ? title.trim().toLowerCase() : 'any';

    return `posts:list:p${page}:l${limit}:t:${sanitizedTitle}`;
  }
}
