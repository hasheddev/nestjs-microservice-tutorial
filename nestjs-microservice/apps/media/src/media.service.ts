import { Injectable } from '@nestjs/common';
import { initCloudinary } from './cloudinary/cloudinary.client';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './media/media.schema';
import { Model } from 'mongoose';
import {
  rpcBadRequest,
  rpcInternalServerError,
  rpcNotFound,
  rpcUnauthorized,
} from '@app/rpc';
import { UploadApiResponse } from 'cloudinary';
import { RpcException } from '@nestjs/microservices';

type Input = {
  fileName: string;
  mimeType: string;
  base64: string;
  uploaderUserId: string;
};

@Injectable()
export class MediaService {
  private readonly cloudinary = initCloudinary();
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
  ) {}

  async uploadProductImage(input: Input) {
    this.validateInput(input);
    const buffer = Buffer.from(input.base64, 'base64');
    if (!buffer.length) {
      rpcBadRequest('Invalid image data');
    }
    const uploadResult = await new Promise<UploadApiResponse | undefined>(
      (resolve, reject) => {
        const stream = this.cloudinary.uploader.upload_stream(
          {
            folder: 'nestjs-microservice/catalog',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              const payload = {
                code: 'UPLOAD_ERROR', // or VALIDATION_ERROR
                message: error?.message || 'Cloudinary upload failed',
                details: error,
              };
              reject(new RpcException(payload));
            }
            resolve(result);
          },
        );
        stream.end(buffer);
      },
    );
    const url = uploadResult?.url || uploadResult?.secure_url;
    const publicId = uploadResult?.public_id;
    if (!url || !publicId)
      rpcBadRequest('Clodinary upload did not return proper response');
    const { uploaderUserId } = input;
    const productId: string | undefined = undefined;
    const mediaDoc = await this.mediaModel.create({
      url,
      publicId,
      uploaderUserId,
      productId,
    });
    return {
      mediaId: String(mediaDoc._id),
      url,
      uploaderUserId,
    };
  }

  async attachToProduct(input: { mediaId: string; productId: string }) {
    const uploadatedMediaDoc = await this.mediaModel
      .findByIdAndUpdate(
        input.mediaId,
        {
          $set: {
            productId: input.productId,
          },
        },
        { returnDocument: 'after' },
      )
      .exec();
    if (!uploadatedMediaDoc) {
      rpcNotFound('media not found');
    }
    return {
      mediaId: String(uploadatedMediaDoc._id),
      productId: uploadatedMediaDoc.productId!,
      publicId: uploadatedMediaDoc.publicId,
      url: uploadatedMediaDoc.url,
    };
  }

  async deleteFromCloudinary(input: { publicId: string }) {
    const response = (await this.cloudinary.uploader.destroy(
      input.publicId,
    )) as { result: string };

    if (response.result !== 'ok' && response.result !== 'not_found') {
      rpcInternalServerError(`Cloudinary failed: ${response.result}`);
    }
    return true;
  }

  async deleteFromDb(input: {
    productId: string;
    createdByClerkUserId: string;
  }) {
    const result = await this.mediaModel
      .deleteMany({
        productId: input.productId,
        uploaderUserId: input.createdByClerkUserId,
      })
      .exec();
    if (!result.acknowledged)
      rpcInternalServerError(
        `failed to delete image for product ${input.productId}`,
      );
  }

  async fetchImage(input: { productId: string }) {
    const mediaDoc = await this.mediaModel
      .findOne({
        productId: input.productId,
      })
      .exec();
    if (!mediaDoc) return { mediaExists: false };
    return {
      mediaExists: true,
      mediaId: String(mediaDoc._id),
      productId: mediaDoc.productId!,
      publicId: mediaDoc.publicId,
      userId: mediaDoc.uploaderUserId,
    };
  }

  ping() {
    return {
      ok: true,
      service: 'media',
      now: new Date().toISOString(),
    };
  }
  private validateInput(input: Input) {
    if (!input.base64) {
      rpcBadRequest('Image base64 is needed');
    }
    if (!input.mimeType.startsWith('image/')) {
      rpcBadRequest('Only images allowed');
    }

    if (!input.uploaderUserId) {
      rpcUnauthorized('User unauthorized');
    }
  }
}
