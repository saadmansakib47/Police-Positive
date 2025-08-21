import mongoose from "mongoose"

const alertusNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    location: {
      address: String,
      lat: Number,
      lng: Number,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: Date,
  },
  { timestamps: true }
)

const AlertusNotification = mongoose.model(
  "AlertusNotification",
  alertusNotificationSchema
)

export default AlertusNotification
