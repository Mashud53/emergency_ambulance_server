import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"
import { EmergencyService } from "./emergency.service"

 const callAmbulance = catchAsync(async (req: Request, res: Response) => {

    const result = await EmergencyService.callAmbulance()
   
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Payment Created successfully',
        data: result,
    })
})

const callAmbulanceCallback=catchAsync(async (req: Request, res: Response) => {

   console.log(req.query, "req.query");
   const result = EmergencyService.callAmbulanceCallback()
   
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Payment Created successfully',
        data: result,
    })
})



export const EmergencyController ={
    callAmbulance,
    callAmbulanceCallback
}