import joi from "joi";
import { gerneralFields } from "../../middleware/validation.middleware.js";

export const signup = joi.object().keys({

    username: gerneralFields.username.required(),
    phone: gerneralFields.phone.optional(),
    DOB: gerneralFields.DOB.optional(),
    gender: gerneralFields.gender.optional(),
    email: gerneralFields.email.required(),
    password: gerneralFields.password.required(),
    confirmationPassword: gerneralFields.confirmationPassword.valid(joi.ref('password')).required()

}).required();

export const confirmEmail = joi.object().keys({


    email: gerneralFields.email.required(),
    otp: gerneralFields.otp.required()

}).required();

export const resendOTPConfirmEmail = joi.object().keys({
    
    email: gerneralFields.email.required()

}).required();
    
export const login = joi.object().keys({

    email: gerneralFields.email,
    phone: gerneralFields.phone,
    password: gerneralFields.password,
    idToken: joi.string()

}).xor("email", "phone", "idToken").with("email","password").with("phone","password").without("idToken", ["email", "phone", "password"]);

export const loginConfirmation = joi.object().keys({

    email: gerneralFields.email,
    phone: gerneralFields.phone,
    otp: gerneralFields.otp.required()

}).or("email", "phone")

export const forgetPassword = joi.object().keys({
    email: gerneralFields.email.required()
}).required();

export const validateForgetPasswordToken = confirmEmail

export const resetPassword = joi.object().keys({

    email: gerneralFields.email.required(),
    otp: gerneralFields.otp.required(),
    password: gerneralFields.password.required(),
    confirmationPassword: gerneralFields.confirmationPassword.valid(joi.ref('password')).required()
}).required();