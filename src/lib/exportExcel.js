import * as XLSX from 'xlsx'

export function exportToExcel(data, sheetName = 'Datos', fileName = 'reporte.xlsx') {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar.')
    return
  }

  const ws = XLSX.utils.json_to_sheet(data)

  // Auto-size columns
  const keys = Object.keys(data[0])
  ws['!cols'] = keys.map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    ) + 2,
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, fileName)
}

export function exportMultiSheetToExcel(sheets, fileName = 'reportes.xlsx') {
  const wb = XLSX.utils.book_new()

  for (const { data, name } of sheets) {
    if (!data || data.length === 0) continue
    
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Auto-size columns
    const keys = Object.keys(data[0])
    ws['!cols'] = keys.map((key) => ({
      wch: Math.max(
        key.length,
        ...data.map((row) => String(row[key] ?? '').length)
      ) + 2,
    }))
    
    XLSX.utils.book_append_sheet(wb, ws, name)
  }

  if (wb.SheetNames.length === 0) {
    alert('No hay datos para exportar en ninguna pestaña.')
    return
  }

  XLSX.writeFile(wb, fileName)
}
