import joi from "joi";
import { gerneralFields } from "../../middleware/validation.middleware.js";

export const createComment = joi.object().keys({
    postId: gerneralFields.id.required(),
    commentId:gerneralFields.id,
    content: gerneralFields.content,
    file: joi.array().items(gerneralFields.file).max(2)
}).or('content', 'file');


export const updateComment = joi.object().keys({
    postId: gerneralFields.id.required(),
    commentId: gerneralFields.id.required(),
    content: gerneralFields.content,
    file: joi.array().items(gerneralFields.file).max(2),
}).or('content', 'file');

export const freezeComment = joi.object().keys({
    postId: gerneralFields.id.required(),
    commentId: gerneralFields.id.required(),
}).required();

export const likeComment = joi.object().keys({
    action: joi.string().valid('like', 'unlike').required(),
    postId: gerneralFields.id.required(),
    commentId: gerneralFields.id.required()
}).required();