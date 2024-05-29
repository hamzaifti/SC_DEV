import { IdentityRoles } from "./IdentityRoles";

export class UserDto{
    id: string = '';
    companyId: number = 0;
    name: string | null = null ;
    email: string | null = null;
    password: string | null = null;
    roles: IdentityRoles[] = [];
}