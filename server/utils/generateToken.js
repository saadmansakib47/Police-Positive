import jwt from "jsonwebtoken"

const generateToken = (user) => {
  jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  })
}

export default generateToken
