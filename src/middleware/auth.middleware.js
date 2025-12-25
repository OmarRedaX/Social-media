import { asyncHandler } from "../utils/response/error.response.js";
import { decodeToken } from "../utils/security/token.security.js";
import * as dbService from "../DB/db.service.js";
import { userModel } from "../DB/model/User.model.js";
import { postModel } from "../DB/model/Post.model.js";
import { commentModel } from "../DB/model/Comment.model.js";


export const authentication = ()=> {

    return asyncHandler(async (req,res,next) => {
            
            const {authorization} = req.headers;
            req.user = await decodeToken({authorization, next});
            return next();
            

        }
)

}

export const authorization = (accessRoles = [])=> {

    return asyncHandler(async (req,res,next) => {
            
            if(!accessRoles.includes(req.user.role)){
                return next (new Error ("Forbidden access",{cause:403}));
            }

            return next();
        }
)

}

export const blockCheck = () => {

    return asyncHandler(async (req, res, next) => {

        let ownerId = null;

        // Direct user
        if(req.params.userId || req.params.profileId){
            ownerId = req.params.userId || req.params.profileId;
        }


        // Comment
        if(!ownerId && req.params.commentId){

            const comment = await dbService.findOne({
                model: commentModel,
                filter: {_id: req.params.commentId , isDeleted: {$exists:false} }
            })

            if(!comment){
                return next(new Error("Comment not found", {cause:404}))
            }

            ownerId = comment.createdBy;
        }

        // Post 
        else if(!ownerId && req.params.postId){

            const post = await dbService.findOne({
                model: postModel,
                filter: { _id: req.params.postId , isDeleted: {$exists:false}  }
            })

            if(!post){
                return next(new Error("Post not found", {cause:404}))
            }

            ownerId = post.createdBy;
        }

        

        if (!ownerId){
            return next();
        }

        if (ownerId.toString() === req.user._id.toString()) {
        return next();
        }


        const iBlockedHim = await dbService.findOne({
            model: userModel,
            filter:{
                _id: req.user._id,
                "blockedUsers.userId": ownerId
            }
        })

        if(iBlockedHim){
            return next(new Error("You blocked this user", { cause: 403 }));
        }

        const heBlockedMe = await dbService.findOne({
            model: userModel,
            filter:{
                _id: ownerId,
                "blockedUsers.userId": req.user._id
            }
        })

        if (heBlockedMe) {
        return next(new Error("You are blocked by this user", { cause: 403 }));
        }

        next();
    })
    };