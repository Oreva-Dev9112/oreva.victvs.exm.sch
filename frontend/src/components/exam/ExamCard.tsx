import { CalendarRange, Clock3, Flag, MapPin, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import type { ExamSession } from "./types"
import { extractLocalDateParts } from "./types"
import { getStatusBadgeVariant } from "./status"

export interface ExamCardProps {
  session: ExamSession
  onViewDetails?: (session: ExamSession) => void
}

export function ExamCard({ session, onViewDetails }: ExamCardProps) {
  const { dateLabel, timeLabel } = extractLocalDateParts(session.datetime)
  const statusVariant = getStatusBadgeVariant(session.status)

  return (
    <Card className="rounded-2xl border border-border/70 bg-card text-foreground shadow-sm">
      <CardHeader className="gap-4 sm:gap-2">
        <CardTitle className="flex flex-col gap-3 text-xl font-semibold tracking-tight sm:flex-row sm:items-start sm:gap-3">
          <span className="flex-1 text-pretty text-lg sm:text-xl">{session.title}</span>
          <Badge variant={statusVariant} className="self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {session.status}
          </Badge>
        </CardTitle>

        <CardDescription className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <span className="inline-flex items-center gap-2">
            <CalendarRange className="size-4" aria-hidden />
            {dateLabel}
          </span>
          {timeLabel ? (
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4" aria-hidden />
              {timeLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" aria-hidden />
            {session.location.country}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-4 text-sm sm:px-6">
        <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
          <div className="flex flex-col gap-2 text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
            <Users className="size-4" aria-hidden />
            <span className="font-medium text-foreground">Candidates</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.candidates.map((candidate) => (
              <span
                key={candidate}
                className="rounded-full border border-border/50 bg-background px-3 py-1 text-xs font-medium text-foreground"
              >
                {candidate}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
          <span className="inline-flex items-center gap-2">
            <Flag className="size-4" aria-hidden />
            <span className="font-medium text-foreground">Language</span>
          </span>
          <span className="text-foreground">{session.language}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/70 px-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <span>Session ID: {session.id}</span>
        </div>
        {onViewDetails ? (
          <CardAction className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onViewDetails(session)}>
              View exam details
            </Button>
          </CardAction>
        ) : null}
      </CardFooter>
    </Card>
  )
}

export default ExamCard
