// src/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // Usa a estratégia 'local' para autenticação
  @Post('login')
  async login(@Request() req) {
    // O Passport.js anexa o objeto de usuário autenticado ao objeto de solicitação (req.user)
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
getProfile(@Request() req: Request & { user: User }) {
  console.log('Dados do usuário no req.user (backend):', req.user);
  return {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    type: req.user.type,
  };
}
}