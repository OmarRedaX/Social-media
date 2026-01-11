import * as dbService from "../../DB/db.service.js";
import { verifyToken } from "../../utils/security/token.security.js";
import { userModel } from "../../DB/model/User.model.js";



export const authentication = async({socket={}, accessRoles=[], checkAuthorization=false}={})=> {

    const [ bearer, token ] = socket?.handshake?.auth?.authorization?.split(" ") || [];
        
    if(!token || !bearer){
         return {data: {message: "In-valid missing token" , status:401}};
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
             return {data: {message: "Invalid token" , status:401}};
        }
    }

    if(!decoded?.id || !decoded?.tokenType){
         return {data: {message: "Invalid token", status:401}};
    }

    const user = await dbService.findOne({model: userModel, filter: {_id: decoded.id , isDeleted:{$exists:false}}});
    
    if(!user){
         return {data: {message: "Not registered account", status:401}};
    }
    
    if(user.changeCredentialsTime?.getTime() >= decoded.iat * 1000){
         return {data: {message: "Token expired, please loginagain", status:401}};
    }

    if(checkAuthorization && !accessRoles.includes(user.role)){
        return {data: {message: "Not Authorized account", status:401}};
    }
    
    return { data: {message: "Done", user}, valid: true } ;

}

