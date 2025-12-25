import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { roleTypes, userModel } from "../../../DB/model/User.model.js";
import {postModel} from "../../../DB/model/Post.model.js"
import { emailEventEmitter } from "../../../utils/events/email.event.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";


export const dashboard = asyncHandler(async(req,res,next)=>{

    const result = await Promise.allSettled([
        dbService.find({
        model: postModel,
        filter: {}}),

        dbService.find({
        model: userModel,
        filter: {}})
    ])

    if(result.length <= 0){
        return next(new Error("No Data to show") , { cause: 409 })
    }

    return successResponse({res, message: "Dashboard fetched successfully",data: {result}});

})


export const changeRoles = asyncHandler(async(req,res,next)=>{

    const {userId} = req.params;
    const {role} = req.body

    const roles = req.user.role === roleTypes.superAdmin ? { role: {$nin: [roleTypes.superAdmin] } } : {role: {$nin: [roleTypes.superAdmin , roleTypes.admin] }}

    const updatedRole = await dbService.findOneAndUpdate({
        model:userModel,
        filter:{
            _id: userId,
            isDeleted: {$exists:false},
            ...roles
        },
        data:{
            role,
            updatedBy:req.user._id
        }
    })

    if(!updatedRole){
        return next(new Error("Invalid user role or user not found", {cause:404}))
    }

    return successResponse({res, message: "User role updated successfully",data: {updatedRole}});

})



export const profile = asyncHandler(async (req, res, next) => {

    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false },
        populate: [{ 
            path: "viewers.userId",
            select: "username email image"
        }]
    
    });
    

    return successResponse({res, message: "User profile fetched successfully",data: {user}});

})


export const twoStepVerification = asyncHandler(async(req,res,next)=>{

    const user= await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, isDeleted:{$exists: false} , twoStepVerification:{$exists: false}},
    });

    if(!user){
        return next(new Error("You already enabled Two-Step Verfification"))
    }
        
    emailEventEmitter.emit("sendtwoStepVerificationEmail",{id: user._id , username: user.username, email: user.email, action:"enable Two-Step Verfification"})

    return successResponse({res, message: "A verification code has been sent to your email address. If you don't see it, please check your spam or junk folder"});

})


export const enableTwoStepVerification = asyncHandler(async(req,res,next)=>{

    const {otp} = req.body;

    if(req.user.twoStepVerification){
        return next(new Error("You already enabled Two-Step Verfification"))
    }

    if(!req.user.twoStepVerificationOTP || req.user.OTPExpires < Date.now()){
        return next(new Error('Verification OTP has expired. Please request a new OTP.', {cause: 410}));
    }

    if(!compareHash({plainText:otp , hashValue: req.user.twoStepVerificationOTP})){
        return next(new Error("The OTP you entered is incorrect. Please try again."))
    }

    await dbService.updateOne({
        model: userModel,
        filter:{_id: req.user._id},
        data:{
            twoStepVerification: true,
            changeCredentialsTime:Date.now(),
            $unset:{ OTPExpires:"" , twoStepVerificationOTP:"" }
        }
    })

    return successResponse({res, message:"Two-step verification has been enabled successfully.", status:200})

})


export const updateProfile = asyncHandler(async (req, res, next) => {

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: {$exists: false} },
        data: req.body,
        options: { new: true }
    
    });
    

    return successResponse({res, message: "User profile fetched successfully",data: {user}});

})



export const updateProfileImage = asyncHandler(async (req, res, next) => {

    const {secure_url , public_id} = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/user/${req.user._id}/profile` });

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false },
        data: { image: {secure_url, public_id} },
        options: { new: false }
    
    });

    if(user.image?.public_id){
        await cloud.uploader.destroy(user.image.public_id);
    }

    return successResponse({res, message: "User profile image updated successfully",data: {user}});

})




export const updateProfileCoverImages = asyncHandler(async (req, res, next) => {

    let images = [];
    for(const file of req.files){
        const {secure_url , public_id} = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/user/${req.user._id}/coverImages` });
        images.push({secure_url, public_id});
    }

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false },
        data: { coverImages: images },
        options: { new: true }
    
    });
    

    return successResponse({res, message: "User profile image updated successfully",data: {file: req.files}});

})



export const shareProfile = asyncHandler(async (req, res, next) => {

    const { profileId } = req.params;

    let user = null;

    if(profileId === req.user._id.toString()){
        user = req.user;
    }

    else {

        user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: profileId, isDeleted:{$exists:false} },
        data: {
            $push: { viewers: {userId: req.user._id , time: Date.now()  }}
        },
        select: "username email image gender viewers",
        options: {new: true}
    })

        if(!user){
        return next(new Error("User not found", {cause:404}))
    }   

        const sameUserViews = user.viewers
        .filter(v => v.userId.toString() === req.user._id.toString())
        .sort((a, b) => a.time - b.time);

        if(sameUserViews.length > 5) {

             const updatedUser = await dbService.findOneAndUpdate({
                model: userModel,
                filter:{ _id: profileId },
                data: {
                    $pull: { viewers: {_id: sameUserViews[0]._id} }
                },
                options: {new: true},
                select: "username email viewers"
            })

            const latestViews = updatedUser.viewers
            .filter(v => v.userId.toString() === req.user._id.toString())
            .sort((a, b) => a.time - b.time);

            const viewTimes = latestViews.map(v => new Date(v.time).toLocaleString());

            emailEventEmitter.emit("sendProfileViewersEmail", { email: updatedUser.email, username: updatedUser.username , viewTimes, viewerName: req.user.username })

        }

    }
    

    return successResponse({res, message: "Shared profile fetched successfully",data: {user}});

})


export const updateEmail = asyncHandler(async (req, res, next) => {

    const { newEmail } = req.body;
    
    if(await dbService.findOne({ model: userModel, filter: { email: newEmail } })){
        return next(new Error("Email already exists", { cause: 409 }));
    }

    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { tempEmail: newEmail }
    });

    emailEventEmitter.emit("sendConfirmEmail", { id: req.user._id, username: req.user.username, email: req.user.email , action: "update your email" });
    emailEventEmitter.emit("sendConfirmTempEmail", { id: req.user._id, username: req.user.username, email: newEmail, action: "update your email"  });

    return successResponse({res, message: "Please check your email to confirm your new email address"});

})


export const resetEmail = asyncHandler(async (req, res, next) => {

    const { oldEmailOTP, newEmailOTP } = req.body;

    if(!compareHash({ plainText: oldEmailOTP, hashValue: req.user.confirmEmailOTP } || !compareHash({ plainText: newEmailOTP, hashValue: req.user.tempEmailOTP }))){
        return next(new Error("Old email OTP or new email OTP is invalid", { cause: 400 }));
    }

    if(!req.user.tempEmail){
        return next(new Error("There is no new email to confirm", { cause: 400 }));
    }

    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { email: req.user.tempEmail,
            changeCredentialsTime: Date.now(),
            $unset: { tempEmail: 0, tempEmailOTP: 0, confirmEmailOTP: 0 } }
    });
    

    return successResponse({res, message: "Email updated successfully"});
})


export const updatePassword = asyncHandler(async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;
    
    if(!compareHash({ plainText: oldPassword, hashValue: req.user.password })){
        return next(new Error("Old password is invalid", { cause: 400 }));
    }

    const hashedPassword = generateHash({ plainText: newPassword });

    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { password: hashedPassword , changeCredentialsTime: Date.now() }
    });

    return successResponse({res, message: "Password updated successfully"});

})


export const sendFriendRequest = asyncHandler(async (req,res,next)=>{
    
    if (req.user._id.toString() === req.params.profileId) {
        return next(new Error("You can't send friend request to yourself", { cause: 400 }));
    }
    
    const action = req.query.action;
    
    if (action === 'add-friend') {
        
        const result = await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.params.profileId,
                "receivedFriendRequests.userId": { $ne: req.user._id },
                "sentFriendRequests.userId": { $ne: req.user._id },
                "friendsList.userId": { $ne: req.user._id },
                role: {$ne: roleTypes.superAdmin}
            },
            data:{
                $addToSet: {receivedFriendRequests:{userId: req.user._id}}
            }
        });
        
        if (!result.modifiedCount) {
            return next(new Error("Friend request already sent or already friends & you can't send friend request to super admin", { cause: 400 }));
        }
        
        await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.user._id
            },
            data:{
                $addToSet: { sentFriendRequests: {userId: req.params.profileId} }
            }
        });
        
        return successResponse({ res, message: "Friend request sent successfully" });
    
    }
    
    // ================= CANCEL =================
     
    if (action === 'cancel-request') {
        
        const result = await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.params.profileId,
                "receivedFriendRequests.userId": req.user._id
            },
            data:{
                $pull: {receivedFriendRequests: {userId: req.user._id}}
            }
        });
        
        if (!result.modifiedCount) {
            return next(new Error("You have not sent a friend request", { cause: 400 }));
        }
        
        await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.user._id
            },
            data:{
                $pull: {sentFriendRequests: {userId: req.params.profileId}}
            }
        });
        
        return successResponse({ res, message: "Friend request cancelled successfully" });
    }  

});


export const friendsRequest = asyncHandler(async(req,res,next)=>{

    if (req.user._id.toString() === req.params.profileId) {
        return next(new Error("You can't accept or reject friend request to yourself", { cause: 400 }));
    }
    
    const action = req.query.action;
    
    if (action === 'accept') {
        
        const result = await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.user._id,
                "receivedFriendRequests.userId": req.params.profileId 
            },
            data:{
                $addToSet: {friendsList:{userId: req.params.profileId}},
                $pull:{receivedFriendRequests:{userId: req.params.profileId}}
            }
        });
        
        if (!result.modifiedCount) {
            return next(new Error("User has not sent a friend request or already a friend", { cause: 400 }));
        }
        
        await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.params.profileId
            },
            data:{
                $addToSet: { friendsList: {userId: req.user._id} },
                $pull:{sentFriendRequests:{userId: req.user._id}}
            }
        });
        
        return successResponse({ res, message: "Friend request accepted successfully" });
    
    }
    
    // ================= rejection =================
     
    if (action === 'reject') {
        
        const result = await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.user._id,
                "receivedFriendRequests.userId": req.params.profileId
            },
            data:{
                $pull: {receivedFriendRequests: {userId: req.params.profileId}}
            }
        });
        
        if (!result.modifiedCount) {
            return next(new Error("User has not sent a friend request or already a friend", { cause: 400 }));
        }
        
        await dbService.updateOne({
            model: userModel,
            filter:{
                _id: req.params.profileId
            },
            data:{
                $pull: {sentFriendRequests: {userId: req.user._id}}
            }
        });
        
        return successResponse({ res, message: "Friend request rejected successfully" });
    }  

})



export const blockUser = asyncHandler(async (req,res,next)=>{

    const {email} = req.body;

    const user = await dbService.findOne({
        model: userModel,
        filter: {email}
    })

    if(!user){
        return next(new Error("User not found", {cause:404}))
    }

    await dbService.findOneAndUpdate({
        model:userModel,
        filter:{_id: req.user.id},
        data:{$addToSet: { blockedUsers: { userId: user._id } }}
    })

    
    return successResponse({res, message: `${user.username} blocked successfully`, status:201});

})


export const unBlockUser = asyncHandler(async(req,res,next)=>{

    const {email} = req.body;

    const user = await dbService.findOne({
        model: userModel,
        filter: {email}
    })

    if(!user){
        return next(new Error("User not found", {cause:404}))
    }

    await dbService.findOneAndUpdate({
        model:userModel,
        filter:{_id: req.user.id},
        data:{$pull: { blockedUsers: { userId: user._id } }}
    })

    
    return successResponse({res, message: `${user.username} unblocked successfully`, status:201});

})