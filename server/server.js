import express from "express"
import cors from "cors"
import multer from "multer"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/police_system"

// ========================
// Database connection
// ========================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// ========================
// Middleware
// ========================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(uploadsDir))

// ========================
// Routes
// ========================
import authRouter from "./routes/AuthRouter.js"
import complaintRouter from "./routes/ComplaintRouter.js"

app.use("/api/auth", authRouter)
app.use("/api/complaints", complaintRouter)

// ========================
// Error Handling
// ========================
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" })
  }
  console.error("Unhandled error:", error)
  res.status(500).json({ message: "Internal server error" })
})

// ========================
// 404 Handler
// ========================
app.use("*", (req, res) => res.status(404).json({ message: "Route not found" }))

// ========================
// Start Server
// ========================
app.listen(PORT, () => {
  console.log(`Police System API Server running on port ${PORT}`)
})
