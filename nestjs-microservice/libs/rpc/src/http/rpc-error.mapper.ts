import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcErrorCode } from '../rpc.types';

interface RpcError {
  code?: RpcErrorCode;
  message?: string;
  details?: unknown;
}

export function mapAllRpcErrorToHttp(error: unknown): never {
  const isObject = typeof error === 'object' && error !== null;
  const errorObj = isObject ? (error as Record<string, unknown>) : {};

  const payload: RpcError = errorObj.error ?? errorObj;
  const code = payload?.code;
  const message = payload?.message ?? 'Request failed';
  switch (code) {
    case 'BAD_REQUEST':
    case 'VALIDATION_ERROR':
      throw new BadRequestException(message);

    case 'NOT_FOUND':
      throw new NotFoundException(message);

    case 'UNAUTHORIZED':
      throw new UnauthorizedException(message);

    case 'FORBIDDEN':
      throw new ForbiddenException(message);

    default:
      throw new InternalServerErrorException(message);
  }
}
