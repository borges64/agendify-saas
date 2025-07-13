// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai o token do header Authorization: Bearer <token>
      ignoreExpiration: false, // O token deve expirar
      secretOrKey: process.env.JWT_SECRET || 'superSecretKey', // A mesma chave secreta usada para assinar o token
    });
  }

  async validate(payload: any) {
    // O payload é o que foi assinado no token (geralmente { userId, username })
    // Você pode fazer validações adicionais aqui, como buscar o usuário no banco de dados para garantir que ele ainda existe.
    return { userId: payload.sub, username: payload.username };
  }
}