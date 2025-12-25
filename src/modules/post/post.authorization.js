import { roleTypes } from "../../DB/model/User.model.js";

export const endpoint = {
    createPost: [roleTypes.user],
    getPosts: [roleTypes.user],
    freezePost: [roleTypes.user, roleTypes.admin, roleTypes.superAdmin],
    archivePost:[roleTypes.user ,roleTypes.admin, roleTypes.superAdmin ],
    likePost : [roleTypes.user , roleTypes.admin]
}