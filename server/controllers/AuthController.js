import bcrypt from "bcryptjs"
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      badgeNumber,
      department,
      phone,
    } = req.body
    if (!email || !password || !firstName || !lastName || !role)
      return res.status(400).json({ message: "Missing required fields" })

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      badgeNumber,
      department,
      phone,
    })
    await user.save()

    const userResponse = user.toObject()
    delete userResponse.password

    const token = generateToken(user)
    res.status(201).json({ user: userResponse, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: "Invalid credentials" })

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid credentials" })

    const userResponse = user.toObject()
    delete userResponse.password

    const token = generateToken(user)
    res.json({ user: userResponse, token })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

const verify = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: "Malformed token payload" })
    }

    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found in database" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Verify route error:", error)
    res.status(500).json({ message: "Server error while verifying user" })
  }
}

export { register, login, verify }
