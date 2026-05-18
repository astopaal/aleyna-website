import { Role } from '../enums/role.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  sid?: string;
  family?: string;
};
