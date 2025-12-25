import { Router } from "express";
import { authentication, authorization, blockCheck } from '../../middleware/auth.middleware.js';
import { validation } from "../../middleware/validation.middleware.js";
import { endpoint } from "./comment.authorization.js";
import { uploadCloudFile ,fileValidation } from "../../utils/multer/cloud.multer.js";
import * as validators from "./comment.validation.js";
import * as commentService from "./service/comment.service.js";



const router = Router({ mergeParams: true , strict:true}); // Enable access to parent route parameters

router.post('/',
    authentication(),
    authorization(endpoint.create),
    uploadCloudFile(fileValidation.image).array('attachment', 2),
    validation(validators.createComment),
    blockCheck(),
    commentService.createComment
);

router.post('/:commentId',
    authentication(),
    authorization(endpoint.create),
    uploadCloudFile(fileValidation.image).array('attachment', 2),
    validation(validators.createComment),
    blockCheck(),
    commentService.createComment
);

router.patch("/:commentId",
    authentication(),
    authorization(endpoint.update),
    uploadCloudFile(fileValidation.image).array('attachment', 2),
    validation(validators.updateComment),
    blockCheck(),
    commentService.updateComment
);

router.patch("/:commentId/unfreeze",
    authentication(),
    authorization(endpoint.delete),
    validation(validators.freezeComment),
    commentService.unfreezeComment
);

router.delete("/:commentId/freeze",
    authentication(),
    authorization(endpoint.delete),
    validation(validators.freezeComment),
    commentService.freezeComment
);

router.patch("/:commentId/like",
    authentication(),
    authorization(endpoint.like),
    validation(validators.likeComment),
    blockCheck(),
    commentService.likeComment
)


export default router;      