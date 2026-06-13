import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentsController } from './controllers/installments.controller';
import { InstallmentsService } from './services/installments.service';
import { InstallmentsRepository } from './repositories/installments.repository';
import { Installment } from './entities/installment.entity';
import { INSTALLMENTS_REPOSITORY } from './interfaces/installments-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Installment])],
  controllers: [InstallmentsController],
  providers: [
    InstallmentsService,
    { provide: INSTALLMENTS_REPOSITORY, useClass: InstallmentsRepository },
  ],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
