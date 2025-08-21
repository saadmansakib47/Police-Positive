// import User from "../models/User.js"
import Complaint from "../models/Complaint.js"
import EvidenceFile from "../models/EvidenceFile.js"
import TimelineEvent from "../models/TimelineEvent.js"
import { addTimelineEvent, generateCaseNumber } from "../utils/caseHelpers.js"

const createComplaint = async (req, res) => {
  try {
    let complaintData

    if (req.is("application/json")) {
      complaintData = req.body
    } else {
      complaintData =
        typeof req.body.complaintData === "string"
          ? JSON.parse(req.body.complaintData)
          : req.body
    }

    if (!complaintData.location) {
      return res.status(400).json({ message: "Missing location" })
    }

    const loc = complaintData.location

    if (loc.coordinates) {
      loc.lat = Number(loc.coordinates.lat)
      loc.lng = Number(loc.coordinates.lng)
    } else {
      loc.lat = Number(loc.lat)
      loc.lng = Number(loc.lng)
    }

    const { type, category, title, description, reporterInfo } = complaintData

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
      return res.status(400).json({ message: "Missing required fields" })
    }

    const caseNumber = generateCaseNumber()
    const priority =
      type.toLowerCase() === "emergency" || type.toLowerCase() === "high"
        ? "urgent"
        : "medium"

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
    })

    await complaint.save()

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
      )
    }

    await addTimelineEvent(
      complaint._id,
      "created",
      "Complaint submitted",
      req.user.id
    )

    const response = {
      id: complaint._id.toString(),
      caseNumber: complaint.caseNumber,
      type: complaint.type,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      location: {
        address: complaint.location.address,
        lat: complaint.location.lat,
        lng: complaint.location.lng,
      },
      reporterInfo: complaint.reporterInfo,
      status: complaint.status,
      priority: complaint.priority,
      evidence: {
        files: [],
        notes: [],
      },
      timeline: [],
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      createdBy: complaint.createdBy.toString(),
    }

    res.status(201).json(response)
  } catch (err) {
    console.error("Error creating complaint:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
    } = req.query

    const filter = {}

    if (status) filter.status = status
    if (category) filter.category = category
    if (priority) filter.priority = priority
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { caseNumber: { $regex: search, $options: "i" } },
      ]
    }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit
    const complaints = await Complaint.find(filter)
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Complaint.countDocuments(filter)

    const transformedComplaints = complaints.map((complaint) => ({
      id: complaint._id.toString(),
      caseNumber: complaint.caseNumber,
      type: complaint.type,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      location: {
        address: complaint.location.address,
        lat: complaint.location.lat,
        lng: complaint.location.lng,
      },
      reporterInfo: complaint.reporterInfo,
      status: complaint.status,
      priority: complaint.priority,
      assignedOfficer: complaint.assignedOfficer
        ? {
            id: complaint.assignedOfficer._id.toString(),
            name: `${complaint.assignedOfficer.firstName} ${complaint.assignedOfficer.lastName}`,
            badgeNumber: complaint.assignedOfficer.badgeNumber,
          }
        : undefined,
      evidence: {
        files: [],
        notes: complaint.notes ? complaint.notes.map((note) => note.text) : [],
      },
      timeline: [],
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      createdBy: complaint.createdBy
        ? complaint.createdBy._id.toString()
        : null,
    }))

    res.json({
      complaints: transformedComplaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (err) {
    console.error("Error fetching complaints:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params
    const complaint = await Complaint.findById(id)
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")
      .populate("notes.by", "firstName lastName role")

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    const evidenceFiles = await EvidenceFile.find({
      complaintId: complaint._id,
    })

    const timelineEvents = await TimelineEvent.find({
      complaintId: complaint._id,
    }).populate("userId", "firstName lastName")

    const response = {
      id: complaint._id.toString(),
      caseNumber: complaint.caseNumber,
      type: complaint.type,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      location: {
        address: complaint.location.address,
        lat: complaint.location.lat,
        lng: complaint.location.lng,
      },
      reporterInfo: complaint.reporterInfo,
      status: complaint.status,
      priority: complaint.priority,
      assignedOfficer: complaint.assignedOfficer
        ? {
            id: complaint.assignedOfficer._id.toString(),
            name: `${complaint.assignedOfficer.firstName} ${complaint.assignedOfficer.lastName}`,
            badgeNumber: complaint.assignedOfficer.badgeNumber,
          }
        : undefined,
      evidence: {
        files: evidenceFiles.map((file) => ({
          id: file._id.toString(),
          name: file.originalName,
          type: getFileType(file.mimetype),
          url: `/uploads/${file.filename}`,
          size: file.size,
          uploadedAt: file.createdAt.toISOString(),
        })),
        notes: complaint.notes ? complaint.notes.map((note) => note.text) : [],
      },
      timeline: timelineEvents.map((event) => ({
        id: event._id.toString(),
        type: event.type,
        description: event.description,
        timestamp: event.createdAt.toISOString(),
        userId: event.userId ? event.userId._id.toString() : null,
        userName: event.userId
          ? `${event.userId.firstName} ${event.userId.lastName}`
          : "System",
      })),
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      createdBy: complaint.createdBy
        ? complaint.createdBy._id.toString()
        : null,
    }

    res.json(response)
  } catch (err) {
    console.error("Error fetching complaint:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments()
    const pendingComplaints = await Complaint.countDocuments({
      status: "pending",
    })
    const resolvedComplaints = await Complaint.countDocuments({
      status: "resolved",
    })
    const highPriorityComplaints = await Complaint.countDocuments({
      priority: { $in: ["high", "urgent"] },
    })

    // Calculate average resolution time (simplified)
    const resolvedCases = await Complaint.find({
      status: "resolved",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })

    let totalResolutionTime = 0
    let resolvedCount = resolvedCases.length

    resolvedCases.forEach((caseItem) => {
      const resolutionTime = caseItem.updatedAt - caseItem.createdAt
      totalResolutionTime += resolutionTime
    })

    const averageResolutionTime =
      resolvedCount > 0
        ? Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60)) // in hours
        : 0

    // Complaints this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const complaintsThisWeek = await Complaint.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    })

    // Complaints this month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const complaintsThisMonth = await Complaint.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    })

    res.json({
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      highPriorityComplaints,
      averageResolutionTime,
      complaintsThisWeek,
      complaintsThisMonth,
    })
  } catch (err) {
    console.error("Error fetching dashboard stats:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("assignedOfficer", "firstName lastName badgeNumber")

    // Transform complaints to match frontend interface
    const transformedComplaints = complaints.map((complaint) => ({
      id: complaint._id.toString(),
      caseNumber: complaint.caseNumber,
      type: complaint.type,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      location: {
        address: complaint.location.address,
        lat: complaint.location.lat,
        lng: complaint.location.lng,
      },
      reporterInfo: complaint.reporterInfo,
      status: complaint.status,
      priority: complaint.priority,
      assignedOfficer: complaint.assignedOfficer
        ? {
            id: complaint.assignedOfficer._id.toString(),
            name: `${complaint.assignedOfficer.firstName} ${complaint.assignedOfficer.lastName}`,
            badgeNumber: complaint.assignedOfficer.badgeNumber,
          }
        : undefined,
      evidence: {
        files: [],
        notes: complaint.notes ? complaint.notes.map((note) => note.text) : [],
      },
      timeline: [],
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      createdBy: complaint.createdBy
        ? complaint.createdBy._id.toString()
        : null,
    }))

    res.json(transformedComplaints)
  } catch (err) {
    console.error("Error fetching my complaints:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const trackComplaint = async (req, res) => {
  try {
    let caseNumber = req.params.caseNumber || req.query.caseNumber
    if (!caseNumber) {
      return res.status(200).json({
        error: "Case number is required",
        complaint: null,
        timeline: [],
        evidence: [],
      })
    }

    caseNumber = decodeURIComponent(caseNumber.trim())

    if (caseNumber.length < 3) {
      return res.status(200).json({
        error: "Invalid case number",
        complaint: null,
        timeline: [],
        evidence: [],
      })
    }

    const complaint = await Complaint.findOne({ caseNumber })
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")
      .lean()

    if (!complaint) {
      return res.status(200).json({
        error: "Complaint not found",
        complaint: null,
        timeline: [],
        evidence: [],
      })
    }

    const timeline = await TimelineEvent.find({ complaintId: complaint._id })
      .populate("userId", "firstName lastName role")
      .sort({ createdAt: 1 })
      .lean()

    const evidence = await EvidenceFile.find({
      complaintId: complaint._id,
    }).lean()

    // Transform complaint to match frontend interface
    const transformedComplaint = {
      id: complaint._id.toString(),
      caseNumber: complaint.caseNumber || "",
      type: complaint.type || "GD",
      category: complaint.category || "other",
      title: complaint.title || "",
      description: complaint.description || "",
      location: {
        address: complaint.location?.address || "",
        lat: complaint.location?.lat || 0,
        lng: complaint.location?.lng || 0,
      },
      reporterInfo: complaint.reporterInfo || {
        isAnonymous: false,
        phone: "",
      },
      status: complaint.status || "pending",
      priority: complaint.priority || "medium",
      assignedOfficer: complaint.assignedOfficer
        ? {
            id: complaint.assignedOfficer._id.toString(),
            name: `${complaint.assignedOfficer.firstName || ""} ${
              complaint.assignedOfficer.lastName || ""
            }`.trim(),
            firstName: complaint.assignedOfficer.firstName || "",
            lastName: complaint.assignedOfficer.lastName || "",
            badgeNumber: complaint.assignedOfficer.badgeNumber || "",
          }
        : undefined,
      evidence: {
        files: (evidence || []).map((f) => ({
          id: f._id.toString(),
          name: f.originalName || "Untitled",
          type: getFileType(f.mimetype),
          url: f.filename ? `/server/uploads/${f.filename}` : "",
          size: f.size || 0,
          uploadedAt: f.createdAt
            ? f.createdAt.toISOString()
            : new Date().toISOString(),
        })),
        notes: complaint.notes
          ? complaint.notes.map((note) => ({
              text: note.text || "",
              createdAt: note.createdAt
                ? note.createdAt.toISOString()
                : new Date().toISOString(),
              by: note.by || null,
            }))
          : [],
      },
      timeline: (timeline || []).map((t) => ({
        id: t._id.toString(),
        type: t.type || "updated",
        description: t.description || "",
        timestamp: t.createdAt
          ? t.createdAt.toISOString()
          : new Date().toISOString(),
        userId: t.userId ? t.userId._id.toString() : null,
        userName: t.userId
          ? `${t.userId.firstName || ""} ${t.userId.lastName || ""}`.trim()
          : "System",
      })),
      createdAt: complaint.createdAt
        ? complaint.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: complaint.updatedAt
        ? complaint.updatedAt.toISOString()
        : new Date().toISOString(),
      createdBy: complaint.createdBy
        ? complaint.createdBy._id.toString()
        : null,
    }

    res.json({
      error: null,
      complaint: transformedComplaint,
      timeline: transformedComplaint.timeline,
      evidence: transformedComplaint.evidence.files,
    })
  } catch (err) {
    console.error("Error tracking complaint:", err)
    res.status(500).json({
      error: "Server error",
      complaint: null,
      timeline: [],
      evidence: [],
    })
  }
}

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image"
  if (mimetype.startsWith("video/")) return "video"
  if (mimetype.startsWith("audio/")) return "audio"
  return "document"
}

export {
  createComplaint,
  getComplaints,
  getComplaintById,
  // updateComplaintStatus,
  // assignComplaint,
  // addNote,
  getDashboardStats,
  getMyComplaints,
  trackComplaint,
}
