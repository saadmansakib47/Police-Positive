import mongoose from "mongoose"

const evidenceFileSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
  },
  { timestamps: true }
)

const EvidenceFile = mongoose.model("EvidenceFile", evidenceFileSchema)

export default EvidenceFile
