import TimelineEvent from "../models/TimelineEvent.js"

export const generateCaseNumber = () => {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `CASE-${year}-${random}`
}

export const addTimelineEvent = async (
  complaintId,
  type,
  description,
  userId = null
) => {
  const event = new TimelineEvent({ complaintId, type, description, userId })
  await event.save()
}
