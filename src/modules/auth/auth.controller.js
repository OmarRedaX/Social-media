import { Router } from "express";
import * as registrationService from './service/registration.service.js';
import * as loginService from './service/login.service.js';
import * as validators from './auth.validation.js'
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post('/signup', validation(validators.signup), registrationService.signup);
router.patch('/confirm-email', validation(validators.confirmEmail), registrationService.confirmEmail);
router.patch('/resend-otp-confirm-email', validation(validators.resendOTPConfirmEmail), registrationService.resendOTPConfirmEmail);
router.post('/login', validation(validators.login), loginService.login);
router.patch('/login-confirmation', validation(validators.loginConfirmation), loginService.loginConfirmation);

router.get('/refresh-token', loginService.refreshToken);

router.patch('/forget-password', validation(validators.forgetPassword), loginService.forgetPassword);
router.patch('/validate-forget-password', validation(validators.validateForgetPasswordToken), loginService.validateForgetPasswordToken);
router.patch('/reset-password', validation(validators.resetPassword), loginService.resetPassword);

export default router;