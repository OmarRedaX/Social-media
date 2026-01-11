import { authentication } from "../../../middleware/Socket/auth.middleware.js";
import { socketConnections } from "../../../DB/model/User.model.js";


export const registerSocket = async(socket)=>{

    const {data , valid} = await authentication({socket})
    console.log({data , valid});
    if(!valid){
        return socket.emit("socket_Error" , data);
    }
    socketConnections.set(data.user._id.toString(), socket.id)
    console.log(socketConnections);
    
    return "Done"
}

export const logoutSocketId = async(socket)=>{

    return socket.on('disconnect', async()=>{

        const {data , valid} = await authentication({socket})
        console.log({data , valid});
        if(!valid){
            return socket.emit("socket_Error" , data);
        }
        socketConnections.delete(data.user._id.toString())
        console.log(socketConnections);
        
        return "Done"
    })
    
}