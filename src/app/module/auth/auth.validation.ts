import z, { email, string } from "zod";

export const UserRegisterZodSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string()
        .min(5, "Password must be 5 characters Long")
        .regex(/[A-Z]/, "Password must contain atleast one uppercase ")
        .regex(/[a-z]/, "Password must contain atleast one Lowarcase")
        .regex(/[0-9]/, "Password must contain atleast one Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast one special character")
})
export const UserEmailVerifyZodSchema = z.object({
    email: z.email(),
    otp: z.string().length(6)
})


export const UserLoginZodSchema = z.object({
    email: z.email(),
    password: z.string()
        .min(5, "Password must be 5 characters Long")
        .regex(/[A-Z]/, "Password must contain atleast one uppercase ")
        .regex(/[a-z]/, "Password must contain atleast one Lowarcase")
        .regex(/[0-9]/, "Password must contain atleast one Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast one special character")
})

export const ForgotPasswordZodSchema = z.object({
    email: z.email()
})

export const ResetPasswordZodSchema = z.object({
    email: z.email(),
    newPassword: z.string()
        .min(5, "Password must be 5 characters Long")
        .regex(/[A-Z]/, "Password must contain atleast one uppercase ")
        .regex(/[a-z]/, "Password must contain atleast one Lowarcase")
        .regex(/[0-9]/, "Password must contain atleast one Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast one special character"),
    otp: z.string().length(6)
})