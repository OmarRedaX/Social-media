import { Router } from "express";
import { authentication, authorization, blockCheck } from "../../middleware/auth.middleware.js";
import * as userService from "./service/user.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";
import { fileValidation, uploadFileDisk } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endpoint } from "./user.authorization.js";

const router = Router();


router.get("/profile/dashboard", authentication(), authorization(endpoint.changeRoles) , userService.dashboard);
router.get("/profile", authentication(), userService.profile);
router.get("/profile/:profileId", validation(validators.shareProfile), authentication(), blockCheck(),userService.shareProfile); 

router.patch("/:userId/profile/dashboard/role" ,validation(validators.changeRoles), authentication() , authorization(endpoint.changeRoles) ,userService.changeRoles);
router.patch("/profile", validation(validators.updateProfile), authentication(), userService.updateProfile);
router.patch("/profile/two-step-verification", authentication(), userService.twoStepVerification)
router.patch("/profile/enable-two-step-verification", validation(validators.enableTwoStepVerification), authentication(), userService.enableTwoStepVerification)
router.patch("/profile/image", authentication(), uploadCloudFile(fileValidation.image).single('attachment'),validation(validators.profileImage), userService.updateProfileImage);
router.patch("/profile/image/cover", authentication(), uploadCloudFile(fileValidation.image).array('attachment', 4), userService.updateProfileCoverImages);

router.patch("/profile/email", validation(validators.updateEmail), authentication(), userService.updateEmail);
router.patch("/profile/reset-email",validation(validators.resetEmail), authentication(), userService.resetEmail);
router.patch("/profile/password", validation(validators.updatePassword), authentication(), userService.updatePassword);

router.patch("/profile/send-friend-request/:profileId",validation(validators.sendFriendRequest), authentication(), blockCheck(), userService.sendFriendRequest);

router.patch("/profile/friends-request/:profileId",validation(validators.friendsRequest), authentication(), blockCheck(), userService.friendsRequest);

router.patch("/profile/block-user",validation(validators.blockUser), authentication(), userService.blockUser);
router.patch("/profile/unblock-user",validation(validators.blockUser), authentication(), userService.unBlockUser);


export default router;