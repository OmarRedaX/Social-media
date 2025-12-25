import { roleTypes} from "../../DB/model/User.model.js";


export const endpoint = {
    changeRoles: [roleTypes.superAdmin, roleTypes.admin]
}