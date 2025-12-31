import { GraphQLNonNull, GraphQLString } from 'graphql';
import * as userQueryService from './service/user.query.service.js';
import * as userTypes from './types/user.types.js';


export const query = {
    userList:{
        type: userTypes.userListResponse,
        resolve: userQueryService.userList
    },

    getProfile:{
        type: userTypes.getProfileResponse,
        args: {
            authorization: {type: new GraphQLNonNull(GraphQLString)}
        },
        resolve: userQueryService.getProfile
    }
}