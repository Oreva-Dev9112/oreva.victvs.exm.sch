import type { BadgeProps } from "@/components/ui/badge"

import type { ExamSessionStatus } from "./types"

const statusOrder: ExamSessionStatus[] = ["Pending", "Started", "Finished"]

export const examStatusVariant: Record<ExamSessionStatus, BadgeProps["variant"]> = {
  Pending: "info",
  Started: "warning",
  Finished: "success",
}

export function getStatusBadgeVariant(status?: ExamSessionStatus): BadgeProps["variant"] | undefined {
  return status ? examStatusVariant[status] ?? "secondary" : undefined
}

export function getNextStatus(status: ExamSessionStatus): ExamSessionStatus | null {
  const index = statusOrder.indexOf(status)
  if (index === -1) return null
  return statusOrder[index + 1] ?? null
}
