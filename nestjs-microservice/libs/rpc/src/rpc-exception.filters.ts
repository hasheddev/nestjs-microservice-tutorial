import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

import { RpcErrorPayload } from './rpc.types';

@Catch()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    let status = 500;
    let validationDetails: string | object =
      'Invalid payload Invalid field value or missing fields';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      validationDetails = exception.getResponse();
    }
    if (status === 400) {
      const payload: RpcErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: 'Payload validation failed!',
        details: validationDetails,
      };
      return super.catch(new RpcException(payload), host);
    }
    const payload: RpcErrorPayload = {
      code: 'INTERNAL',
      message: 'Internal server error',
    };
    return super.catch(new RpcException(payload), host);
  }
}
