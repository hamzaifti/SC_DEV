import { ApplicationUser } from "./ApplicationUser"

export interface LoginResponseDto{
    success: boolean,
    message: string,
    token: string
    user: ApplicationUser
    roles: string[]
}