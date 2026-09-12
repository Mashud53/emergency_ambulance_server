import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import httpStatus from "http-status"
import config from './app/config'
import { globalErrorHandler } from './app/middleware/globalErrorHandler'
import { notFound } from './app/middleware/notFound'
import { AuthRoutes } from './app/module/auth/auth.route'
import z from 'zod'
import { redisClient } from './app/lib/redis'
import { UserRoutes } from './app/module/user/user.route'

const app: Application = express()

app.use(
    cors({
        origin: config.frontend_url,
        credentials: true,
    }),
)

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }))

// Middleware to parse JSON bodies
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', AuthRoutes)
app.use('/api/user', UserRoutes)

// app.get("/test", async(req: Request, res: Response, next: NextFunction)=>{
//     try {
//         await redisClient.set("forgot-password-otp:user@gmail.com","123456",{
//             expiration:{
//                 type:"EX",
//                 value: 60
//             }
//         })


//         res.status(httpStatus.OK).json({
//         success: true,
//         message: 'Redis test',
//         data:{}
//     })
//     } catch (error) {
//         console.log(error);
//         next(error)
        
//     }
// })


// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: 'Welcome to Emergency Ambulance Dispatch Backend',
    })
})

app.use(globalErrorHandler)
app.use(notFound)

export default app
