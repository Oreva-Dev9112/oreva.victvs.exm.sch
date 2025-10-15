import type { ExamSession, ExamSessionStatus } from "@/components/exam/types"

export interface ApiCandidate {
  id: number
  name: string
}

export interface ApiExam {
  id: number
  title: string
  status: string
  datetime: string
  language: string
  country: string | null
  latitude: number | null
  longitude: number | null
  candidates?: ApiCandidate[]
}

// All statuses the UI understands. Back-end might send unexpected ones, so we normalise.
export const validExamStatuses: ExamSessionStatus[] = ["Pending", "Started", "Finished"]

export function normalizeExamStatus(status: string): ExamSessionStatus {
  return validExamStatuses.includes(status as ExamSessionStatus) ? (status as ExamSessionStatus) : "Pending"
}

export function mapExamFromApi(exam: ApiExam): ExamSession {
  // Convert the API payload into the shape our table expects.
  // Coordinates/date are left as-is; consumers format them as needed.
  return {
    id: exam.id,
    title: exam.title,
    status: normalizeExamStatus(exam.status),
    datetime: exam.datetime,
    language: exam.language,
    candidates: (exam.candidates ?? []).map((candidate) => candidate.name).filter(Boolean),
    location: {
      country: exam.country ?? "Unknown location",
      latitude: typeof exam.latitude === "number" ? exam.latitude : 0,
      longitude: typeof exam.longitude === "number" ? exam.longitude : 0,
    },
  }
}

export function mapExamListFromApi(exams: ApiExam[]): ExamSession[] {
  return exams.map(mapExamFromApi)
}
