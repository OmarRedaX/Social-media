import { authentication } from "../../../middleware/Socket/auth.middleware.js";
import * as dbService from "../../../DB/db.service.js"
import { chatModel } from "../../../DB/model/Chat.model.js";
import { socketConnections } from "../../../DB/model/User.model.js";

export const sendMessage = (socket)=> {

    return socket.on("sendMessage", async messageData=>{

        const {data , valid} = await authentication({socket})
        console.log({data , valid});
        if(!valid){
            return socket.emit("socket_Error" , data);
        }
        const userId = data.user._id.toString()
        const {message, destId}= messageData
        console.log({userId, message, destId});
         
        let chat = await dbService.findOneAndUpdate({
            model: chatModel,
            filter:{
                $or:[
                    {
                        mainUser: userId,
                        subParticipant: destId
                    },
                    {
                        mainUser: destId,
                        subParticipant: userId
                    }
                ]
            },
            data:{
                $push: {messages: {message, senderId: userId}}
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

        if(!chat){
            
            chat = await dbService.create({
                model: chatModel,
                data:{
                    mainUser: userId,
                    subParticipant: destId,
                    messages: [{message, senderId: userId}]
                }
            })
        }

        socket.emit("successMessage", {chat , message})
        socket.to(socketConnections.get(destId)).emit("receiveMessage", {chat , message})

        return "Done"
        
    })
}