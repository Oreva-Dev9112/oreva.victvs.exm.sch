import type { RowData } from "@tanstack/react-table"

import type { ExamSession } from "./types"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onActivate?: (session: ExamSession) => void
  }
}
