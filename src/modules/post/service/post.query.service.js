import * as dbService from "../../../DB/db.service.js"
import { postModel } from "../../../DB/model/Post.model.js"

export const postList = async(parent,args)=>{

    const posts = await dbService.find({
        model:postModel
    })
    return {message:"Done" , statusCode: 300 , data: posts}
}