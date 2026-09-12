import bcrypt from 'bcryptjs'
import { JwtPayload, SignOptions } from 'jsonwebtoken'
import { AuthProvider, Role, UserStatus } from '../../../generated/prisma/enums'
import config from '../../config'
import { prisma } from '../../lib/prisma'
import { jwtUtils } from '../../utils/jwt'
import {
    IFortgotPasswordPayload,
    IgogleLoginPayload,
    ILoginUserPayload,
    IRegisterPatientPayload,
    IRequestUser,
    IresetPasswordPayload
} from './auth.interface'
import { TokenPayload } from 'google-auth-library'
import { googleClient } from '../../lib/googleAuth'
import crypto from "crypto"
import { redisClient } from '../../lib/redis'
import { transporter } from '../../lib/nodeMailer'
import ejs from "ejs"
import path from 'path'



const registerUser = async (payload: IRegisterPatientPayload) => {
    const { name, password } = payload
    const email = payload.email.trim().toLowerCase()

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    })

    if (isUserExists) {
        throw new Error('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: Role.CALLER,
            status: UserStatus.ACTIVE,
            emailVerified: false,

        },
        omit: { password: true },

    })

    const { ...user } = createdUser
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        user,
        accessToken,
        refreshToken
    }
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { password } = payload
    const email = payload.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        throw new Error('User not found')
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new Error('User is blocked')
    }

    if (user.password === null && user.googleId != null) {
        throw new Error("User Already has account Register with google")

    }

    const isPasswordMatched = await bcrypt.compare(password, user.password as string)

    if (!isPasswordMatched) {
        throw new Error('Invalid credentials')
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    }
}

const getMe = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },

        omit: {
            password: true,
        },
    })

    if (!isUserExists) {
        throw new Error('User not found')
    }

    return isUserExists
}

const refreshToken = async (token: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret)

    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new Error(config.node_env === 'development' ? verifiedRefreshToken.error : 'Invalid refresh token')
    }

    const data = verifiedRefreshToken.data as JwtPayload

    const user = await prisma.user.findUnique({
        where: { id: data.userId },
    })

    if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('User is inactive or not found')
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    }
}

const goolgeLogin = async (payload: IgogleLoginPayload) => {

    let googleIdtokenPayload: TokenPayload | null | undefined = null;
    try {
        const result = await googleClient.verifyIdToken({
            idToken: payload.idToken,
            audience: config.google_client_id
        })

        googleIdtokenPayload = result.getPayload()



    } catch (error) {
        console.log("Google Id Token Verification Failed:", error);
        throw new Error("Invalid or Expired Google Id Token")

    }

    if (!googleIdtokenPayload) {
        throw new Error("Invalid or Expired Google Id Token")
    }
    if (!googleIdtokenPayload.email) {
        throw new Error("Email not Found")
    }
    if (!googleIdtokenPayload.name) {
        throw new Error("user name not Found")
    }

    const ifUserExistWithGoogleAuth = await prisma.user.findUnique({
        where: {
            email: googleIdtokenPayload.email,
            role: Role.CALLER,
            googleId: googleIdtokenPayload.sub
        }
    })
    let user = ifUserExistWithGoogleAuth;
    if (!ifUserExistWithGoogleAuth) {

        const ifUserExistWithCrediential = await prisma.user.findUnique({
            where: {
                email: googleIdtokenPayload.email,
                role: Role.CALLER,
                authProvider: AuthProvider.CREDENTIALS
            }
        })
        if (ifUserExistWithCrediential) {
            if (ifUserExistWithCrediential.status === UserStatus.BLOCKED) {
                throw new Error("user is Blocked")
            }

            user = await prisma.user.update({
                where: {
                    id: ifUserExistWithCrediential.id
                },
                data: {
                    googleId: googleIdtokenPayload.sub
                }
            })
        } else {
            user = await prisma.user.create({
                data: {
                    name: googleIdtokenPayload.name,
                    email: googleIdtokenPayload.email,
                    role: Role.CALLER,
                    googleId: googleIdtokenPayload.sub,
                    authProvider: AuthProvider.GOOGLE,
                    emailVerified: true
                }
            })
        }


    }
    if (!user) {
        throw new Error("User not found")
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new Error("user is Blocked")
    }


    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    }



}

const forgotPassword = async (payload: IFortgotPasswordPayload) => {
    const { email } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (!isUserExist) {
        throw new Error("User does not Exist")
    }

    if (isUserExist.status === "BLOCKED") {
        throw new Error("User is blocked")
    }

    if (isUserExist.authProvider !== "CREDENTIALS") {
        throw new Error("User has an account with Google")
    }

    const otp = crypto.randomInt(100000, 1000000);
    const key = `forgot-password-otp: ${isUserExist.email}`

    await redisClient.set(key, otp, {
        expiration: {
            type: "EX",
            value: 5 * 60
        }
    })

    const templatePath = path.join(process.cwd(), "src/app/templates/forgotPassword.ejs")

    const html = await ejs.renderFile(templatePath, {
        name: isUserExist.name,
        otp
    })

    await transporter.sendMail({
        from: config.smtp_sender,
        to: isUserExist.email,
        subject: "Password Changed",
        html
    })
}

const resetPassword = async (payload: IresetPasswordPayload) => {
    const { email, otp, newPassword } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (!isUserExist) {
        throw new Error("User does not Exist")
    }

    if (isUserExist.status === "BLOCKED") {
        throw new Error("User is blocked")
    }

    if (isUserExist.authProvider !== "CREDENTIALS") {
        throw new Error("User has an account with Google")
    }
    const key = `forgot-password-otp: ${isUserExist.email}`

    const redisOtp = await redisClient.get(key)

    if (!redisOtp) {
        throw new Error("invalid OTP ")
    }
    if (redisOtp !== otp) {
        throw new Error("OTP does not matched")
    }

    const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    await prisma.user.update({
        where: {
            email: isUserExist.email
        },
        data: {
            password: hashedPassword
        }
    })

    await redisClient.del([key]);

     const templatePath = path.join(process.cwd(), "src/app/templates/resetPassword.ejs")

    const html = await ejs.renderFile(templatePath, {
        name: isUserExist.name,
        email: isUserExist.email,
        changedAt: Date.now(),
    })

    await transporter.sendMail({
        from: config.smtp_sender,
        to: isUserExist.email,
        subject: "Password Changed",
        html
    })



}



export const AuthService = {
    registerUser,
    loginUser,
    getMe,
    refreshToken,
    goolgeLogin,
    forgotPassword,
    resetPassword
}
