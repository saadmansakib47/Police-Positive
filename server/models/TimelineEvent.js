import mongoose from "mongoose"

const timelineEventSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    type: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

const TimelineEvent = mongoose.model("TimelineEvent", timelineEventSchema)

export default TimelineEvent
