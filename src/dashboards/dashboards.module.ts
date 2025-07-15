import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { UserModule } from 'src/user/user.module';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [UserModule],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
