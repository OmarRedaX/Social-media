import * as chatService from "./service/chat.service.js"
import {authentication, authorization} from "../../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router()

router.get("/:friendId", authentication(), chatService.getChat)


export default router;