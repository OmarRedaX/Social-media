import { userModel } from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateHash, compareHash } from "../../../utils/security/hash.security.js";
import { emailEventEmitter } from "../../../utils/events/email.event.js";
import * as dbService from "../../../DB/db.service.js";

export const signup = asyncHandler(
    
    async (req,res,next) => {

    const {username, email, password} = req.body;
    
    if(await dbService.findOne({model: userModel, filter: {email}})){
        return next(new Error("Email already exists", {cause: 409}));
    }

    const user =await dbService.create({
        model: userModel,
        data: {
            ...req.body 
        }
    })

    emailEventEmitter.emit("sendConfirmEmail", {id: user._id, email, username, action: "comfirm your email address"});

    return successResponse({res, status:201, message:"User created successfully"});

    }
)


export const resendOTPConfirmEmail = asyncHandler(async (req,res,next)=>{

    const {email} = req.body;

    const user =await dbService.findOne({model: userModel, filter: {email}})
    
    if(!user){
        return next(new Error("User not found", {cause: 404}));
    }

    if(user.confirmEmail){
        return next(new Error("Your email is already confirmed", {cause: 409}));
    }

    if (user.isBanned && user.banExpires > Date.now()) {
        return next(new Error(`You are temporarily banned. Try again after ${new Date(user.banExpires).toLocaleTimeString()}`, {cause:403}));
    }
    
    if (user.isBanned && user.banExpires <= Date.now()) {
        await dbService.updateOne({
            model: userModel,
            filter: {email} ,
            data: {
                $unset: { isBanned: "" , banExpires: "" , failedOTPAttempts: ""},
            }
        });
    }

    emailEventEmitter.emit("sendConfirmEmail", {id: user._id, email, username: user.username, action: "comfirm your email address"});

    return successResponse({res, status:200, message:"OTP has been resent successfully"});

})



export const confirmEmail = asyncHandler(
    
    async (req,res,next) => {

    const {email , otp} = req.body;

    const user =await dbService.findOne({model: userModel, filter: {email}})
    
    if(!user){
        return next(new Error("User not found", {cause: 404}));
    }

    if(user.confirmEmail){
        return next(new Error("Your email is already confirmed", {cause: 409}));
    }

    if (user.isBanned && user.banExpires > Date.now()) {
        return next(new Error(`You are temporarily banned. Try again after ${new Date(user.banExpires).toLocaleTimeString()}`, {cause:403}));
    }
            
    // Check if the otp is expired
    if (!user.confirmEmailOTP || user.OTPExpires < Date.now()) {
        return next(new Error('Verification OTP has expired. Please request a new OTP.', {cause: 400}));
    }

    // Ban the user after 5 failed attempts
    if (user.failedOTPAttempts >= 5) {

        await dbService.updateOne({
            model: userModel,
            filter: {email},
            data: {
                isBanned : true,
                banExpires : Date.now() + 5 * 60 * 1000
            }
        })
                 
        return next(new Error(`You are temporarily banned. Try again after 5 minutes}`, {cause:403}));
    }
    

    if(!compareHash({plainText: otp, hashValue: user.confirmEmailOTP})){

        await dbService.updateOne({
            model: userModel,
            filter: {email},
            data: {
                $inc: { failedOTPAttempts: 1 }
            }
        })

        return next(new Error("In-valid otp please try again", {cause: 400}));
    }


    await dbService.updateOne({
        model: userModel,
        filter: {email},
        data: {confirmEmail: true, $unset: {confirmEmailOTP: "", OTPExpires: "" , failedOTPAttempts: ""}}
    });

    return successResponse({res, status:200, message:"User email confirmed successfully"});

    }
)