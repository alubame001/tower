import express from "express";
import * as characterController from "../controllers/characterController";

const router = express.Router();

// Register our sign up and login routes
router.post("/add", characterController.prepContent, characterController.add);
router.post("/del", characterController.prepContent, characterController.del);
router.post("/update", characterController.prepContent, characterController.update);
router.get("/list", characterController.prepContent, characterController.list);

export default router;