// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
       type: 'sqlite', // <--- Mudado para 'sqlite'
      database: 'database.sqlite', // <--- Nome do arquivo .db na raiz do projeto
      entities: [User], // Suas entidades
      synchronize: true, // APENAS PARA DESENVOLVIMENTO! Cria as tabelas automaticamente
      logging: ['query', 'error'], // Opcional: para ver as queries no console
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}