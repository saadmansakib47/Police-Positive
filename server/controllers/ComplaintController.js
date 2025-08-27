import escapeRegExp from "lodash"
import User from "../models/User.js"
import Complaint from "../models/Complaint.js"
import EvidenceFile from "../models/EvidenceFile.js"
import TimelineEvent from "../models/TimelineEvent.js"
import { addTimelineEvent, generateCaseNumber } from "../utils/caseHelpers.js"
import mongoose from "mongoose"
import Notification from "../models/Notification.js"

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

const getUnassignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: "pending",
      assignedOfficer: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .populate("assignedOfficer", "firstName lastName badgeNumber")

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
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    }))

    res.json(transformedComplaints)
  } catch (err) {
    console.error("Error fetching unassigned complaints:", err)
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
      sortBy = "-createdAt",
      sortOrder = "desc",
    } = req.query

    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category
    if (priority) filter.priority = priority
    if (search) {
      const escapedSearch = escapeRegExp(search)
      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { caseNumber: { $regex: escapedSearch, $options: "i" } },
      ]
    }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    let sortOption = {}
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "priority",
      "status",
      "category",
    ]

    let sortField = sortBy.startsWith("-") ? sortBy.substring(1) : sortBy
    let actualSortOrder = sortBy.startsWith("-") ? -1 : 1

    if (sortOrder === "asc") {
      actualSortOrder = 1
    } else if (sortOrder === "desc") {
      actualSortOrder = -1
    }

    if (allowedSortFields.includes(sortField)) {
      sortOption[sortField] = actualSortOrder
    } else {
      sortOption = { createdAt: -1 }
    }

    const skip = (page - 1) * limit
    const complaints = await Complaint.find(filter)
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")
      .sort(sortOption)
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
        notes: complaint.notes
          ? complaint.notes.map((note) => ({
              text: note.text,
              createdAt: note.createdAt.toISOString(),
              by: note.by ? note.by.toString() : null,
            }))
          : [],
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

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const complaintsThisWeek = await Complaint.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    })

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

const getMyOperatorComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedOfficer: req.user.id })
      .sort({ createdAt: -1 })
      .populate("assignedOfficer", "firstName lastName badgeNumber")

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
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    }))

    res.json(transformedComplaints)
  } catch (err) {
    console.error("Error fetching operator complaints:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getMyCivilianComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("assignedOfficer", "firstName lastName badgeNumber")

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
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    }))

    res.json(transformedComplaints)
  } catch (err) {
    console.error("Error fetching civilian complaints:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    if (complaint.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own complaints" })
    }

    if (complaint.status !== "pending") {
      return res.status(400).json({
        message:
          "Cannot delete complaint that is already assigned or in progress",
      })
    }

    await EvidenceFile.deleteMany({ complaintId: id })
    await TimelineEvent.deleteMany({ complaintId: id })
    await Notification.deleteMany({ relatedCaseId: id })
    await Complaint.findByIdAndDelete(id)

    res.json({ message: "Complaint deleted successfully" })
  } catch (err) {
    console.error("Error deleting complaint:", err)
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

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, note } = req.body

    const validStatuses = [
      "pending",
      "assigned",
      "investigating",
      "resolved",
      "closed",
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" })
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    const oldStatus = complaint.status
    complaint.status = status
    await complaint.save()

    let timelineEventType = "updated"
    let description = `Status changed from ${oldStatus.replace(
      "_",
      " "
    )} to ${status.replace("_", " ")}`

    if (status === "resolved") {
      timelineEventType = "resolved"
      description = "Case marked as resolved"
    } else if (status === "closed") {
      timelineEventType = "updated"
      description = "Case marked as closed"
    }

    if (note && timelineEventType !== "resolved") {
      description += `: ${note}`
    } else if (note && timelineEventType === "resolved") {
      description += ` - ${note}`
    }

    await addTimelineEvent(
      complaint._id,
      timelineEventType,
      description,
      req.user.id
    )

    const updatedComplaint = await Complaint.findById(id)
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")

    const response = {
      id: updatedComplaint._id.toString(),
      caseNumber: updatedComplaint.caseNumber,
      type: updatedComplaint.type,
      category: updatedComplaint.category,
      title: updatedComplaint.title,
      description: updatedComplaint.description,
      location: {
        address: updatedComplaint.location.address,
        lat: updatedComplaint.location.lat,
        lng: updatedComplaint.location.lng,
      },
      reporterInfo: updatedComplaint.reporterInfo,
      status: updatedComplaint.status,
      priority: updatedComplaint.priority,
      assignedOfficer: updatedComplaint.assignedOfficer
        ? {
            id: updatedComplaint.assignedOfficer._id.toString(),
            name: `${updatedComplaint.assignedOfficer.firstName} ${updatedComplaint.assignedOfficer.lastName}`,
            badgeNumber: updatedComplaint.assignedOfficer.badgeNumber,
          }
        : undefined,
      evidence: {
        files: [],
        notes: updatedComplaint.notes
          ? updatedComplaint.notes.map((n) => ({
              text: n.text,
              createdAt: n.createdAt.toISOString(),
              by: n.by ? n.by.toString() : null,
            }))
          : [],
      },
      timeline: [],
      createdAt: updatedComplaint.createdAt.toISOString(),
      updatedAt: updatedComplaint.updatedAt.toISOString(),
      createdBy: updatedComplaint.createdBy
        ? updatedComplaint.createdBy._id.toString()
        : null,
    }

    res.json(response)
  } catch (err) {
    console.error("Error updating complaint status:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params
    const { officerId } = req.body

    if (!mongoose.Types.ObjectId.isValid(officerId)) {
      return res.status(400).json({ message: "Invalid officer ID provided" })
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    const oldOfficerId = complaint.assignedOfficer
    const wasUnassigned = !oldOfficerId
    const isSelfAssignment = req.user.id === officerId

    complaint.assignedOfficer = officerId

    if (wasUnassigned && complaint.status === "pending") {
      complaint.status = "assigned"
    }
    await complaint.save()

    const officer = await User.findById(officerId)
    let description = `Case assigned to ${
      officer
        ? officer.firstName + " " + officer.lastName
        : "Officer ID: " + officerId
    }`

    if (isSelfAssignment) {
      description = `Officer ${officer.firstName} ${officer.lastName} self-assigned to this case`
    } else if (!wasUnassigned) {
      description = `Case reassigned from previous officer to ${
        officer
          ? officer.firstName + " " + officer.lastName
          : "Officer ID: " + officerId
      }`
    }

    await addTimelineEvent(complaint._id, "assigned", description, req.user.id)

    if (complaint.createdBy && officer) {
      const notificationTitle = isSelfAssignment
        ? "Officer Self-Assigned to Your Case"
        : "Officer Assigned to Your Case"

      const notificationMessage = `Officer ${officer.firstName} ${officer.lastName} (Badge: ${officer.badgeNumber}) has been assigned to your case ${complaint.caseNumber}.`

      await createNotification(
        complaint.createdBy,
        "officer_assigned",
        notificationTitle,
        notificationMessage,
        complaint._id,
        officerId,
        {
          caseNumber: complaint.caseNumber,
          officerName: `${officer.firstName} ${officer.lastName}`,
          officerBadgeNumber: officer.badgeNumber,
        }
      )
    }

    const updatedComplaint = await Complaint.findById(id)
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")

    const response = {
      id: updatedComplaint._id.toString(),
      caseNumber: updatedComplaint.caseNumber,
      type: updatedComplaint.type,
      category: updatedComplaint.category,
      title: updatedComplaint.title,
      description: updatedComplaint.description,
      location: {
        address: updatedComplaint.location.address,
        lat: updatedComplaint.location.lat,
        lng: updatedComplaint.location.lng,
      },
      reporterInfo: updatedComplaint.reporterInfo,
      status: updatedComplaint.status,
      priority: updatedComplaint.priority,
      assignedOfficer: updatedComplaint.assignedOfficer
        ? {
            id: updatedComplaint.assignedOfficer._id.toString(),
            name: `${updatedComplaint.assignedOfficer.firstName} ${updatedComplaint.assignedOfficer.lastName}`,
            badgeNumber: updatedComplaint.assignedOfficer.badgeNumber,
          }
        : undefined,
      evidence: {
        files: [], // Populate if needed
        notes: updatedComplaint.notes
          ? updatedComplaint.notes.map((n) => ({
              text: n.text,
              createdAt: n.createdAt.toISOString(),
              by: n.by ? n.by.toString() : null,
            }))
          : [],
      },
      timeline: [], // Populate if needed
      createdAt: updatedComplaint.createdAt.toISOString(),
      updatedAt: updatedComplaint.updatedAt.toISOString(),
      createdBy: updatedComplaint.createdBy
        ? updatedComplaint.createdBy._id.toString()
        : null,
    }

    res.json(response)
  } catch (err) {
    console.error("Error assigning complaint:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const addNote = async (req, res) => {
  try {
    const { id } = req.params
    const { note } = req.body

    if (!note || note.trim() === "") {
      return res.status(400).json({ message: "Note text cannot be empty" })
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    complaint.notes.push({
      text: note.trim(),
      by: req.user.id,
      createdAt: new Date(),
    })
    await complaint.save()

    await addTimelineEvent(
      complaint._id,
      "updated",
      `Note added: ${note.trim()}`,
      req.user.id
    )

    const updatedComplaint = await Complaint.findById(id)
      .populate("assignedOfficer", "firstName lastName badgeNumber")
      .populate("createdBy", "firstName lastName email")
      .populate("notes.by", "firstName lastName role")

    const response = {
      id: updatedComplaint._id.toString(),
      caseNumber: updatedComplaint.caseNumber,
      type: updatedComplaint.type,
      category: updatedComplaint.category,
      title: updatedComplaint.title,
      description: updatedComplaint.description,
      location: {
        address: updatedComplaint.location.address,
        lat: updatedComplaint.location.lat,
        lng: updatedComplaint.location.lng,
      },
      reporterInfo: updatedComplaint.reporterInfo,
      status: updatedComplaint.status,
      priority: updatedComplaint.priority,
      assignedOfficer: updatedComplaint.assignedOfficer
        ? {
            id: updatedComplaint.assignedOfficer._id.toString(),
            name: `${updatedComplaint.assignedOfficer.firstName} ${updatedComplaint.assignedOfficer.lastName}`,
            badgeNumber: updatedComplaint.assignedOfficer.badgeNumber,
          }
        : undefined,
      evidence: {
        files: [],
        notes: updatedComplaint.notes
          ? updatedComplaint.notes.map((n) => ({
              text: n.text,
              createdAt: n.createdAt.toISOString(),
              by: n.by
                ? {
                    id: n.by._id.toString(),
                    name: `${n.by.firstName} ${n.by.lastName}`,
                    role: n.by.role,
                  }
                : null,
            }))
          : [],
      },
      timeline: [],
      createdAt: updatedComplaint.createdAt.toISOString(),
      updatedAt: updatedComplaint.updatedAt.toISOString(),
      createdBy: updatedComplaint.createdBy
        ? updatedComplaint.createdBy._id.toString()
        : null,
    }
    res.json(response)
  } catch (err) {
    console.error("Error adding note to complaint:", err)
    res.status(500).json({ message: "Server error" })
  }
}

// Notification Controller Methods
const createNotification = async (
  userId,
  type,
  title,
  message,
  relatedCaseId = null,
  relatedOfficerId = null,
  metadata = {}
) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedCaseId,
      relatedOfficerId,
      metadata,
    })
    await notification.save()
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query
    const query = { userId: req.user.id }

    if (unreadOnly === "true") {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .populate("relatedOfficerId", "firstName lastName badgeNumber")
      .populate("relatedCaseId", "caseNumber title")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const totalNotifications = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    })

    res.json({
      notifications,
      totalNotifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    )

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Report controller methods
const getComplaintsByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const matchCondition = {}

    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const complaintsByCategory = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    res.json(complaintsByCategory)
  } catch (err) {
    console.error("Error fetching complaints by category:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getComplaintsByStatus = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const matchCondition = {}

    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const complaintsByStatus = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    res.json(complaintsByStatus)
  } catch (err) {
    console.error("Error fetching complaints by status:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getComplaintsByPriority = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const matchCondition = {}

    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const complaintsByPriority = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    res.json(complaintsByPriority)
  } catch (err) {
    console.error("Error fetching complaints by priority:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getComplaintsOverTime = async (req, res) => {
  try {
    const { startDate, endDate, interval = "day" } = req.query
    const matchCondition = {}

    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    let dateFormat
    switch (interval) {
      case "hour":
        dateFormat = {
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        }
        break
      case "day":
        dateFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        }
        break
      case "week":
        dateFormat = {
          $dateToString: {
            format: "%Y-W%V",
            date: "$createdAt",
          },
        }
        break
      case "month":
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
        break
      default:
        dateFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        }
    }

    const complaintsOverTime = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: dateFormat,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    res.json(complaintsOverTime)
  } catch (err) {
    console.error("Error fetching complaints over time:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getOfficerPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const matchCondition = {
      assignedOfficer: { $exists: true, $ne: null },
    }

    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const officerPerformance = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "users",
          localField: "assignedOfficer",
          foreignField: "_id",
          as: "officer",
        },
      },
      {
        $unwind: "$officer",
      },
      {
        $group: {
          _id: {
            officerId: "$assignedOfficer",
            officerName: {
              $concat: ["$officer.firstName", " ", "$officer.lastName"],
            },
            badgeNumber: "$officer.badgeNumber",
          },
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
            },
          },
          closed: {
            $sum: {
              $cond: [{ $eq: ["$status", "closed"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          officerId: "$_id.officerId",
          officerName: "$_id.officerName",
          badgeNumber: "$_id.badgeNumber",
          totalAssigned: 1,
          resolved: 1,
          closed: 1,
          resolutionRate: {
            $cond: [
              { $eq: ["$totalAssigned", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      { $add: ["$resolved", "$closed"] },
                      "$totalAssigned",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { resolutionRate: -1 },
      },
    ])

    res.json(officerPerformance)
  } catch (err) {
    console.error("Error fetching officer performance:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getResolutionTimeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const matchCondition = {
      status: { $in: ["resolved", "closed"] },
      createdAt: { $exists: true },
      updatedAt: { $exists: true },
    }

    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const resolutionStats = await Complaint.aggregate([
      { $match: matchCondition },
      {
        $project: {
          resolutionTimeHours: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60, // Convert milliseconds to hours
            ],
          },
          category: 1,
          priority: 1,
        },
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: "$resolutionTimeHours" },
          minResolutionTime: { $min: "$resolutionTimeHours" },
          maxResolutionTime: { $max: "$resolutionTimeHours" },
          resolutionTimesByCategory: {
            $push: {
              category: "$category",
              resolutionTime: "$resolutionTimeHours",
            },
          },
        },
      },
    ])

    res.json(resolutionStats[0] || {})
  } catch (err) {
    console.error("Error fetching resolution time stats:", err)
    res.status(500).json({ message: "Server error" })
  }
}

export {
  createComplaint,
  getComplaints,
  getUnassignedComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  addNote,
  getDashboardStats,
  getMyCivilianComplaints,
  getMyOperatorComplaints,
  deleteComplaint,
  trackComplaint,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getComplaintsByCategory,
  getComplaintsByStatus,
  getComplaintsByPriority,
  getComplaintsOverTime,
  getOfficerPerformance,
  getResolutionTimeStats,
}
