import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserTypes } from 'src/common/user-type.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardsService.create(createDashboardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-info')
  getMyInfo(@Req() req: Request & { user: User }) {
    return {
      message: 'Suas informações de login:',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        type: req.user.type, // O tipo de usuário é crucial aqui!
        // Adicione outras propriedades se você as estiver carregando na JwtStrategy (e.g., employee.companyId)
      },
    };
  }

   // Rota para o Dashboard de Admin
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica JwtAuthGuard primeiro, depois RolesGuard
  @Roles(UserTypes.ADMIN) // Apenas usuários com type 'admin' podem acessar
  @Get('admin')
  getAdminDashboard(@Req() req: Request & { user: User }) {
    return {
      message: `Bem-vindo ao Dashboard de ADMIN, ${req.user.name}! Você tem acesso total.`,
      userType: req.user.type,
    };
  }

   // Rota para o Dashboard de Funcionário
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserTypes.EMPLOYEE, UserTypes.ADMIN) // Funcionários e Admins podem acessar
  @Get('employee')
  getEmployeeDashboard(@Req() req: Request & { user: User }) {
    let employeeSpecificInfo = '';
    // Exemplo: Se o relacionamento 'employee' foi carregado no JwtStrategy e existe
    // if (req.user.employee && req.user.employee.companyId) {
    //   employeeSpecificInfo = ` da empresa ID: ${req.user.employee.companyId}`;
    // }
    return {
      message: `Bem-vindo ao Dashboard de Funcionário, ${req.user.name}${employeeSpecificInfo}!`,
      userType: req.user.type,
    };
  }

  // Rota para o Dashboard de Paciente
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserTypes.PATIENT, UserTypes.ADMIN) // Pacientes e Admins podem acessar
  @Get('patient')
  getPatientDashboard(@Req() req: Request & { user: User }) {
    let patientSpecificInfo = '';
    // Exemplo: Se o relacionamento 'patient' foi carregado no JwtStrategy e existe
    // if (req.user.patient && req.user.patient.id) {
    //   patientSpecificInfo = ` com ID Paciente: ${req.user.patient.id}`;
    // }
    return {
      message: `Bem-vindo ao Dashboard de Paciente, ${req.user.name}${patientSpecificInfo}!`,
      userType: req.user.type,
    };
  }
}
