// src/employees/entities/employee.entity.ts
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Company } from 'src/company/entities/company.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';


@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // Garante que um User só pode ser Employee de uma Company de cada vez
  userId: string; // A coluna da FK

  @OneToOne(() => User, user => user.employee, { onDelete: 'CASCADE' }) // Se o User for deletado, Employee também
  @JoinColumn({ name: 'userId' }) // Nome da coluna FK em `employees`
  user: User;

  @Column()
  companyId: string; // A coluna da FK

  @ManyToOne(() => Company, company => company.employees, { onDelete: 'CASCADE' }) // Se a Company for deletada, Employee também
  @JoinColumn({ name: 'companyId' }) // Nome da coluna FK em `employees`
  company: Company;

  @Column({ nullable: true })
  role: string; // Ex: 'Dentista', 'Secretário'

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos Inversos:
  @OneToMany(() => Appointment, appointment => appointment.employee)
  appointments: Appointment[];
}