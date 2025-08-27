import express from "express"
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  addNote,
  getDashboardStats,
  getMyCivilianComplaints,
  deleteComplaint,
  trackComplaint,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getMyOperatorComplaints,
  getUnassignedComplaints,
  getComplaintsByCategory,
  getComplaintsByStatus,
  getComplaintsByPriority,
  getComplaintsOverTime,
  getOfficerPerformance,
  getResolutionTimeStats,
} from "../controllers/ComplaintController.js"

import authenticateToken from "../middleware/authenticateToken.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

// Public routes
router.get("/track/:caseNumber?", trackComplaint)

// Protected routes
router.post("/", authenticateToken, upload.array("files", 10), createComplaint)
router.get("/", authenticateToken, getComplaints)
router.get("/unassigned", authenticateToken, getUnassignedComplaints)
router.get("/my-civilian", authenticateToken, getMyCivilianComplaints)
router.get("/my-operator", authenticateToken, getMyOperatorComplaints)
router.get("/stats", authenticateToken, getDashboardStats)
router.get("/notifications", authenticateToken, getNotifications)
router.get("/:id", authenticateToken, getComplaintById)
router.patch("/:id/status", authenticateToken, updateComplaintStatus)
router.patch("/:id/assign", authenticateToken, assignComplaint)
router.post("/:id/notes", authenticateToken, addNote)
router.delete("/:id", authenticateToken, deleteComplaint)
router.patch(
  "/notifications/:id/read",
  authenticateToken,
  markNotificationAsRead
)
router.patch(
  "/notifications/mark-all-read",
  authenticateToken,
  markAllNotificationsAsRead
)

// Reports Routes

router.get("/reports/category", authenticateToken, getComplaintsByCategory)
router.get("/reports/status", authenticateToken, getComplaintsByStatus)
router.get("/reports/priority", authenticateToken, getComplaintsByPriority)
router.get("/reports/over-time", authenticateToken, getComplaintsOverTime)
router.get(
  "/reports/officer-performance",
  authenticateToken,
  getOfficerPerformance
)
router.get(
  "/reports/resolution-time",
  authenticateToken,
  getResolutionTimeStats
)

export default router
