import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../auth/current-user.decorator';
import { type UserContext } from '../auth/auth.type';
import { mapAllRpcErrorToHttp } from '@app/rpc';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

type Input = {
  name: string;
  description: string;
  price: number;
  status?: string;
  imageUrl?: string;
};

type Media = {
  mediaExists: boolean;
  mediaId: string;
  productId: string;
  publicId: string;
  userId: string;
};

type uploadResonse = { mediaId: string; url: string; uploaderUserId: string };

type Product = Pick<Input, 'name' | 'description' | 'imageUrl' | 'price'> & {
  _id: string;
  status: 'Draft' | 'Active';
  createdByClerkUserId: string;
};

@Controller('products')
export class ProductshttpController {
  constructor(
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
  ) {}

  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @Post('new')
  async createProduct(
    @CurrentUser() user: UserContext,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Input,
  ) {
    let imageUrl: string | undefined;
    let mediaId: string | undefined;

    if (file) {
      const base64 = file.buffer.toString('base64');
      try {
        const uploadResullt = await firstValueFrom<uploadResonse>(
          this.mediaClient.send('media:uploadImage', {
            fileName: file.originalname,
            mimeType: file.mimetype,
            base64,
            uploaderUserId: user.clerkUserId,
          }),
        );
        imageUrl = uploadResullt.url;
        mediaId = uploadResullt.mediaId;
      } catch (error) {
        mapAllRpcErrorToHttp(error);
      }
    }
    const payload = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      createdByClerkUserId: user.clerkUserId,
      status: body.status,
      imageUrl,
    };
    try {
      const product = await firstValueFrom(
        this.catalogClient.send<Product>('product:create', payload),
      );
      if (mediaId) {
        try {
          await firstValueFrom(
            this.mediaClient.send('media:attachImageToProduct', {
              mediaId,
              productId: String(product._id),
            }),
          );
        } catch (error) {
          mapAllRpcErrorToHttp(error);
        }
      }

      return product;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }

  @Public()
  @Get()
  async getAllProducts() {
    try {
      const products = await firstValueFrom(
        this.catalogClient.send<Product[]>('product:list', {}),
      );
      return products;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    try {
      const product = await firstValueFrom(
        this.catalogClient.send<boolean>('product:getById', { id }),
      );
      return product;
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    try {
      const productMedia = await firstValueFrom(
        this.mediaClient.send<Media>('product:image:fetch', { productId: id }),
      );

      if (productMedia.mediaExists) {
        if (productMedia.userId !== user.clerkUserId) {
          throw new ForbiddenException({
            message: 'you can only delete product you upload',
          });
        }
        await firstValueFrom(
          this.mediaClient.send<boolean>('product:image:delete', {
            publicId: productMedia.publicId,
          }),
        );
      }

      await firstValueFrom(
        this.catalogClient.emit('product:delete', {
          productId: id,
          createdByClerkUserId: user.clerkUserId,
          mediaExists: productMedia.mediaExists,
        }),
      );
      return { message: `product ${id} deleteion scheduled successfully` };
    } catch (error) {
      mapAllRpcErrorToHttp(error);
    }
  }
}
