import mongoose from "mongoose"

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
      enum: ["pending", "assigned", "investigating", "resolved", "closed"],
      default: "pending",
    },
    notes: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

const Complaint = mongoose.model("Complaint", complaintSchema)

export default Complaint
