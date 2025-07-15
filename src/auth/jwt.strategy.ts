// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserTypes } from 'src/common/user-type.enum'; // Seu enum UserTypes

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    // private configService: ConfigService // Comentei isso, pois você não está usando ConfigService aqui
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'superSecretKey', // Usando process.env.JWT_SECRET
    });
  }

  async validate(payload: { sub: string; email: string; type: UserTypes; companyId?: string; patientId?: string }) {
    const user = await this.userService.findOne(payload.email); // Busca pelo email do payload
    
    if (!user) {
      throw new UnauthorizedException();
    }

    // Você tem estes ifs, mas eles não impedem o retorno do usuário se o tipo não for PATIENT ou EMPLOYEE.
    // O retorno 'user' acontecerá de qualquer forma.
    // if (user.type === UserTypes.EMPLOYEE) {
    //   // Lógica específica para Employee, se precisar
    // }
    // if (user.type === UserTypes.PATIENT) {
    //   // Lógica específica para Patient, se precisar
    // }
    
    return user; // Retorna o objeto 'user' completo
  }
}