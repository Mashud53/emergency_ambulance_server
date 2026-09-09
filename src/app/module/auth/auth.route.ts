import { NextFunction, Request, Response, Router } from 'express'
import { Role } from '../../../generated/prisma/enums'
import { auth } from '../../middleware/checkAuth'
import { AuthController } from './auth.controller'
import { ForgotPasswordZodSchema, ResetPasswordZodSchema, UserLoginZodSchema, UserRegisterZodSchema } from './auth.validation'
import { validateRequest } from '../../middleware/validateRequest'

const router = Router()



router.post('/register',
    validateRequest(UserRegisterZodSchema),
    AuthController.registerUser)

router.post('/login',validateRequest(UserLoginZodSchema), AuthController.loginUser)
router.get('/me',
    auth(Role.CALLER, Role.DISPATCHER, Role.DRIVER, Role.SUPER_ADMIN),
    AuthController.getMe,
)
router.post('/refresh-token', AuthController.refreshToken)
router.post('/google', AuthController.googleLogin)
router.post('/forgot-password', validateRequest(ForgotPasswordZodSchema), AuthController.forgotPassword)
router.post('/reset-password',validateRequest(ResetPasswordZodSchema), AuthController.resetPassword)
export const AuthRoutes = router
