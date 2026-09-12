import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import  httpStatus  from "http-status";
import { UserServices } from "./user.service";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
    if(!req.file){
        throw new Error("No file found")
    }
    const userId = req.user?.userId
    
    const result =await UserServices.uploadProfileImage(req.file?.buffer, userId as string)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Image Upload successfully',
        data: result,
    })
})





export const  UserController ={
    uploadProfileImage
}