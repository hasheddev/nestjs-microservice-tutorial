import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Pubic } from './auth/public.decorator';

interface PingResponse {
  ok: boolean;
  now: string;
  service: string;
}

@Controller()
export class GatewayController {
  constructor(
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
    @Inject('SEARCH_CLIENT') private readonly searchClient: ClientProxy,
  ) {}

  @Pubic()
  @Get('health')
  async health() {
    const ping = async (serviceName: string, client: ClientProxy) => {
      try {
        const result = await firstValueFrom(
          client.send<PingResponse>('service:ping', { from: 'gateway' }),
        );
        return {
          ok: true,
          service: serviceName,
          result,
        };
      } catch (error: unknown) {
        let errorMessage = 'unknown error';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        return {
          ok: true,
          service: serviceName,
          error: errorMessage,
        };
      }
    };
    const [catalogResponse, mediaResponse, searchResponse] = await Promise.all([
      ping('catalog', this.catalogClient),
      ping('media', this.mediaClient),
      ping('search', this.searchClient),
    ]);
    const ok = [catalogResponse, mediaResponse, searchResponse].every(
      (resp) => resp.ok,
    );
    return {
      ok,
      gateway: {
        service: 'gateway',
        now: new Date().toISOString(),
      },
      sevices: {
        catalog: catalogResponse,
        media: mediaResponse,
        search: searchResponse,
      },
    };
  }
}
