import express from "express"
import {
  createComplaint,
  trackComplaint,
} from "../controllers/ComplaintController.js"
import authenticateToken from "../middleware/authenticateToken.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

router.post("/", authenticateToken, upload.array("files", 10), createComplaint)
router.get("/track/:caseNumber?", authenticateToken, trackComplaint)

export default router
