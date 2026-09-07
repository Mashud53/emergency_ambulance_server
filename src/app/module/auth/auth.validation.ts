import z, { email } from "zod";

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


export const UserLoginZodSchema = z.object({
    email: z.email(),
    password: z.string()
        .min(5, "Password must be 5 characters Long")
        .regex(/[A-Z]/, "Password must contain atleast one uppercase ")
        .regex(/[a-z]/, "Password must contain atleast one Lowarcase")
        .regex(/[0-9]/, "Password must contain atleast one Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast one special character")
})