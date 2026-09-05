import { Router } from 'express'
import { Role } from '../../../generated/prisma/enums'
import { auth } from '../../middleware/checkAuth'
import { AuthController } from './auth.controller'

const router = Router()

router.post('/register', AuthController.registerUser)
router.post('/login', AuthController.loginUser)
router.get(
    '/me',
    auth(Role.CALLER, Role.DISPATCHER, Role.DRIVER, Role.SUPER_ADMIN),
    AuthController.getMe,
)
router.post('/refresh-token', AuthController.refreshToken)
router.post('/google', AuthController.googleLogin)
export const AuthRoutes = router
