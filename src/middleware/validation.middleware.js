import joi from "joi";
import { Types } from "mongoose";
import { genderTypes } from "../DB/model/User.model.js";

export const isValidObjectId = (value, helpers) => {
    return Types.ObjectId.isValid(value) ? true : helpers.message(`${value} is not a valid ObjectId`);
}

const fileObj= {

        fieldname: joi.string().valid('attachment') ,
        originalname: joi.string() ,
        encoding: joi.string(),
        mimetype:joi.string() ,
        finalPath: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
     
         }


export const gerneralFields = {

     username: joi.string().trim().min(3).max(50),
     email: joi.string().email({minDomainSegments: 2, maxDomainSegments: 3 , tlds: { allow: ['com', 'net'] }}),
     password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
     confirmationPassword: joi.string(),
     otp: joi.string().pattern(new RegExp(/^[0-9]{4}$/)),
     id: joi.string().custom(isValidObjectId),
     DOB: joi.date().less('now').greater('1-1-1900'),
     gender: joi.string().valid(...Object.values(genderTypes)),
     phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
     address: joi.string().min(5).max(200),
     fileObj,
     file: joi.object().keys(fileObj),
     content: joi.string().min(2).max(5000).trim()
}



export const validation = (Schema)=> {
    return (req,res,next) => {
        const inputs = {...req.body, ...req.params, ...req.query};

        if(req.file || req.files?.length) {
            inputs.file = req.file || req.files;
        }

        const validationResult = Schema.validate(inputs, {abortEarly: false});

        if (validationResult.error) {
            return res.status(400).json({message: "Validation Error", details: validationResult.error.details});
        }

        return next();
    }
}