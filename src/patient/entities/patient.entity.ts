// src/patients/entities/patient.entity.ts
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Company } from 'src/company/entities/company.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';


@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true }) // `unique: true` e `nullable: true` significa que pode ser null, mas se não for null, deve ser único.
  userId: string; // A coluna da FK

  @OneToOne(() => User, user => user.patient, { nullable: true, onDelete: 'SET NULL' }) // Se o User for deletado, Patient permanece (mas sem user_id)
  @JoinColumn({ name: 'userId' }) // Nome da coluna FK em `patients`
  user: User;

  @Column()
  companyId: string; // A coluna da FK

  @ManyToOne(() => Company, company => company.patients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos Inversos:
  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];
}