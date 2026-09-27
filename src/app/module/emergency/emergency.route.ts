import { Router } from "express";
import { EmergencyController } from "./emergency.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router =Router();

router.post("/call-ambulance", auth(Role.CALLER), EmergencyController.callAmbulance)

router.get("/call-ambulance/payment/callback",EmergencyController.callAmbulanceCallback )



export const EmergencyRoutes = router