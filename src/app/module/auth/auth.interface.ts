import { Role } from "../../../generated/prisma/browser"

export interface ILoginUserPayload {
    email: string
    password: string
}

export interface IRegisterUserPayload {
    name: string
    email: string
    password: string
}
export interface IVerifiyEmailPayload {
    email: string;
    otp: string;

}

export interface IRequestUser {
    userId: string
    email: string
    name: string
    role: Role
}

export interface IgogleLoginPayload {
    idToken: string
}

export interface IFortgotPasswordPayload {
    email: string
}

export interface IresetPasswordPayload {
    email: string;
    newPassword: string;
    otp: string;
}