import { GraphQLObjectType, GraphQLString } from "graphql";



export const imageType = new GraphQLObjectType({
    name:"ImageType",
    description:"get the images",
    fields:{
        secure_url:{type: GraphQLString},
        public_id:{type: GraphQLString},
    }
})