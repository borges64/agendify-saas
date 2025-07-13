// src/companies/entities/company.entity.ts
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';


@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamento com o usuário proprietário/criador da empresa
  @ManyToOne(() => User, user => user.ownedCompanies, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_user_id' }) // Coluna FK no banco
  ownerUser: User;

  @Column({ nullable: true })
  ownerUserId: string; // Coluna para a FK bruta

  // Relacionamentos Inversos:
  @OneToMany(() => Employee, employee => employee.company)
  employees: Employee[];

  @OneToMany(() => Patient, patient => patient.company)
  patients: Patient[];

  @OneToMany(() => Appointment, appointment => appointment.company)
  appointments: Appointment[];
}