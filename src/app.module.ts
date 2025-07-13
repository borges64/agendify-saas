// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { PatientModule } from './patient/patient.module';
import { AppointmentModule } from './appointment/appointment.module';
import { Company } from './company/entities/company.entity';
import { Employee } from './employee/entities/employee.entity';
import { Patient } from './patient/entities/patient.entity';
import { Appointment } from './appointment/entities/appointment.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
       type: 'sqlite', // <--- Mudado para 'sqlite'
      database: 'database.sqlite', // <--- Nome do arquivo .db na raiz do projeto
      entities: [
        User,
        Company,
        Employee,
        Patient,
        Appointment
      ], // Suas entidades
      synchronize: true, // APENAS PARA DESENVOLVIMENTO! Cria as tabelas automaticamente
      logging: ['query', 'error'], // Opcional: para ver as queries no console
    }),
    UserModule,
    AuthModule,
    CompanyModule,
    EmployeeModule,
    PatientModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}