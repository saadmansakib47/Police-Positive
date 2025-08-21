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

    res.status(201).json(complaint)
  } catch (err) {
    console.error("Error creating complaint:", err)
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
              badgeNumber: complaint.assignedOfficer.badgeNumber || "",
            }
          : null,
        createdBy: complaint.createdBy
          ? {
              firstName: complaint.createdBy.firstName || "",
              lastName: complaint.createdBy.lastName || "",
              email: complaint.createdBy.email || "",
            }
          : null,
      },
      timeline: (timeline || []).map((t) => ({
        id: t._id,
        type: t.type || "update",
        description: t.description || "",
        timestamp: t.createdAt || null,
        userName: t.userId
          ? `${t.userId.firstName || ""} ${t.userId.lastName || ""}`.trim()
          : "System",
      })),
      evidence: (evidence || []).map((f) => ({
        id: f._id,
        name: f.originalName || "Untitled",
        type: f.mimetype || "unknown",
        size: f.size || 0,
        url: f.filename ? `/uploads/${f.filename}` : "",
      })),
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

export { createComplaint, trackComplaint }
