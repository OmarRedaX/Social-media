import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { oneUserResponse } from "../../user/types/user.types.js";
import { imageType } from "../../../utils/graphql/app.types.shared.js";
import * as dbService from "../../../DB/db.service.js";
import {userModel} from "../../../DB/model/User.model.js"
        


export const onePostResponse = new GraphQLObjectType({
    name:"onePostResponse",
    description:"Get posts",
    fields:{
        _id:{type: GraphQLID},
        content:{type: GraphQLString},
        attachments:{
            type: new GraphQLList(imageType)
        },
        likes: { type: new GraphQLList(GraphQLID) },
        tags: { type: new GraphQLList(GraphQLID) },
        createdBy: { type: GraphQLID }, 
        createdByPopulate:{
            type: oneUserResponse,
            resolve: async(parent, args)=>{
                const user = await dbService.findOne({
                    model: userModel,
                    filter:{_id: parent.createdBy.toString()}
                })
                return user
            }
        },
        updatedBy: { type: GraphQLID },
        deletedBy: { type: GraphQLID },
        isDeleted: {type: GraphQLString},
        archived: {type: GraphQLBoolean },
        createdAt:{type: GraphQLString},
        updatedAt:{type: GraphQLString},
    }
})


export const postListResponse = new GraphQLObjectType({

    name:"postListResponse",
    description:"Post list",
    fields:{
        message:{type: GraphQLString},
        statusCode:{type: GraphQLInt},
        data:{
            type: new GraphQLList(onePostResponse)
        }
    }
})


export const likePostResponse = new GraphQLObjectType({

    name:"likePostResponse",
    description:"like Post",
    fields:{
        message:{type: GraphQLString},
        statusCode:{type: GraphQLInt},
        data:{
            type: onePostResponse
        }
    }
})