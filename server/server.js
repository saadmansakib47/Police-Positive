// server.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/police_system";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================
// Database connection
// ========================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ========================
// Schemas / Models
// ========================
const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    role: {
      type: String,
      enum: ["civilian", "operator", "supervisor", "patrol"],
      required: true,
    },
    badgeNumber: String,
    department: String,
    phone: String,
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    reporterInfo: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["pending", "under_review", "investigating", "resolved", "closed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const evidenceFileSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
  },
  { timestamps: true }
);

const timelineEventSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    type: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);
const EvidenceFile = mongoose.model("EvidenceFile", evidenceFileSchema);
const TimelineEvent = mongoose.model("TimelineEvent", timelineEventSchema);

// ========================
// Uploads setup
// ========================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

// ========================
// Middleware
// ========================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ========================
// Helpers
// ========================
const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CASE-${year}-${random}`;
};

const addTimelineEvent = async (complaintId, type, description, userId = null) => {
  const event = new TimelineEvent({ complaintId, type, description, userId });
  await event.save();
};

// ========================
// Routes
// ========================

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, badgeNumber, department, phone } = req.body;
    if (!email || !password || !firstName || !lastName || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, firstName, lastName, role, badgeNumber, department, phone });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify
// Verify
app.get("/api/auth/verify", authenticateToken, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: "Malformed token payload" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Verify route error:", error);
    res.status(500).json({ message: "Server error while verifying user" });
  }
});



app.post("/api/complaints", authenticateToken, upload.array("files", 10), async (req, res) => {
  try {
    // 1️⃣ Accept both JSON and multipart/form-data
    let complaintData;

    if (req.is("application/json")) {
      complaintData = req.body;
    } else {
      // For multipart/form-data, complaintData should be a JSON string field
      complaintData =
        typeof req.body.complaintData === "string"
          ? JSON.parse(req.body.complaintData)
          : req.body;
    }

    // 2️⃣ Normalize location: handle nested coordinates or flat lat/lng
    if (!complaintData.location) {
      return res.status(400).json({ message: "Missing location" });
    }

    const loc = complaintData.location;

    if (loc.coordinates) {
      loc.lat = Number(loc.coordinates.lat);
      loc.lng = Number(loc.coordinates.lng);
    } else {
      loc.lat = Number(loc.lat);
      loc.lng = Number(loc.lng);
    }

    // 3️⃣ Validate required fields
    const { type, category, title, description, reporterInfo } = complaintData;

    if (
      !type ||
      !category ||
      !title ||
      !description ||
      !loc.address ||
      isNaN(loc.lat) ||
      isNaN(loc.lng) ||
      !reporterInfo ||
      !reporterInfo.phone
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 4️⃣ Generate case number and priority
    const caseNumber = generateCaseNumber();
    const priority =
      type.toLowerCase() === "emergency" || type.toLowerCase() === "high"
        ? "urgent"
        : "medium";

    // 5️⃣ Create complaint
    const complaint = new Complaint({
      caseNumber,
      type,
      category,
      title,
      description,
      location: { address: loc.address, lat: loc.lat, lng: loc.lng },
      reporterInfo,
      priority,
      createdBy: req.user.id,
    });

    await complaint.save();

    // 6️⃣ Save uploaded files as evidence
    if (Array.isArray(req.files) && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          new EvidenceFile({
            complaintId: complaint._id,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
          }).save()
        )
      );
    }

    // 7️⃣ Add timeline event
    await addTimelineEvent(
      complaint._id,
      "created",
      "Complaint submitted",
      req.user.id
    );

    // 8️⃣ Return complaint
    res.status(201).json(complaint);
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/complaints/track/:caseNumber?", authenticateToken, async (req, res) => {
  try {
    // Support both path param and query param
    let caseNumber = req.params.caseNumber || req.query.caseNumber;
    if (!caseNumber) {
      return res.status(200).json({
        error: "Case number is required",
        complaint: null,
        timeline: [],
        evidence: []
      });
    }

    // Trim and decode in case special chars
    caseNumber = decodeURIComponent(caseNumber.trim());

    if (caseNumber.length < 3) {
      return res.status(200).json({
        error: "Invalid case number",
        complaint: null,
        timeline: [],
        evidence: []
      });
    }

    const complaint = await Complaint.findOne({ caseNumber })
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")
      .lean();

    if (!complaint) {
      return res.status(200).json({
        error: "Complaint not found",
        complaint: null,
        timeline: [],
        evidence: []
      });
    }

    const timeline = await TimelineEvent.find({ complaintId: complaint._id })
      .populate("userId", "firstName lastName role")
      .sort({ createdAt: 1 })
      .lean();

    const evidence = await EvidenceFile.find({ complaintId: complaint._id }).lean();

    res.json({
      error: null,
      complaint: {
        id: complaint._id,
        caseNumber: complaint.caseNumber || "",
        status: complaint.status || "Unknown",
        description: complaint.description || "",
        category: complaint.category || "",
        location: complaint.location || "",
        createdAt: complaint.createdAt || null,
        updatedAt: complaint.updatedAt || null,
        assignedOfficer: complaint.assignedOfficer
          ? {
              firstName: complaint.assignedOfficer.firstName || "",
              lastName: complaint.assignedOfficer.lastName || "",
              badgeNumber: complaint.assignedOfficer.badgeNumber || ""
            }
          : null,
        createdBy: complaint.createdBy
          ? {
              firstName: complaint.createdBy.firstName || "",
              lastName: complaint.createdBy.lastName || "",
              email: complaint.createdBy.email || ""
            }
          : null
      },
      timeline: (timeline || []).map((t) => ({
        id: t._id,
        type: t.type || "update",
        description: t.description || "",
        timestamp: t.createdAt || null,
        userName: t.userId
          ? `${t.userId.firstName || ""} ${t.userId.lastName || ""}`.trim()
          : "System"
      })),
      evidence: (evidence || []).map((f) => ({
        id: f._id,
        name: f.originalName || "Untitled",
        type: f.mimetype || "unknown",
        size: f.size || 0,
        url: f.filename ? `/uploads/${f.filename}` : ""
      }))
    });
  } catch (err) {
    console.error("Error tracking complaint:", err);
    res.status(500).json({
      error: "Server error",
      complaint: null,
      timeline: [],
      evidence: []
    });
  }
});




// ========================
// Error Handling
// ========================
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }
  console.error("Unhandled error:", error);
  res.status(500).json({ message: "Internal server error" });
});

app.use("*", (req, res) => res.status(404).json({ message: "Route not found" }));

// ========================
// Start Server
// ========================
app.listen(PORT, () => {
  console.log(`Police System API Server running on port ${PORT}`);
});
