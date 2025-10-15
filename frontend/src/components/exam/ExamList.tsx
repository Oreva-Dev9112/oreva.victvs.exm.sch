import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, RefreshCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import api from "@/utils/api"
import {
  type ApiExam,
  mapExamListFromApi,
  normalizeExamStatus,
  validExamStatuses,
} from "@/utils/mapExamResponse"
import { examColumns } from "./columns"
import ExamCard from "./ExamCard"
import type { ExamSession, ExamSessionStatus } from "./types"
import { getNextStatus, getStatusBadgeVariant } from "./status"
import { useMediaQuery } from "@/hooks/use-media-query"

const statusOptions: ExamSessionStatus[] = validExamStatuses

export default function ExamList() {
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingExamId, setUpdatingExamId] = useState<number | null>(null)
  const [sorting, setSorting] = useState<SortingState>([{ id: "datetime", desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const detailRef = useRef<HTMLDivElement | null>(null)

  const handleActivateSession = useCallback(
    // Store the active session and scroll the details card into view on mobile
    (session: ExamSession) => {
      setSelectedSessionId(session.id)
      if (!isDesktop) {
        requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
      }
    },
    [isDesktop]
  )

  useEffect(() => {
    const controller = new AbortController()

    async function fetchSessions() {
      // Initial load of schedule data from Laravel
      setIsLoading(true)
      setError(null)

      try {
        const { data } = await api.get<ApiExam[]>("/exams", { signal: controller.signal })
        setSessions(mapExamListFromApi(data))
      } catch (fetchError) {
        if ((fetchError as Error).name === "CanceledError") {
          return
        }
        // eslint-disable-next-line no-console
        console.error("Failed to fetch exams", fetchError)
        setError("Unable to load exam sessions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()

    return () => controller.abort()
  }, [])

  const handleAdvanceStatus = useCallback(async (session: ExamSession) => {
    const nextStatus = getNextStatus(session.status)
    if (!nextStatus) return

    try {
      setUpdatingExamId(session.id)
      const { data } = await api.put<{ id: number; status: string }>(`/exams/${session.id}/status`, {
        status: nextStatus,
      })
      const normalizedStatus = normalizeExamStatus(data.status)
      setSessions((prev) =>
        prev.map((item) => (item.id === session.id ? { ...item, status: normalizedStatus } : item))
      )
    } catch (updateError) {
      // eslint-disable-next-line no-console
      console.error("Failed to update exam status", updateError)
    } finally {
      setUpdatingExamId(null)
    }
  }, [])

  const table = useReactTable<ExamSession>({
    data: sessions,
    columns: examColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    meta: {
      onActivate: handleActivateSession,
    },
  })

  useEffect(() => {
    // Drop selection if the active row disappears due to filtering
    if (selectedSessionId === null) return
    const rows = table.getFilteredRowModel().rows
    const isVisible = rows.some((row) => row.original.id === selectedSessionId)
    if (!isVisible) {
      setSelectedSessionId(null)
    }
  }, [selectedSessionId, table, sessions])

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  )
  const nextStatus = selectedSession ? getNextStatus(selectedSession.status) : null

  const handleFilterChange = useCallback(
    (columnId: string, value: string) => {
      const column = table.getColumn(columnId)
      column?.setFilterValue(value || undefined)
      table.setPageIndex(0)
    },
    [table]
  )

  const handleResetFilters = useCallback(() => {
    table.resetColumnFilters()
    table.setSorting([{ id: "datetime", desc: false }])
    table.setPageIndex(0)
  }, [table])

  const candidateFilterValue = (table.getColumn("candidates")?.getFilterValue() as string) ?? ""
  const locationFilterValue = (table.getColumn("location")?.getFilterValue() as string) ?? ""
  const dateFilterValue = (table.getColumn("datetime")?.getFilterValue() as string) ?? ""
  const statusFilterValue = (table.getColumn("status")?.getFilterValue() as string) ?? ""

  const paginationState = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const from = totalRows > 0 ? paginationState.pageIndex * paginationState.pageSize + 1 : 0
  const to = totalRows > 0 ? Math.min(totalRows, (paginationState.pageIndex + 1) * paginationState.pageSize) : 0
  const visibleRows = table.getRowModel().rows

  const hasActiveFilters =
    columnFilters.length > 0 || sorting.some((entry) => entry.id !== "datetime" || entry.desc !== false)

  const detailPanel = selectedSession ? (
    <div className="space-y-4">
      <ExamCard session={selectedSession} />
      <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Current status:
            <span className="ml-1 font-medium text-foreground">{selectedSession.status}</span>
          </p>
          {nextStatus ? (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => handleAdvanceStatus(selectedSession)}
              disabled={updatingExamId === selectedSession.id}
            >
              {updatingExamId === selectedSession.id ? "Updating…" : `Advance to ${nextStatus}`}
            </Button>
          ) : (
            <Badge variant="success" className="uppercase">
              Finished
            </Badge>
          )}
        </div>
      </div>
    </div>
  ) : null

  const detailFallback = (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
      Select an exam to view details.
    </div>
  )

  const resolvedDetail = detailPanel ?? detailFallback

  return (
    <section className="space-y-8">
      <header className="space-y-2 text-center xl:text-center" style={{marginTop:"-98px"}}>
        <h1 className="text-2xl font-semibold text-white">Upcoming sessions</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage live exam sessions synced from the Laravel backend.
        </p>
      </header>

      <div className="space-y-6 xl:space-y-0 xl:grid xl:grid-cols-[minmax(900px,_2.5fr)_minmax(320px,_1fr)] xl:items-start xl:gap-6" style={{padding:"35px"}}>
        <div className="rounded-2xl border bg-card min-w-0">
          <div className="border-b border-border/60 px-4 py-4 sm:px-6">
            <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="candidate-filter">Candidate</Label>
                <Input
                  id="candidate-filter"
                  placeholder="Search name"
                  value={candidateFilterValue}
                  onChange={(event) => handleFilterChange("candidates", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-filter">Location</Label>
                <Input
                  id="location-filter"
                  placeholder="Search location"
                  value={locationFilterValue}
                  onChange={(event) => handleFilterChange("location", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-filter">Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilterValue}
                  onChange={(event) => handleFilterChange("datetime", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={statusFilterValue || "all"}
                  onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
              >
                <RefreshCcw className="size-4" aria-hidden />
                Reset view
              </Button>
              <span className="text-xs text-muted-foreground">
                {totalRows} session{totalRows === 1 ? "" : "s"} found
              </span>
            </div>
            {error ? (
              <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>

          <div className="px-4 pb-4 sm:px-6">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading sessions…</div>
            ) : (
              <>
                <div className="grid gap-4 lg:hidden">
                  {visibleRows.length ? (
                    visibleRows.map((row) => (
                      <article
                        key={row.id}
                        className="cursor-pointer rounded-2xl border border-border/60 bg-muted/10 p-4 shadow-sm transition hover:border-border/80"
                        role="button"
                        tabIndex={0}
                    onClick={() => handleActivateSession(row.original)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        handleActivateSession(row.original)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{row.original.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(row.original.datetime).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(row.original.status)} className="uppercase">
                        {row.original.status}
                      </Badge>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">{row.original.location.country}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {row.original.candidates.slice(0, 3).map((candidate) => (
                        <Badge key={candidate} variant="outline" className="text-xs">
                          {candidate}
                        </Badge>
                      ))}
                      {row.original.candidates.length > 3 ? (
                        <span className="text-xs text-muted-foreground">
                          +{row.original.candidates.length - 3} more
                        </span>
                      ) : null}
                    </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                      No sessions match the current filters.
                    </div>
                  )}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <Table className="w-full min-w-[900px] table-fixed">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : header.column.getCanSort() ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="-ml-3 h-8 px-2 text-left font-semibold"
                                      onClick={header.column.getToggleSortingHandler()}
                                    >
                                      {flexRender(header.column.columnDef.header, header.getContext())}
                                      <ArrowUpDown className="ml-2 size-4" aria-hidden />
                                    </Button>
                                  ) : (
                                    flexRender(header.column.columnDef.header, header.getContext())
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {visibleRows.length ? (
                        visibleRows.map((row) => {
                          const isSelected = selectedSessionId === row.original.id
                          return (
                            <TableRow key={row.id} data-state={isSelected ? "selected" : undefined}>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={examColumns.length} className="h-32 text-center text-sm text-muted-foreground">
                            No sessions match the current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>

          {!isLoading ? (
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-4 text-sm sm:px-6">
              <span className="text-muted-foreground">
                Showing {from}-{to} of {totalRows}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </footer>
          ) : null}
        </div>

        <aside className="hidden space-y-4 text-foreground xl:block" style={{margin:"19px"}}>
          <h2 className="text-base font-semibold tracking-tight">Exam details</h2>
          {resolvedDetail}
        </aside>
      </div>

      <div ref={detailRef} className="space-y-4 xl:hidden" style={{margin:"19px"}}>
        <h2 className="text-base font-semibold tracking-tight">Exam details</h2>
        {resolvedDetail}
      </div>
    </section>
  )
}
