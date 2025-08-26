import express from "express"
import { getOfficers } from "../controllers/UserController.js"
import authenticateToken from "../middleware/authenticateToken.js"

const router = express.Router()

router.get("/officers", authenticateToken, getOfficers)

export default router
