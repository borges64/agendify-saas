import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard'; 
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: '2H' }
      })
      // secret: process.env.JWT_SECRET || 'superSecretKey', // Mude para uma variável de ambiente!
      // signOptions: { expiresIn: '60s' }, // Token expira em 60 segundos
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}