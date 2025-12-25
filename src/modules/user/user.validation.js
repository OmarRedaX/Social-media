import joi from "joi";
import { gerneralFields} from "../../middleware/validation.middleware.js";


export const profileImage = joi.object().keys({

    file: gerneralFields.file.required()

}).required();


export const shareProfile = joi.object().keys({

    profileId: gerneralFields.id.required()

}).required();

export const updateEmail = joi.object().keys({

    newEmail: gerneralFields.email.required()
}).required();

export const resetEmail = joi.object().keys({

    oldEmailOTP: gerneralFields.otp.required(),
    newEmailOTP: gerneralFields.otp.required()
}).required();

export const updatePassword = joi.object().keys({

    oldPassword: gerneralFields.password.required(),
    newPassword: gerneralFields.password.not(joi.ref('oldPassword')).required(),
    confirmNewPassword: gerneralFields.password.valid(joi.ref('newPassword')).required()
}).required();

export const updateProfile = joi.object().keys({

    username: gerneralFields.username.optional(),
    DOB: gerneralFields.DOB.optional(),
    gender: gerneralFields.gender.optional(),
    phone: gerneralFields.phone.optional(),
    address: gerneralFields.address.optional(),

}).required();


export const changeRoles = joi.object().keys({
    userId: gerneralFields.id.required(),
    role:joi.string().valid('admin', 'user').required()
}).required();


export const enableTwoStepVerification = joi.object().keys({
    otp: gerneralFields.otp.required()
}).required();

export const sendFriendRequest = joi.object().keys({
    profileId: gerneralFields.id.required(),
    action: joi.string().valid('add-friend', 'cancel-request').required()
}).required();

export const friendsRequest = joi.object().keys({
    profileId: gerneralFields.id.required(),
    action: joi.string().valid('accept','reject').required()
}).required();

export const blockUser = joi.object().keys({
    email: gerneralFields.email.required()
}).required();