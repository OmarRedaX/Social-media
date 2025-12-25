import { roleTypes} from "../../DB/model/User.model.js";


export const endpoint = {
    create:[roleTypes.user],
    update:[roleTypes.user],
    delete:[roleTypes.user, roleTypes.admin],
    like:[roleTypes.user,roleTypes.admin]
}