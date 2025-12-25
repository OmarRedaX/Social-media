import {Router} from 'express';
import commentController from '../comment/comment.controller.js';
import { validation } from '../../middleware/validation.middleware.js';
import { authentication, authorization, blockCheck } from '../../middleware/auth.middleware.js';
import * as postService from './service/post.service.js';
import * as validators from './post.validation.js';
import { endpoint} from "./post.authorization.js"
import { uploadCloudFile } from '../../utils/multer/cloud.multer.js';
import { fileValidation } from '../../utils/multer/local.multer.js';

const router = Router();

router.use("/:postId/comment", commentController);

router.get("/",
    authentication(),
    postService.getPosts
);

router.get("/myPosts",
    authentication(),
    authorization(endpoint.getPosts),
    postService.getMyposts
)

router.get("/my-friends-posts",
    authentication(),
    authorization(endpoint.getPosts),
    postService.getMyFriendsPosts
)

router.get("/userPosts/:userId",
    validation(validators.userPosts),
    authentication(),
    blockCheck(),
    postService.getUserPosts
)


router.post("/",
    authentication(),
    authorization(endpoint.createPost),
    uploadCloudFile(fileValidation.image).array('attachment', 2),
    validation(validators.createPost),
    postService.createPost
)

router.patch("/:postId",
    authentication(),
    authorization(endpoint.createPost),
    uploadCloudFile(fileValidation.image).array('attachment', 2),
    validation(validators.updatePost),
    postService.updatePost
)

router.delete("/:postId",
    authentication(),
    authorization(endpoint.freezePost),
    validation(validators.freezePost),
    postService.freezePost
);


router.patch("/:postId/restore",
    authentication(),
    authorization(endpoint.freezePost),
    validation(validators.freezePost),
    postService.unFreezePost
);


router.delete("/:postId/delete",
    authentication(),
    authorization(endpoint.freezePost),
    validation(validators.freezePost),
    postService.deletePost
)


router.patch("/:postId/archive",
    authentication(),
    authorization(endpoint.archivePost),
    validation(validators.archivePost),
    postService.archivePost
)


router.patch("/:postId/like",
    authentication(),
    authorization(endpoint.likePost),
    validation(validators.likePost),
    blockCheck(),
    postService.likePost
);




export default router;