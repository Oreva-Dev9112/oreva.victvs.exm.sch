export type ExamSessionStatus = "Pending" | "Started" | "Finished"

export interface ExamSessionLocation {
  country: string
  latitude: number
  longitude: number
}

export interface ExamSession {
  id: number
  title: string
  status: ExamSessionStatus
  datetime: string
  language: string
  candidates: string[]
  location: ExamSessionLocation
}

export function extractLocalDateParts(datetime: string) {
  const date = new Date(datetime)

  if (Number.isNaN(date.getTime())) {
    return { dateLabel: datetime, timeLabel: "" }
  }

  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return { dateLabel, timeLabel }
}
