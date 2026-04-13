import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { FindPostQueryDto } from './dto/find-post-query.dto';
import { PaginatedResponse } from 'src/common/interface/pagination-response.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(
    @Query() query: FindPostQueryDto,
  ): Promise<PaginatedResponse<PostEntity>> {
    return this.postsService.findAll(query);
  }

  //findOne(@Param('id', ParseIntPipe, PostExistsPipe)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(
    @Body() createPostData: CreatePostDto,
    @CurrentUser() user: Omit<User, 'posts' | 'password'>,
  ): Promise<PostEntity> {
    return this.postsService.create(createPostData, user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updatePostData: UpdatePostDto,
    @CurrentUser() user: Omit<User, 'posts' | 'password'>,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostData, user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deletePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Omit<User, 'posts' | 'password'>,
  ): Promise<void> {
    return this.postsService.delete(id, user);
  }
}
