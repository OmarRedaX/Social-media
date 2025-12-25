import { customAlphabet } from 'nanoid';
import {EventEmitter} from 'node:events';
import { userModel } from '../../DB/model/User.model.js';
import { sendEmail } from '../email/send.email.js';
import { generateHash } from '../security/hash.security.js';
import { otpTemplate } from '../templates/otpConfirmationEmail.template.js';
import * as dbService from '../../DB/db.service.js';
import { profileViewersTemplate } from '../templates/profileViewersEmail.template.js';

export const emailEventEmitter = new EventEmitter();

export const emailSubject = {
    confirmEmail: "Email-Confirmation",
    forgetPassword: "Password-Reset",
    updateEmail: "Update-Email",
    twoStepVerificationEmail:"Two-Step-Verification",
    profileViewers: "Profile-Viewers"
}


export const sendOtp = async({data={}, subject=emailSubject.confirmEmail} = {})=>{

    const {id, email , username, action}= data;
    
    const otp = customAlphabet('1234567890', 4)();

    const hashedOTP = generateHash({plainText: otp});

    let updateData = {};

    switch(subject){
        case emailSubject.confirmEmail:
            updateData = {confirmEmailOTP: hashedOTP};
            break;
         
        case emailSubject.forgetPassword:
            updateData = {resetPasswordOTP: hashedOTP};
            break;

        case emailSubject.updateEmail:
            updateData = {tempEmailOTP: hashedOTP};
            break;

        case emailSubject.twoStepVerificationEmail:
            updateData = {twoStepVerificationOTP: hashedOTP};
            break;    
            
        default:
            break; 
    } 
    
    updateData.OTPExpires = Date.now() + 2 * 60 * 1000;

    await dbService.updateOne({
        model: userModel, 
        filter: {_id: id},
        data: updateData
    });

    

    const html = otpTemplate({otp: otp , name: username , action});

    await sendEmail({
        to: email,
        subject,
        html: html
    });

}



export const sendProfileViewers = async({data={}, subject=emailSubject.profileViewers} = {})=>{

    const { email, viewTimes , username , viewerName}= data;

    const html = profileViewersTemplate({viewTimes , viewerName, name: username});

    await sendEmail({
        to: email,
        subject,
        html: html
    });


}




emailEventEmitter.on("sendConfirmEmail", async (data)=>{
    await sendOtp({data, subject: emailSubject.confirmEmail});
})

emailEventEmitter.on("sendConfirmTempEmail", async (data)=>{
    await sendOtp({data, subject: emailSubject.updateEmail});
})

emailEventEmitter.on("forgetPasswordEmail", async (data)=>{
    await sendOtp({data, subject: emailSubject.forgetPassword});
})

emailEventEmitter.on("sendtwoStepVerificationEmail", async (data)=>{
    await sendOtp({data, subject: emailSubject.twoStepVerificationEmail});
})

emailEventEmitter.on("sendProfileViewersEmail", async (data)=>{
    await sendProfileViewers({data, subject: emailSubject.profileViewers});
})