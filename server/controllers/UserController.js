import User from "../models/User.js"

const getOfficers = async (req, res) => {
  try {
    const officers = await User.find(
      { role: "operator" },
      "id firstName lastName badgeNumber"
    )

    const officerList = officers.map((officer) => ({
      id: officer._id.toString(),
      name: `${officer.firstName} ${officer.lastName}`,
      badgeNumber: officer.badgeNumber,
    }))

    res.json(officerList)
  } catch (err) {
    console.error("Error fetching officers:", err)
    res.status(500).json({ message: "Server error" })
  }
}

export { getOfficers }
