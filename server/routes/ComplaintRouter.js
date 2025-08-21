import express from "express"
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  // updateComplaintStatus,
  // assignComplaint,
  // addNote,
  getDashboardStats,
  getMyComplaints,
  trackComplaint,
} from "../controllers/ComplaintController.js"
import authenticateToken from "../middleware/authenticateToken.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

// Public routes
router.get("/track/:caseNumber?", trackComplaint)

// Protected routes
router.post("/", authenticateToken, upload.array("files", 10), createComplaint)
router.get("/", authenticateToken, getComplaints)
router.get("/my", authenticateToken, getMyComplaints)
router.get("/stats", authenticateToken, getDashboardStats)
router.get("/:id", authenticateToken, getComplaintById)
// router.patch("/:id/status", authenticateToken, updateComplaintStatus)
// router.patch("/:id/assign", authenticateToken, assignComplaint)
// router.post("/:id/notes", authenticateToken, addNote)

export default router
