import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../../config/jwt.config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    StaffModule, PassportModule,
    JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: getJwtConfig }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy, LocalStrategy],
  exports:     [AuthService],
})
export class AuthModule {}
