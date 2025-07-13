// src/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // Usa a estratégia 'local' para autenticação
  @Post('login')
  async login(@Request() req) {
    // O Passport.js anexa o objeto de usuário autenticado ao objeto de solicitação (req.user)
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt')) // Protege esta rota com JWT
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Retorna o payload do token JWT
  }
}