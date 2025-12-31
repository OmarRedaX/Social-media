import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { imageType } from "../../../utils/graphql/app.types.shared.js"


export const oneUserType = {
    
    _id:{type: GraphQLID},
    username:{type: GraphQLString},
    email:{type: GraphQLString},
    password:{type: GraphQLString},
    image:{type: imageType},
    isBanned: { type: GraphQLBoolean },
    phone:{type: GraphQLString},
    address:{type: GraphQLString},
    DOB:{type: GraphQLString},
    coverImages:{type: new GraphQLList(imageType)},
    gender:{type: new GraphQLEnumType({
        name:"genderEnum",
        description:"gender types",
        values:{
            male:{type: GraphQLString},
            female:{type: GraphQLString}
        }
    })},
    role:{type: new GraphQLEnumType({
        name:"roleEnum",
        description:"Role types",
        values:{
            admin: {type: GraphQLString},
            superAdmin: {type: GraphQLString},
            user: {type: GraphQLString},
        }
    })},
    confirmEmail:{ type: GraphQLBoolean },
    isDeleted:{type: GraphQLString},
    changeCredentialsTime:{type: GraphQLString},
    provider:{type: new GraphQLEnumType({
        name:"providerEnum",
        description:"provider type",
        values:{
            system:{type: GraphQLString},
            google:{type: GraphQLString}
        }
    })},
    twoStepVerification:{ type: GraphQLBoolean },
    updatedBy:{type: GraphQLID}
}



export const oneUserResponse = new GraphQLObjectType({

    name:"oneUserResponse",
    description:"Get Users",
    fields:{
        ...oneUserType,
        viewers:{type: new GraphQLList(new GraphQLObjectType({
            name:"viewersList",
            fields:{
                ...oneUserType
            }
        }))},
        friendsList:{type: new GraphQLList(new GraphQLObjectType({
            name:"friendsList",
            fields:{
                ...oneUserType
            }
        }))},
        sentFriendRequests:{type: new GraphQLList(new GraphQLObjectType({
            name:"sendFriendRequestList",
            fields:{
                ...oneUserType
            }
        }))},
        receivedFriendRequests:{type: new GraphQLList(new GraphQLObjectType({
            name:"receivedFriendRequestsList",
            fields:{
                ...oneUserType
            }
        }))},
        blockedUsers:{type: new GraphQLList(new GraphQLObjectType({
            name:"blockedUsersList",
            fields:{
                ...oneUserType
            }
        }))}
        
    }
})


export const userListResponse = new GraphQLObjectType({

    name:"userListResponse",
    description:"user list",
    fields:{
        message:{type: GraphQLString},
        statusCode:{type: GraphQLInt},
        data:{
            type: new GraphQLList(oneUserResponse)
        }
    }
})


export const getProfileResponse = new GraphQLObjectType({

    name:"getProfileResponse",
    description:"Get Profile",
    fields:{
         message:{type: GraphQLString},
        statusCode:{type: GraphQLInt},
        data:{
            type: oneUserResponse
        }
    }
})