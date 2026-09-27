import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"
import { EmergencyService } from "./emergency.service"

 const callAmbulance = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user =req.user!

    const result = await EmergencyService.callAmbulance(payload, user)
   
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Payment Created successfully',
        data: result,
    })
})

const callAmbulanceCallback=catchAsync(async (req: Request, res: Response) => {

   console.log(req.query, "req.query");
   const {executePaymentResult, redirectUrl} = await EmergencyService.callAmbulanceCallback(req.query)
   res.redirect(redirectUrl)
    
})



export const EmergencyController ={
    callAmbulance,
    callAmbulanceCallback
}