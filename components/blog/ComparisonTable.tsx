interface TableProps {
  headers?: string[]
  rows: Array<string[] | Record<string, unknown>>
  title?: string
}

export default function ComparisonTable({ data }: { data: TableProps }) {
  if (data.headers && Array.isArray(data.rows?.[0])) {
    return (
      <div className="overflow-x-auto mb-6">
        {data.title && (
          <h3 className="text-base font-bold text-terra-800 mb-3">{data.title}</h3>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-cream-100">
              {data.headers.map((h, i) => (
                <th key={i} className="text-left px-4 py-2 font-semibold text-terra-800 border-b border-cream-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.rows as string[][]).map((row, i) => (
              <tr key={i} className="border-b border-cream-100">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-terra-800/70">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (Array.isArray(data.rows) && typeof data.rows[0] === 'object' && !Array.isArray(data.rows[0])) {
    const objRows = data.rows as Record<string, unknown>[]
    const keys = Object.keys(objRows[0])
    return (
      <div className="overflow-x-auto mb-6">
        {data.title && (
          <h3 className="text-base font-bold text-terra-800 mb-3">{data.title}</h3>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-cream-100">
              {keys.map((k, i) => (
                <th key={i} className="text-left px-4 py-2 font-semibold text-terra-800 border-b border-cream-200 capitalize">
                  {k.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objRows.map((row, i) => (
              <tr key={i} className="border-b border-cream-100">
                {keys.map((k, j) => (
                  <td key={j} className="px-4 py-2 text-terra-800/70">
                    {String(row[k] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
