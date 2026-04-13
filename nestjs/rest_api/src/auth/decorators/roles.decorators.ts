import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

// key for storing and retrieving role requirements as metadata in route handler
export const ROLES_KEY = 'roles';

//gives roles allowed in a route function or class as a metadata
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
