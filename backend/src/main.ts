import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.use(helmet());
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? '';

  app.enableCors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    const allowed = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://www.localhost:3000',
      'http://www.localhost:3001',
    ].filter(Boolean);

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origen no permitido — ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Canarias Equipamientos API')
      .setDescription('Sistema de Gestión de Cobranza y Ventas Financiadas')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addTag('auth').addTag('societies').addTag('staff').addTag('clients')
      .addTag('zones').addTag('products').addTag('suppliers').addTag('sales')
      .addTag('installments').addTag('payments').addTag('route-sheets')
      .addTag('closures').addTag('cashbox').addTag('notifications')
      .addTag('failed-visits').addTag('cash-movements').addTag('supplier-invoices')
      .addTag('supplier-payments')
      .addTag('receipts').addTag('reports').addTag('notification-deliveries')
      .addTag('user-configurations')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get('PORT') ?? 3001;
  await app.listen(port);
  console.log('Backend corriendo en http://localhost:' + port + '/api/v1');
  console.log('Swagger en http://localhost:' + port + '/api/docs');
}
bootstrap();
