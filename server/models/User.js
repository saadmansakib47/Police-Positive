import mongoose from "mongoose"

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
)

const User = mongoose.model("User", userSchema)

export default User
