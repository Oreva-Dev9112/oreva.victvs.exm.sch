import type { ColumnDef } from "@tanstack/react-table"
import { CalendarClock, ChevronsRight, Flag, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import "./table-types"
import type { ExamSession } from "./types"
import { extractLocalDateParts } from "./types"
import { getStatusBadgeVariant } from "./status"

export const examColumns: ColumnDef<ExamSession>[] = [
  {
    accessorKey: "title",
    header: "Exam",
    cell: ({ row }) => (
      <div className="space-y-1 max-w-[260px] break-words">
        <p className="font-medium leading-tight text-pretty">{row.original.title}</p>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1 text-pretty">
          <Flag className="size-3" aria-hidden />
          {row.original.language}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)} className="uppercase tracking-wide whitespace-nowrap">
        {row.original.status}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true
      return row.getValue<string>(id) === value
    },
    enableHiding: false,
  },
  {
    accessorKey: "datetime",
    header: "Schedule",
    cell: ({ row }) => {
      const { dateLabel, timeLabel } = extractLocalDateParts(row.original.datetime)
      return (
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
            {dateLabel}
          </p>
          <p className="text-xs text-muted-foreground">{timeLabel}</p>
        </div>
      )
    },
    sortingFn: (a, b, columnId) => {
      const aDate = new Date(a.getValue<string>(columnId)).getTime()
      const bDate = new Date(b.getValue<string>(columnId)).getTime()
      return aDate - bDate
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const iso = row.getValue<string>(id)
      return iso?.startsWith(value as string)
    },
  },
  {
    id: "candidates",
    header: "Candidates",
    accessorFn: (row) => row.candidates.join(", "),
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1.5">
        {row.original.candidates.map((candidate) => (
          <Badge key={candidate} variant="outline" className="font-medium">
            {candidate}
          </Badge>
        ))}
      </div>
    ),
    filterFn: (row, _id, value) => {
      if (!value) return true
      return row.original.candidates.some((candidate) =>
        candidate.toLowerCase().includes((value as string).toLowerCase())
      )
    },
  },
  {
    id: "location",
    header: "Location",
    accessorFn: (row) => row.location.country,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" aria-hidden />
        <span>{row.original.location.country}</span>
      </div>
    ),
    filterFn: (row, _id, value) => {
      if (!value) return true
      return row.original.location.country.toLowerCase().includes((value as string).toLowerCase())
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const { onActivate } = table.options.meta ?? {}

      return (
        <Button
          variant="secondary"
          size="sm"
          className="gap-1"
          onClick={(event) => {
            event.stopPropagation()
            onActivate?.(row.original)
          }}
        >
          View
          <ChevronsRight className="size-4" aria-hidden />
        </Button>
      )
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
]
