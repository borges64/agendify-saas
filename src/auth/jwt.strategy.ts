// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigurableModuleOptionsFactory, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserTypes } from 'src/common/user-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai o token do header Authorization: Bearer <token>
      ignoreExpiration: false, // O token deve expirar
      secretOrKey: process.env.JWT_SECRET || 'superSecretKey', // A mesma chave secreta usada para assinar o token
    });
  }

  async validate(payload: { sub: string; email: string; type: UserTypes; companyId?: string; patientId?: string }): Promise<any> {
    const user = await this.userService.findOne(payload.email)
    if(!user) {
      throw new UnauthorizedException();
    }
    if(user.type === UserTypes.EMPLOYEE) {}
    if(user.type === UserTypes.PATIENT) {}
    return user
  }


  // async validate(payload: any) {
    // O payload é o que foi assinado no token (geralmente { userId, username })
    // Você pode fazer validações adicionais aqui, como buscar o usuário no banco de dados para garantir que ele ainda existe.
    // return { userId: payload.sub, email: payload.email };
  // }
}