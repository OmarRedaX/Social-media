import * as dbService from "../../DB/db.service.js";
import { verifyToken } from "../../utils/security/token.security.js";
import { userModel } from "../../DB/model/User.model.js";



export const authentication = async({authorization="", accessRoles=[], checkAuthorization=false}={})=> {

    const [ bearer, token ] = authorization.split(" ") || [];
        
    if(!token || !bearer){
         throw new Error ("In-valid missing token");
    }
    
    let accessSignature = '';
    let refreshSignature = '';

    switch (bearer) {
        
        case "System":
            accessSignature = process.env.ADMIN_ACCESS_TOKEN;
            refreshSignature = process.env.ADMIN_REFRESH_TOKEN;
            break;
            
        case "Bearer":
            accessSignature = process.env.USER_ACCESS_TOKEN;
            refreshSignature = process.env.USER_REFRESH_TOKEN;
            break;
            
        default:
            break;            
                    
    }

    let decoded;
    
        try {
        decoded = verifyToken({ token, signature: accessSignature });
    } 
    catch {
        try {
            decoded = verifyToken({ token, signature: refreshSignature });
        } 
        catch {
             throw new Error("Invalid token");
        }
    }

    if(!decoded?.id || !decoded?.tokenType){
         throw new Error ("Invalid token");
    }

    const user = await dbService.findOne({model: userModel, filter: {_id: decoded.id , isDeleted:{$exists:false}}});
    
    if(!user){
         throw new Error ("Not registered account");
    }
    
    if(user.changeCredentialsTime?.getTime() >= decoded.iat * 1000){
         throw new Error ("Token expired, please loginagain");
    }

    if(checkAuthorization && !accessRoles.includes(user.role)){
        throw new Error ("Not Authorized account")
    }
    
    return user ;

}

