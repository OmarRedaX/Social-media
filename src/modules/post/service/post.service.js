import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { roleTypes, userModel } from "../../../DB/model/User.model.js";
import { commentModel } from "../../../DB/model/Comment.model.js";
import { paginate } from "../../../utils/pagination/pagination.js";


export const getPosts = asyncHandler(async (req, res, next) => {

    let {page, size}= req.query;
    
    const data = await paginate({
        page,
        size,
        model:postModel,
        populate:[{
                path:'comments',
                match:{isDeleted:{$exists:false} , commentId:{$exists:false}},
                populate:[
                    {
                        path:'replys',
                        match:{isDeleted:{$exists:false}}
                    }
                ]
            }],
        filter: { isDeleted: { $exists: false } , archived: {$exists:false}}   
         })
  

    return successResponse({ res, message: "Posts retrieved successfully" , status: 200 , data });

    // const results = []

    // const cursor = postModel.find({}).cursor();

    // for(let post= await cursor.next(); post != null; post = await cursor.next()){
    //     const comments = await dbService.find({
    //         model: commentModel,
    //         filter: { postId: post._id , isDeleted:{$exists:false} },
    //     })

    //     results.push({post,comments})
    // }

    // return successResponse({res, status:200 , message:"Posts retrieved successfully", data: {results}})

})


export const getMyposts = asyncHandler(async (req, res, next) => {

    let {page, size}= req.query;

    const data = await paginate({
        page,
        size,
        model:postModel,
        populate:[{
            path:'comments',
            match:{isDeleted:{$exists:false} , commentId:{$exists:false}},
            populate:[
                {
                    path:'replys',
                    match:{isDeleted:{$exists:false}}
                }
            ]
        }],
        filter: { createdBy: req.user._id, isDeleted: { $exists: false } , archived: {$exists:false}}   
    })

    if(!data){
        return next(new Error("No posts found", {cause: 404}))
    }

    return successResponse({res, status: 200, message:"posts retrieved successfully", data})     

})


export const getMyFriendsPosts = asyncHandler(async (req, res, next) => {

    let {page, size}= req.query;

    const user = await dbService.findOne({
        model: userModel,
        filter: {_id: req.user._id}
    })

    if(!user || !user.friendsList.length){
        return next(new Error("No friends posts found", {cause:404}))
    }

    const friendsIds = user.friendsList.map(friend => friend.userId);

    const data = await paginate({
        page,
        size,
        model: postModel,
        filter: { 
            createdBy: { $in: friendsIds },
            isDeleted: { $exists: false },
            archived: { $exists: false}
        },
        populate:[{
            path:'comments',
            match:{isDeleted:{$exists:false} , commentId:{$exists:false}},
            populate:[
                {
                    path:'replys',
                    match:{isDeleted:{$exists:false}}
                }
            ]
        }] 
    })

    return successResponse({res, status: 200, message:"friends posts retrieved successfully", data})     

})


export const getUserPosts = asyncHandler(async (req, res, next) => {

    let {page, size}= req.query;
    const {userId} = req.params;

    const user = await dbService.findOne({
        model: userModel,
        filter:{_id: userId}
    })

    if(!user){
        return next(new Error("User not found", {cause:404}))
    }

    const data = await paginate({
        page,
        size,
        model:postModel,
        populate:[{
            path:'comments',
            match:{isDeleted:{$exists:false} , commentId:{$exists:false}},
            populate:[
                {
                    path:'replys',
                    match:{isDeleted:{$exists:false}}
                }
            ]
        }],
        filter: { createdBy: user._id, isDeleted: { $exists: false } , archived: {$exists:false}}   
    })

    if(!data){
        return next(new Error("No posts found", {cause: 404}))
    }

    return successResponse({res, status: 200, message:"posts retrieved successfully", data})     

})



export const createPost = asyncHandler(async (req, res, next) => {

    const {content} = req.body;

    let attachments = [];

    for(const file of req.files){
        const { secure_url , public_id} = await cloud.uploader.upload(file.path , { folder : `${process.env.APP_NAME}/Posts` })
        attachments.push({ secure_url , public_id })
    }

    const post = await dbService.create({
        model: postModel,
        data:{
            content,
            attachments,
            createdBy: req.user._id
        }
    })

    return successResponse({ res, message: "Post created successfully" , status: 201 , data: {post} });

})


export const updatePost = asyncHandler(async (req, res) => {
    

    let attachments = [];

    if(req.files?.length){
        for(const file of req.files){
        const { secure_url , public_id} = await cloud.uploader.upload(file.path , { folder : `${process.env.APP_NAME}/Posts` })
        attachments.push({ secure_url , public_id })
        }

        req.body.attachments = attachments;
    }

    

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId , createdBy: req.user._id , isDeleted: {$exists: false} },
        data:{
            ...req.body,
            updatedBy: req.user._id
        },
        options: { new: true }
    })

    return post ? successResponse({ res, message: "Post updated successfully" , status: 200 , data: {post} })
    : next(new Error("Post not found" , { cause: 404 }));

})


export const freezePost = asyncHandler(async (req, res) => {

    const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id };

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId , ...owner , isDeleted: {$exists: false} },
        data:{
            isDeleted: Date.now(),
            updatedBy: req.user._id,
            deletedBy: req.user._id
        },
        options: { new: true }
    })

    return post ? successResponse({ res, message: "Post updated successfully" , status: 200 , data: {post} })
    : next(new Error("Post not found" , { cause: 404 }));

})


export const unFreezePost = asyncHandler(async (req, res) => {

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId , deletedBy: req.user._id , isDeleted: {$exists:true} },
        data:{
            $unset: { isDeleted: "" , deletedBy: "" },
            updatedBy: req.user._id
        },
        options: { new: true }
    })

    return post ? successResponse({ res, message: "Post updated successfully" , status: 200 , data: {post} })
    : next(new Error("Post not found" , { cause: 404 }));

})


export const deletePost = asyncHandler(async(req,res,next)=>{

    
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const post = await dbService.findOne({
        model: postModel,
        filter:{
            _id: req.params.postId,
            isDeleted: {$exists: false}
        }
    })

    if(!post){
        return next(new Error("Post not found", { cause: 404 }));
    }

    if(req.user.role !== roleTypes.admin && req.user.role !== roleTypes.superAdmin){

        if (post.createdBy.toString() !== req.user._id.toString()) {
            return next(new Error("Not authorized to delete this post", { cause: 403 }));
        }

        if(post.createdAt <= twoMinutesAgo){
            return next(new Error("You can only delete a post within 2 minutes of its creation", { cause: 403 }));
        }
    }


    await dbService.deleteOne({
        model: postModel,
        filter:{
            _id: post._id,
        }
    })

    

    return successResponse({ res, message: "Post deleted successfully" , status: 200 })

})



export const archivePost = asyncHandler(async(req,res,next)=>{

    const twentyFourHoursLater = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const post = await dbService.findOne({
        model: postModel,
        filter:{
            _id: req.params.postId,
            isDeleted: {$exists: false}
        }
    })

    if(!post){
        return next(new Error("Post not found", { cause: 404 }));
    }

    if(req.user.role !== roleTypes.admin && req.user.role !== roleTypes.superAdmin){

        if (post.createdBy.toString() !== req.user._id.toString()) {
            return next(new Error("Not authorized to archive this post", { cause: 403 }));
        }

        if(post.createdAt >= twentyFourHoursLater){
            return next(new Error("You can only archive a post after 24 hours of its creation", { cause: 403 }));
        }
    }

    if(post.archived){
        return next(new Error("Post is already archived", { cause: 400 }));
    }

    await dbService.updateOne({
        model: postModel,
        filter: {
            _id: post._id
        },

        data: {
            archived : true,
            updatedBy: req.user._id
        }
    })

    return successResponse({ res, message: "Post archived successfully" , status: 200  })

})



export const likePost = asyncHandler(async (req, res) => {

    const data = req.query.action === 'like' ? {$addToSet: { likes: req.user._id }} : {$pull: { likes: req.user._id }};

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId , isDeleted: {$exists: false} },
        data,
        options: { new: true }
    })

    return post ? successResponse({ res, message: `${req.query.action === 'like' ? 'Post liked successfully' : 'Post unliked successfully'}` , status: 200 , data: {post} })
    : next(new Error("Post not found" , { cause: 404 }));

})








