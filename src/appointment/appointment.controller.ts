import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserTypes } from 'src/common/user-type.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserTypes.ADMIN, UserTypes.EMPLOYEE) // Apenas ADMINs e Employees podem criar
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req) {
    // O usuário logado está em req.user (fornecido pelo JwtAuthGuard)
    return this.appointmentService.create(createAppointmentDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserTypes.ADMIN, UserTypes.EMPLOYEE, UserTypes.PATIENT) // Todos podem listar (com filtros de permissão)
  findAll(@Req() req, @Query('companyId') companyId?: string) {
    // companyId é opcional para ADMINs para filtrar
    return this.appointmentService.findAll(req.user, companyId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.ADMIN, UserTypes.EMPLOYEE, UserTypes.PATIENT)
  findOne(@Param('id') id: string, @Req() req) {
    return this.appointmentService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.ADMIN, UserTypes.EMPLOYEE, UserTypes.PATIENT) // Pacientes só podem confirmar
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Req() req) {
    return this.appointmentService.update(id, updateAppointmentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.ADMIN, UserTypes.EMPLOYEE) // Apenas ADMINs e Employees podem deletar/cancelar
  remove(@Param('id') id: string, @Req() req) {
    return this.appointmentService.remove(id, req.user);
  }

  // Endpoint público para confirmação de agendamento por código (não requer autenticação)
  @Post('confirm/:code')
  confirm(@Param('code') code: string) {
    return this.appointmentService.confirmAppointment(code);
  }
}
