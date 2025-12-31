import * as dbService from "../../../DB/db.service.js"
import {userModel} from "../../../DB/model/User.model.js"
import { authentication } from "../../../middleware/graph/auth.middleware.js"
import { validation } from "../../../middleware/graph/validation.middleware.js"

export const userList = async(parent, args)=>{
    
    const users = await dbService.find({
        model: userModel
    })
    return {message: "Done", statusCode: 200, data: users}
}


export const getProfile = async(parent, args)=>{

    const {authorization} = args;

    const user = await authentication({authorization})
    
    return {message: "Done", statusCode: 200, data: user}
}