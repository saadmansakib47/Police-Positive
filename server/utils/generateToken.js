import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "24h",
    }
  )
}

export default generateToken
