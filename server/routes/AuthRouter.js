import express from "express"
import { register, login, verify } from "../controllers/AuthController.js"
import authenticateToken from "../middleware/authenticateToken.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/verify", authenticateToken, verify)

export default router
