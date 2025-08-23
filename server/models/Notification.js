import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    type: {
      type: String,
      enum: ["case_assigned", "case_updated", "case_resolved", "case_deleted", "officer_assigned"],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedCaseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Complaint" 
    },
    relatedOfficerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    isRead: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    metadata: {
      caseNumber: String,
      officerName: String,
      officerBadgeNumber: String
    }
  },
  { timestamps: true }
)

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification