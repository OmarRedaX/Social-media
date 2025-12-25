import mongoose, {Schema , Types, model} from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";

export const providerTypes = {system:"system", google:"google"}
export const genderTypes = {male:"male", female:"female"}
export const roleTypes = {user:"user", admin:"admin", superAdmin: "superAdmin"}

const userSchema = new Schema({

    username:{ type: String, required: true, minlength: 3, maxlength:50, trim: true },
    email:{ type: String, required: true, unique: true},
    confirmEmailOTP:String,
    OTPExpires:Date,
    failedOTPAttempts: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    banExpires: Date,
    tempEmail:String,
    tempEmailOTP:String,
    password:{ type: String, required: (data)=> {
        return data?.provider === providerTypes.google ? false : true
    }},
    resetPasswordOTP:String,
    phone:String,
    address:String,
    DOB:Date,
    image:{secure_url: String , public_id: String },
    coverImages:[{secure_url: String , public_id: String }],
    gender:{ type: String, enum:Object.values(genderTypes) , default: genderTypes.male },
    role:{ type: String, enum:Object.values(roleTypes) , default: roleTypes.user },
    confirmEmail:{ type: Boolean, default: false },
    isDeleted:{ type: Date },
    changeCredentialsTime:Date,

    provider:{ type: String, enum:Object.values(providerTypes), default: providerTypes.system },

    viewers:[{
        userId:{ type: Types.ObjectId, ref:"User" },
        time:Date
    }],

    twoStepVerification:{ type: Boolean, default: false },
    twoStepVerificationOTP:String,

    friendsList:[{userId:{type: Types.ObjectId, ref:"User"}}],
    sentFriendRequests:[{userId:{type: Types.ObjectId, ref:"User"}}],
    receivedFriendRequests:[{userId:{type: Types.ObjectId, ref:"User"}}],

    blockedUsers:[{userId:{ type: Types.ObjectId, ref:"User" }}],
    

    updatedBy:{type: Types.ObjectId, ref:'User'}
    
},{timestamps:true});

userSchema.pre('save', function(){
    this.password = generateHash({plainText: this.password});
    if(this.phone){
        this.phone = generateHash({plainText: this.phone})
    }
})

 

export const userModel = mongoose.models.User || model("User", userSchema);