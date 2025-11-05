export const downloadFile = (blob: Blob, filename: string, mimeType?: string) => {
  const finalBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob

  const link = document.createElement('a')
  link.href = URL.createObjectURL(finalBlob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export const generateFileName = (prefix: string, extension = 'xlsx'): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const month = monthNames[now.getMonth()]
  const year = now.getFullYear()
  let hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${prefix}_${day}${month}${year}_${hours}.${minutes}${ampm}.${extension}`
}

export const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
