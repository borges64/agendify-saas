// src/appointments/entities/appointment.entity.ts
import { AppointmentStatus } from 'src/common/user-type.enum';
import { Company } from 'src/company/entities/company.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, company => company.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, employee => employee.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, patient => patient.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'varchar', length: 20, default: AppointmentStatus.PENDING }) // Opcional: defina um comprimento máximo
  status: AppointmentStatus; // A propriedade ainda é do tipo AppointmentStatus no TypeScript

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, unique: true }) // Código para confirmação, deve ser único
  confirmationCode: string;

  @Column({ type: 'datetime', nullable: true })
  confirmedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}