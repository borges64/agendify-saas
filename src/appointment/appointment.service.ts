import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { User } from 'src/user/entities/user.entity';
import { AppointmentStatus, UserTypes } from 'src/common/user-type.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Employee) private employeesRepository: Repository<Employee>,
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
    @InjectRepository(User) private userRepository: Repository<User>

  ) { }
  async create(createAppointmentDto: CreateAppointmentDto, currentUser: User) {
    const { employeeId, patientId, startTime, endTime, description, status } = createAppointmentDto;

    // 1. Validar se o usuário logado tem permissão para criar o agendamento
    // Admins podem criar para qualquer empresa. Employees só podem criar para sua própria empresa.
    // Patients não podem criar agendamentos (talvez só solicitar).

    if (currentUser.type === UserTypes.PATIENT) {
      throw new ForbiddenException("Pacientes não podem criar agendamentos diretamente.");
    }

    const employee = await this.employeesRepository.findOne({
      where: { id: employeeId },
      relations: ['company']
    })

    if (!employee) {
      throw new NotFoundException(`Funcionário com ID ${employeeId} não encontrado`)
    }

    const patient = await this.patientsRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Paciente com ID ${patientId} não encontrado.`);
    }

    // 3. Verificar se o agendamento pertence à empresa correta (para Employees)
    const companyId = employee.companyId
    // Assume que `currentUser.employee` está disponível para usuários do tipo EMPLOYEE (você precisará carregar isso no AuthGuard)
    if (currentUser.type === UserTypes.EMPLOYEE && employee.companyId !== currentUser.employee.companyId) {
      throw new ForbiddenException("Você só pode criar agendamentos para funcionários empresa")
      // Se o usuário for ADMIN, ele pode criar para qualquer empresa, então não precisa dessa verificação.
    }

    // Validar horarios
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start > end) {
      throw new BadRequestException("A HORA DE INÍCIO NÃO DEVE SER ANTERIOR A HORA DE TÉRMINO")
    }
    if (start < new Date()) {
      throw new BadRequestException("Não é possível agendar para o passado.")
    }

    const conflicts = await this.appointmentRepository.createQueryBuilder('appointment')
      .where('appointment.employeeId = :employeeId', { employeeId })
      .andWhere(
        '(appointment.startTime < :end AND appointment.endTime > :start)',
        { start, end },
      )
      .andWhere('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] })
      .getMany();

    if (conflicts.length > 0) {
      throw new ConflictException('Já existe um agendamento para este funcionário neste horário.');
    }

    // 6. Criar e salvar o agendamento
    const newAppointment = this.appointmentRepository.create({
      companyId,
      employeeId,
      patientId,
      startTime: start,
      endTime: end,
      description,
      status: status || AppointmentStatus.PENDING, // Admin pode definir status inicial, padrão PENDING
      confirmationCode: uuidv4(), // Gera um código único de confirmação
    });

    return this.appointmentRepository.save(newAppointment);


  }

  async findAll(currentUser: User, companyId?: string): Promise<Appointment[]> {
    // Definir as condições de busca com base no tipo de usuário
    const whereCondition: any = {};

    if (currentUser.type === UserTypes.EMPLOYEE) {
      // Um funcionário só pode ver agendamentos da sua empresa
      // (Assumindo que currentUser.employee.companyId está carregado no User)
      whereCondition.companyId = currentUser.employee.companyId;
    } else if (currentUser.type === UserTypes.PATIENT) {
      // Um paciente só pode ver seus próprios agendamentos
      // (Assumindo que currentUser.patient.id está carregado no User)
      whereCondition.patientId = currentUser.patient.id;
    } else if (currentUser.type === UserTypes.ADMIN) {
      // ADMIN pode filtrar por companyId ou ver tudo
      if (companyId) {
        whereCondition.companyId = companyId;
      }
    } else {
      throw new ForbiddenException('Permissão negada.');
    }

    // Carrega os relacionamentos para exibir no retorno
    return this.appointmentRepository.find({
      where: whereCondition,
      relations: ['employee', 'patient', 'company'], // Carrega dados relacionados
      order: {
        startTime: 'ASC' // Ordenar por data e hora
      }
    });
  }

  async findOne(id: string, currentUser: User): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['employee', 'patient', 'company'],
    });

    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado.`);
    }

    // Autorização:
    if (currentUser.type === UserTypes.EMPLOYEE && appointment.companyId !== currentUser.employee.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar este agendamento.');
    }
    if (currentUser.type === UserTypes.PATIENT && appointment.patientId !== currentUser.patient.id) {
      throw new ForbiddenException('Você não tem permissão para acessar este agendamento.');
    }

    return appointment;
  }


  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, currentUser: User): Promise<Appointment> {
    const appointment = await this.findOne(id, currentUser); // Reutiliza a lógica de busca e autorização

    // 1. Autorização para atualização
    if (currentUser.type === UserTypes.PATIENT) {
      // Pacientes só podem confirmar, não alterar outros dados
      if (updateAppointmentDto.status && updateAppointmentDto.status !== AppointmentStatus.CONFIRMED) {
        throw new ForbiddenException('Pacientes só podem mudar o status para CONFIRMED.');
      }
      if (updateAppointmentDto.startTime || updateAppointmentDto.endTime || updateAppointmentDto.employeeId || updateAppointmentDto.patientId) {
        throw new ForbiddenException('Pacientes não podem alterar detalhes do agendamento.');
      }
    }

    // 2. Validar conflitos se houver mudança de horário ou funcionário
    if (updateAppointmentDto.startTime || updateAppointmentDto.endTime || updateAppointmentDto.employeeId) {
      const newStartTime = updateAppointmentDto.startTime ? new Date(updateAppointmentDto.startTime) : appointment.startTime;
      const newEndTime = updateAppointmentDto.endTime ? new Date(updateAppointmentDto.endTime) : appointment.endTime;
      const newEmployeeId = updateAppointmentDto.employeeId || appointment.employeeId;

      if (newStartTime >= newEndTime) {
        throw new BadRequestException('A hora de início deve ser anterior à hora de término.');
      }

      const conflicts = await this.appointmentRepository.createQueryBuilder('appointment')
        .where('appointment.employeeId = :employeeId', { employeeId: newEmployeeId })
        .andWhere('appointment.id != :currentId', { currentId: id }) // Exclui o próprio agendamento
        .andWhere(
          '(appointment.startTime < :end AND appointment.endTime > :start)',
          { start: newStartTime, end: newEndTime },
        )
        .andWhere('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] })
        .getMany();

      if (conflicts.length > 0) {
        throw new ConflictException('Já existe um agendamento para este funcionário neste novo horário.');
      }
    }

    // Atualiza os campos do agendamento
    Object.assign(appointment, updateAppointmentDto);

    return this.appointmentRepository.save(appointment);
  }

  async confirmAppointment(confirmationCode: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { confirmationCode },
    });

    if (!appointment) {
      throw new NotFoundException('Código de confirmação inválido ou agendamento não encontrado.');
    }

    if (appointment.status === AppointmentStatus.CONFIRMED) {
      throw new ConflictException('Este agendamento já está confirmado.');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Este agendamento foi cancelado e não pode ser confirmado.');
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    appointment.confirmedAt = new Date();

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const appointment = await this.findOne(id, currentUser); // Reutiliza a lógica de busca e autorização

    // Apenas ADMIN ou EMPLOYEE (da mesma empresa) podem remover
    if (currentUser.type === UserTypes.PATIENT) {
      throw new ForbiddenException('Pacientes não podem remover agendamentos.');
    }

    // Você pode querer mudar o status para 'CANCELLED' em vez de remover permanentemente
    // appointment.status = AppointmentStatus.CANCELLED;
    // await this.appointmentsRepository.save(appointment);
    await this.appointmentRepository.delete(id);
  }
}
