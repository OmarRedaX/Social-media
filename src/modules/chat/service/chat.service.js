import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js"
import { chatModel } from "../../../DB/model/Chat.model.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const getChat = asyncHandler(async(req,res,next)=>{

    const {friendId} = req.params;

    const chat = await dbService.findOne({
        model: chatModel,
        filter:{
            $or:[
                {
                    mainUser: req.user._id,
                    subParticipant: friendId
                },
                {
                    mainUser: friendId,
                    subParticipant: req.user._id
                }
            ]
        },
        populate:[
            {
                path:"mainUser",
                select:"username email image"
            },
            {
                path:"subParticipant",
                select:"username email image"
            },
            {
                path:"messages.senderId",
                select:"username email image"
            }
        ]
    })
    

    return successResponse({message:"Chat fetched successfully",data:{chat}, res, statusCode:200})

})