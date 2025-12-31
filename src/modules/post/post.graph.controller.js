import * as postQueryService from './service/post.query.service.js';
import * as postTypes from './types/post.types.js';
import * as postMutationService from "./service/post.mutation.service.js"
import { GraphQLEnumType, GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

export const query = {
    
    postList:{
        type: postTypes.postListResponse,
        resolve: postQueryService.postList
    },

}


export const mutation = {

    likePost:{
        type: postTypes.likePostResponse,
        args:{
            postId: {type: new GraphQLNonNull(GraphQLID)},
            action: {type: new GraphQLNonNull(new GraphQLEnumType({
                name: "likePostActionEnum",
                values: {
                    like: {type: GraphQLString},
                    unlike: {type: GraphQLString}
                }
            }))},
            authorization: {type: new GraphQLNonNull(GraphQLString)}
        },
        resolve: postMutationService.likePost
    }
}