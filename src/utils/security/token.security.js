import jwt from "jsonwebtoken";
import { userModel } from "../../DB/model/User.model.js";
import * as dbService from "../../DB/db.service.js";

export const generateToken = ({payload={}, signature=process.env.USER_ACCESS_TOKEN , tokenType=tokenTypes.access, expiresIn=process.env.EXPIRESIN})=> {

    const token = jwt.sign({ ...payload, tokenType }, signature, {expiresIn: parseInt(expiresIn)});
    return token;
}

export const verifyToken = ({token, signature=process.env.USER_ACCESS_TOKEN})=> {

    const decoded = jwt.verify(token, signature);
    return decoded;
}


export const tokenTypes = {
    access: "access",
    refresh: "refresh"
}


export const decodeToken = async ({authorization="", next={} } = {}) => {

    const [ bearer, token ] = authorization.split(" ") || [];
    
    if(!token || !bearer){
        return next (new Error ("In-valid missing token",{cause:400}));
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
    } catch {
        try {
            decoded = verifyToken({ token, signature: refreshSignature });
        } catch {
            return next(new Error("Invalid token", { cause: 401 }));
        }
    }

    if(!decoded?.id || !decoded?.tokenType){
        return next (new Error ("Invalid token",{cause:401}));
    }

    const user = await dbService.findOne({model: userModel, filter: {_id: decoded.id , isDeleted:{$exists:false}}});
    
    if(!user){
        return next (new Error ("Not registered account",{cause:404}));
    }
    
    if(user.changeCredentialsTime?.getTime() >= decoded.iat * 1000){
        return next (new Error ("Token expired, please login again",{cause:400}));
    }
    
    return user ;

}