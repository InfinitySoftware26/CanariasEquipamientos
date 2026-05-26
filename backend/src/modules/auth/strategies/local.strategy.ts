import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // validate recibe las credenciales — AuthService lanza excepción si son inválidas
  async validate(email: string, password: string): Promise<JwtPayload> {
    return this.authService.validateCredentials(email, password);
  }
}
