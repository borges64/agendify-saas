// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserTypes } from 'src/common/user-type.enum';
import { ROLES_KEY } from '../roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserTypes[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Se não houver roles definidos, permite acesso (ou você pode negar por padrão)
    }
    const { user } = context.switchToHttp().getRequest();
    // No seu caso, o objeto `user` injetado pelo JwtAuthGuard deve ter a propriedade `type`
    // Você precisa garantir que seu AuthGuard (AuthService/Strategy) popule `req.user` corretamente com o tipo de usuário.
    return requiredRoles.some((role) => user.type === role);
  }
}