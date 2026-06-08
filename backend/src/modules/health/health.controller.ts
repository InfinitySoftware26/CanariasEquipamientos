import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check — usado por Render para verificar el servicio' })
  check() {
    return {
      status:    'ok',
      timestamp: new Date().toISOString(),
      service:   'canarias-backend',
    };
  }
}
