import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js";
import { commentModel } from "../../../DB/model/Comment.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { roleTypes } from "../../../DB/model/User.model.js";



export const createComment = asyncHandler(async (req, res , next) => {

    const { postId , commentId } = req.params;

    if(commentId && !await dbService.findOne({
        model:commentModel,
        filter:{_id:commentId, postId, isDeleted:{$exists:false}}
    })){
        return next( new Error("Invalid parent comment"), {cause:409})
    }

    const post = await dbService.findOne({ model: postModel , filter: { _id: postId , isDeleted: {$exists: false} } });
    if (!post) {
        return next(new Error("Post not found", { cause: 404 }));
    }

    let attachments = [];
    
        if(req.files?.length){
            for(const file of req.files){
            const { secure_url , public_id} = await cloud.uploader.upload(file.path , { folder : `${process.env.APP_NAME}/user/${post.createdBy}/Post/${postId}/Comments` })
            attachments.push({ secure_url , public_id })
            }
    
            req.body.attachments = attachments;
        }

    const comment = await dbService.create({
        model: commentModel,
        data: {
            ...req.body,
            commentId,
            postId,
            createdBy: req.user._id
        }
    });

    return successResponse({ res, message: "Comment created successfully" , status: 201 , data: {comment} });
});



export const updateComment = asyncHandler(async (req, res , next) => {

    const {postId, commentId } = req.params;

    const comment = await dbService.findOne({
        model: commentModel ,
        filter: {
             _id: commentId ,
            postId,
            createdBy: req.user._id,
            isDeleted: {$exists: false} 
        },
        
        populate: [{ path: 'postId'}]
         
    });

    if (!comment || comment.postId.isDeleted) {
        return next(new Error("Comment not found", { cause: 404 }));
    }

    
    
        if(req.files?.length){
            const attachments = [];
            for(const file of req.files){
            const { secure_url , public_id} = await cloud.uploader.upload(file.path , { folder : `${process.env.APP_NAME}/user/${comment.createdBy}/Post/${postId}/Comments` })
            attachments.push({ secure_url , public_id })
            }
    
            req.body.attachments = attachments;
        }

        const updatedComment = await dbService.findOneAndUpdate({
            model: commentModel,
            filter: {
                _id: commentId ,
                postId,
                createdBy: req.user._id,
                isDeleted: {$exists: false} 
            },
            data: {...req.body},
            options: { new: true }
        });

    return successResponse({ res, message: "Comment updated successfully", status: 200, data: { updatedComment } });

});


export const freezeComment = asyncHandler(async (req, res , next) => {

    const { postId, commentId } = req.params;

    const comment = await dbService.findOne({
        model: commentModel ,
        filter: {
             _id: commentId ,
            postId,
            createdBy: req.user._id,
            isDeleted: {$exists: false} 
        },
        
        populate: [{ path: 'postId'}]
         
    });

    if (!comment || comment.postId.isDeleted) {
        return next(new Error("Comment not found", { cause: 404 }));
    }

    if(comment.createdBy.toString() !== req.user._id.toString() && comment.postId.createdBy.toString() !== req.user._id.toString() && req.user.role !== roleTypes.admin){
        return next(new Error("You are not allowed to freeze this comment", { cause: 403 }));
    }

    const frozenComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId ,
            postId,
            createdBy: req.user._id,
            isDeleted: {$exists: false} 
        },
        data: { 
            isDeleted: Date.now(),
            deletedBy: req.user._id
         },
        options: { new: true }
    });

    return successResponse({ res, message: "Comment frozen successfully", status: 200, data: { frozenComment } });

});   


export const unfreezeComment = asyncHandler(async (req, res , next) => {

    const { postId, commentId } = req.params;

    const comment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter:{
            _id: commentId,
            postId,
            deletedBy: req.user._id,
            isDeleted: {$exists:true}
        },
        data: {
            $unset:{
                isDeleted:0,
                deletedBy:0
            },
            updatedBy: req.user._id
        },
        options: {
            new: true
        }
    })

    if(!comment){
        return next(new Error("Comment not found", { cause: 404 }));
    }
    

    return successResponse({res, message:"Comment unfrozen successfully", status:200 , data:{comment}})

});




export const likeComment = asyncHandler(async (req, res) => {

    const data = req.query.action === 'like' ? {$addToSet: { likes: req.user._id }} : {$pull: { likes: req.user._id }};

    const comment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: req.params.commentId , isDeleted: {$exists: false} },
        data,
        options: { new: true }
    })

    return comment ? successResponse({ res, message: `${req.query.action === 'like' ? 'comment liked successfully' : 'comment unliked successfully'}` , status: 200 , data: {comment} })
    : next(new Error("Comment not found" , { cause: 404 }));

})