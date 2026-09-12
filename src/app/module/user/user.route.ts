import { Router } from "express";
import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.patch("/profile-image",
    auth(Role.CALLER, Role.DISPATCHER, Role.DRIVER, Role.SUPER_ADMIN),
    upload.single("profileImage"), UserController.uploadProfileImage)


export const UserRoutes = router