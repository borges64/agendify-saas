
import { IsUUID, IsNotEmpty, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { AppointmentStatus } from 'src/common/user-type.enum';


export class CreateAppointmentDto {
    @IsUUID()
    @IsNotEmpty()
    employeeId: string

    @IsUUID()
    @IsNotEmpty()
    patientId: string

    @IsDateString()
    @IsNotEmpty()
    startTime: string; // Formato ISO 8601 (ex: "2025-07-13T10:00:00Z")

    @IsDateString()
    @IsNotEmpty()
    endTime: string; // Formato ISO 8601

    @IsOptional()
    @IsString()
    description?: string;

    // O status inicial será PENDING por padrão no serviço, mas pode ser sobreescrito por um ADMIN
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    // confirmationCode será gerado pelo serviço, não passado no DTO de criação
}
