import { RpcException } from '@nestjs/microservices';
import { RpcErrorPayload } from './rpc.types';

export function rpcBadRequest(message: string, details?: any): never {
  const payload: RpcErrorPayload = {
    code: 'BAD_REQUEST',
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    details,
  };
  throw new RpcException(payload);
}

export function rpcNotFound(message: string, details?: any): never {
  const payload: RpcErrorPayload = {
    code: 'NOT_FOUND',
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    details,
  };
  throw new RpcException(payload);
}

export function rpcUnauthorized(message: string, details?: any): never {
  const payload: RpcErrorPayload = {
    code: 'UNAUTHORIZED',
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    details,
  };
  throw new RpcException(payload);
}

export function rpcForbidden(message: string, details?: any): never {
  const payload: RpcErrorPayload = {
    code: 'FORBIDDEN',
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    details,
  };
  throw new RpcException(payload);
}

export function rpcInternalServerError(message: string, details?: any): never {
  const payload: RpcErrorPayload = {
    code: 'INTERNAL',
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    details,
  };
  throw new RpcException(payload);
}
