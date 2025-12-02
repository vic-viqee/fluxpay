import React from 'react'

interface TableColumn<T> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  keyField?: string
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  emptyState?: React.ReactNode
  loading?: boolean
}

export const Table = React.forwardRef<
  HTMLTableElement,
  TableProps<any>
>(
  (
    {
      columns,
      data,
      keyField = 'id',
      striped = true,
      hoverable = true,
      compact = false,
      emptyState = 'No data available',
      loading = false,
    },
    ref
  ) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table
          ref={ref}
          className="w-full border-collapse bg-white"
        >
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`
                    ${col.width || 'auto'}
                    ${alignClasses[col.align || 'left']}
                    font-semibold text-neutral-700
                    ${compact ? 'px-4 py-2 text-sm' : 'px-6 py-3'}
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-neutral-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-neutral-500">
                  {emptyState}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row[keyField] || idx}
                  className={`
                    border-b border-neutral-200
                    ${striped && idx % 2 !== 0 ? 'bg-neutral-50' : ''}
                    ${hoverable ? 'hover:bg-primary-50 transition-colors' : ''}
                  `}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`
                        ${col.width || 'auto'}
                        ${alignClasses[col.align || 'left']}
                        text-neutral-700
                        ${compact ? 'px-4 py-2 text-sm' : 'px-6 py-4'}
                      `}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }
)

Table.displayName = 'Table'
