import { Router } from "express";
import { EmergencyController } from "./emergency.controller";

const router =Router();

router.post("/call-ambulance", EmergencyController.callAmbulance)

router.get("/call-ambulance/payment/callback",EmergencyController.callAmbulanceCallback )



export const EmergencyRoutes = router