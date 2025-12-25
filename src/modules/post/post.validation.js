import joi from 'joi';
import { gerneralFields } from '../../middleware/validation.middleware.js';

export const createPost = joi.object().keys({
    content: gerneralFields.content,
    file: joi.array().items(gerneralFields.file)
}).or('content', 'file');


export const updatePost = joi.object().keys({
    postId: gerneralFields.id.required(),
    content: gerneralFields.content,
    file: joi.array().items(gerneralFields.file)
}).or('content', 'file');


export const freezePost = joi.object().keys({
    postId: gerneralFields.id.required()
}).required();

export const userPosts = joi.object().keys({
    userId: gerneralFields.id.required()
}).required();

export const archivePost = freezePost;

export const likePost = joi.object().keys({
    action: joi.string().valid('like', 'unlike').required(),
    postId: gerneralFields.id.required()
}).required();