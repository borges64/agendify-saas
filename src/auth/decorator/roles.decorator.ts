import { SetMetadata } from "@nestjs/common";
import { UserTypes } from "src/common/user-type.enum";

export const ROLES_KEY = 'roles'

export const Roles = (...roles: UserTypes[]) => SetMetadata(ROLES_KEY, roles)