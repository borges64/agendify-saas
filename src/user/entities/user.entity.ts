// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserTypes } from 'src/common/user-type.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Company } from 'src/company/entities/company.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 20 }) // Opcional: defina um comprimento máximo
  type: UserTypes; // A propriedade ainda é do tipo UserType no TypeScript

  @Column({ default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({  unique: true })
  email: string; // Opcional, mas útil


   // Relacionamentos:
  @OneToOne(() => Employee, employee => employee.user)
  employee: Employee;

  @OneToOne(() => Patient, patient => patient.user)
  patient: Patient;

   @OneToMany(() => Company, company => company.ownerUser)
  ownedCompanies: Company[];

  // Métodos para hashing e validação de senha
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}