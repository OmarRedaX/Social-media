import { providerTypes, roleTypes, userModel } from "../../../DB/model/User.model.js";
import { emailEventEmitter } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { decodeToken, generateToken, tokenTypes } from "../../../utils/security/token.security.js";
import {OAuth2Client} from 'google-auth-library';
import * as dbService from "../../../DB/db.service.js";



export const login = asyncHandler(
    
    async (req,res,next) => {

    const {email , password , phone , idToken} = req.body;

    // Case 1: Gmail Authentication

    if(idToken){

        const client = new OAuth2Client();

        async function verify() {
            const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
        });

        const payload = ticket.getPayload();
        return payload;
        }
        
        const payload = await verify()

        if(!payload?.email_verified){
            return next(new Error("In-valid gmail account", {cause:400}));
        }

        let user =await dbService.findOne({model: userModel, filter: {email: payload.email}})
    
        if(!user){
            user = await dbService.create({
                model: userModel,
                data: {
                    username: payload.name,
                    email: payload.email,
                    confirmEmail: payload.email_verified,
                    image: payload.picture,
                    provider: providerTypes.google
                }
            })};
        
        
        if(user.provider !== providerTypes.google){
            return next(new Error("In-valid provider", {cause:400}));
        }    


        const accessToken = generateToken({
            payload: {id: user._id},
            signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
        });

        const refreshToken = generateToken({
            payload: {id: user._id},
            signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: process.env.REFRESH_EXPIRESIN,
            tokenType: tokenTypes.refresh
        });


        return successResponse({res, status:200, message:"Login successfully", data: { token: {accessToken , refreshToken}}});

    }


    // Case 2: Email/phone & passwrod Authentication
    const filter = email ? { email } : { phone };
    const identifier = "email" in filter ? "Email" : "Phone";

    const user =await dbService.findOne({model: userModel, filter: {...filter , provider: providerTypes.system, isDeleted:{$exists:false}}});
    
    if(!user){
        return next(new Error(`Incorrect ${identifier} or Password`, {cause: 404}));
    }
    

    if(!user.confirmEmail){
        return next(new Error("please verify your email", {cause: 400}));
    }

    if(!compareHash({plainText: password, hashValue: user.password})){
        return next(new Error(`Incorrect ${identifier} or Password`, {cause: 400}));
    }

    if(user.twoStepVerification){
        
        emailEventEmitter.emit("sendtwoStepVerificationEmail",{id: user._id , username: user.username, email: user.email, action:"Confirm Your Login"})
    
        return successResponse({res, message: "A verification code has been sent to your email address. If you don't see it, please check your spam or junk folder"});

    }
    

    const accessToken = generateToken({
        payload: {id: user._id},
        signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    });

    const refreshToken = generateToken({
        payload: {id: user._id},
        signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: process.env.REFRESH_EXPIRESIN,
        tokenType: tokenTypes.refresh
    });


    return successResponse({res, status:200, message:"Login successfully", data: {token: {accessToken , refreshToken}}});
    

    }
)



export const loginConfirmation = asyncHandler(async(req,res,next)=>{

    const {email , phone , otp} = req.body;

    const filter = email ? { email } : { phone };
    const identifier = "email" in filter ? "Email" : "Phone";

    const user =await dbService.findOne({model: userModel, filter: {...filter , provider: providerTypes.system, isDeleted:{$exists:false}  }});
    
    if(!user){
        return next(new Error(`Incorrect ${identifier} or Password`, {cause: 404}));
    }

    if(!user.confirmEmail){
        return next(new Error("please verify your email.", {cause: 400}));
    }

    if (!user.twoStepVerificationOTP || user.OTPExpires < Date.now()) {
            return next(new Error('Verification OTP has expired. Please request a new OTP.', {cause: 410}));
        }

    if(!compareHash({plainText:otp, hashValue: user.twoStepVerificationOTP})){
        return next(new Error("The OTP you entered is incorrect. Please try again.", {cause: 400}));
    }

    await dbService.updateOne({
        model: userModel,
        filter:{_id: user._id},
        data:{
            $unset: {OTPExpires: "" , twoStepVerificationOTP: "" }
        }
    })

    const accessToken = generateToken({
        payload: {id: user._id},
        signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    });

    const refreshToken = generateToken({
        payload: {id: user._id},
        signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: process.env.REFRESH_EXPIRESIN,
        tokenType: tokenTypes.refresh
    });


    return successResponse({res, status:200, message:"Login successfully", data: {token: {accessToken , refreshToken}}});

})





export const refreshToken = asyncHandler(

    async (req,res,next) => {

        const {authorization} = req.headers;
        if(!authorization){
            return next (new Error ("In-valid token",{cause:400}));
        }

        const user = await decodeToken({authorization, next});

        const accessToken = generateToken({
        payload: {id: user._id},
        signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
        });

        const refreshToken = generateToken({
        payload: {id: user._id},
        signature: [roleTypes.superAdmin, roleTypes.admin].includes(user.role) ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: process.env.REFRESH_EXPIRESIN,
        tokenType: tokenTypes.refresh
        });


        return successResponse({res, status:200, message:"Done", data: {token: {accessToken , refreshToken}}});

    }
)


export const forgetPassword = asyncHandler(

    async (req,res,next) => {

        const {email} = req.body;

        const user =await dbService.findOne({model: userModel, filter: {email, isDeleted:{$exists:false}}});

        if(!user){
            return next(new Error("In-valid email", {cause: 404}));
        }

        if(!user.confirmEmail){
            return next(new Error("please verify your email", {cause: 400}));
        }
         
        if (user.isBanned && user.banExpires > Date.now()) {
            return next(new Error(`You are temporarily banned. Try again after ${new Date(user.banExpires).toLocaleTimeString()}`, {cause:403}));
        }

        if (user.isBanned && user.banExpires <= Date.now()) {

            await dbService.updateOne({
            model: userModel,
            filter: {email} ,
            data: {
                $unset: { isBanned: "" , banExpires: "" , failedOTPAttempts: 0},
                changeCredentialsTime:Date.now()
            }
         });
            
        }
        

        emailEventEmitter.emit("forgetPasswordEmail" , {id: user._id, email, username: user.username, action: "reset your password"});

        return successResponse({res, status:200, message:"Please check your email"});

    }
)


export const validateForgetPasswordToken = asyncHandler(

    async (req,res,next) => {

        const {email , otp} = req.body;

        const user =await dbService.findOne({model: userModel, filter: {email, isDeleted:{$exists:false}}});

        if(!user){
            return next(new Error("In-valid email", {cause: 404}));
        }

        if(!user.confirmEmail){
            return next(new Error("please verify your email", {cause: 400}));
        }

        if(!compareHash({plainText: otp, hashValue: user.resetPasswordOTP})){
            return next(new Error("In-valid otp", {cause: 400}));
        }

        if (!user.resetPasswordOTP || user.OTPExpires < Date.now()) {
            return next(new Error('Verification OTP has expired. Please request a new OTP.', {cause: 410}));
        }

        return successResponse({res, status:200, message:"Valid otp, you can now reset your password"});

    }
)


export const resetPassword = asyncHandler(

    async (req,res,next) => {

        const {email , otp , password} = req.body;

        const user =await dbService.findOne({model: userModel, filter: {email, isDeleted:{$exists:false}}});

        if(!user){
            return next(new Error("In-valid email", {cause: 404}));
        }

        if(!user.confirmEmail){
            return next(new Error("please verify your email", {cause: 400}));
        }

        if (user.isBanned && user.banExpires > Date.now()) {
            return next(new Error(`You are temporarily banned. Try again after ${new Date(user.banExpires).toLocaleTimeString()}`, {cause:403}));
        }

        // Check if the otp is expired
        if (!user.resetPasswordOTP || user.OTPExpires < Date.now()) {
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

        if(!compareHash({plainText: otp, hashValue: user.resetPasswordOTP})){

            await dbService.updateOne({
                model: userModel,
                filter: {email},
                data: {
                    $inc: { failedOTPAttempts: 1 }
                }
            })

            return next(new Error("In-valid otp please try again", {cause: 400}));
        }

        if(compareHash({plainText: password, hashValue: user.password})){
            return next(new Error("New password must be different from the current password", {cause:400}))
        }


        await dbService.updateOne({
            model: userModel,
            filter: {email} ,
            data: {
                password: generateHash({plainText: password}),
                $unset: { resetPasswordOTP: "" , OTPExpires: "" , failedOTPAttempts: ""},
                changeCredentialsTime:Date.now()
            }
         });
         
        return successResponse({res, status:200, message:"Your password has been reset successfully"});

    }
)