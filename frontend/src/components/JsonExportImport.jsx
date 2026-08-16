import React, { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import * as XLSX from 'xlsx'

const JsonExportImport = ({ notes = [], setNotes }) => {
  const jsonInputRef = useRef(null)
  const excelInputRef = useRef(null)

  const stripHtml = (htmlString) => {
    if (!htmlString || typeof htmlString !== 'string') return ''
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return (doc.body.textContent || '').trim()
  }

  const getNoteData = (noteObj) => {
    const title = noteObj.title || noteObj.Title || ''
    const rawContent = noteObj.content || noteObj.Content || ''

    return {
      title: typeof title === 'string' ? title.trim() : '',
      content: stripHtml(String(rawContent)),
    }
  }

  const handleExportJson = () => {
    if (notes.length === 0) {
      toast.error('Export karne ke liye koi notes nahi hain')
      return
    }

    const cleanNotes = notes.map((note) => ({
      ...note,
      content: stripHtml(note.content),
    }))

    const jsonString = JSON.stringify(cleanNotes, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `notes_backup_${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    toast.success('JSON file download ho gayi!')
  }

  const handleExportExcel = () => {
    if (notes.length === 0) {
      toast.error('No notes available to export')
      return
    }

    const exportData = notes.map((note) => ({
      Title: note.title || '',
      Content: stripHtml(note.content || ''),
      CreatedAt: note.createdAt
        ? new Date(note.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes')
    XLSX.writeFile(workbook, `notes_backup_${Date.now()}.xlsx`)

    toast.success('Excel file downloaded successfully!')
  }

  const handleImportJson = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const importedNotes = JSON.parse(event.target.result)

        if (!Array.isArray(importedNotes)) {
          toast.error('Invalid JSON format. Expected an array of notes.')
          return
        }

        const validNotes = importedNotes
          .map(getNoteData)
          .filter((note) => note.title && note.content)

        if (validNotes.length === 0) {
          toast.error('No valid notes found in the file.')
          return
        }

        toast.loading('Importing notes...', { id: 'importStatus' })

        const importPromises = validNotes.map((note) =>
          api.post('/notes', {
            title: note.title,
            content: note.content,
          })
        )

        const responses = await Promise.all(importPromises)
        const createdNotes = responses.map((res) => res.data.note || res.data)

        setNotes((prevNotes) => [...prevNotes, ...createdNotes])
        toast.success(`${createdNotes.length} notes imported successfully!`, {
          id: 'importStatus',
        })
      } catch (error) {
        console.error('Import JSON error:', error)
        toast.error(
          error.response?.data?.message || 'Failed to import JSON file.',
          { id: 'importStatus' }
        )
      } finally {
        e.target.value = ''
      }
    }

    reader.readAsText(file)
  }

  const handleImportExcel = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const importedNotes = XLSX.utils.sheet_to_json(worksheet)

        if (!Array.isArray(importedNotes) || importedNotes.length === 0) {
          toast.error('No notes found in the Excel file')
          return
        }

        const validNotes = importedNotes
          .map(getNoteData)
          .filter((note) => note.title && note.content)

        if (validNotes.length === 0) {
          toast.error('No valid notes found in Excel file.')
          return
        }

        toast.loading('Importing Excel notes...', { id: 'importStatus' })

        const importPromises = validNotes.map((note) =>
          api.post('/notes', {
            title: note.title,
            content: note.content,
          })
        )

        const responses = await Promise.all(importPromises)
        const createdNotes = responses.map((res) => res.data.note || res.data)

        setNotes((prevNotes) => [...prevNotes, ...createdNotes])
        toast.success(
          `${createdNotes.length} notes imported successfully!`,
          { id: 'importStatus' }
        )
      } catch (error) {
        console.error('Excel import error:', error)
        toast.error(
          error.response?.data?.message || 'Failed to import Excel file',
          { id: 'importStatus' }
        )
      } finally {
        e.target.value = ''
      }
    }

    reader.readAsArrayBuffer(file)
  }
  

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="file"
        ref={jsonInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={excelInputRef}
        onChange={handleImportExcel}
        accept=".xlsx, .xls"
        className="hidden"
      />

      <button
        type="button"
        onClick={handleExportJson}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#161C2A] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white active:scale-95"
      >
        <Download className="h-4 w-4 text-violet-400" />
        <span>Export JSON</span>
      </button>

      <button
        type="button"
        onClick={() => jsonInputRef.current?.click()}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#161C2A] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white active:scale-95"
      >
        <Upload className="h-4 w-4 text-emerald-400" />
        <span>Import JSON</span>
      </button>

      <button
        type="button"
        onClick={handleExportExcel}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#161C2A] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white active:scale-95"
      >
        <Download className="h-4 w-4 text-blue-400" />
        <span>Export Excel</span>
      </button>


      <button
        type="button"
        onClick={() => excelInputRef.current?.click()}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#161C2A] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white active:scale-95"
      >
        <Upload className="h-4 w-4 text-emerald-400" />
        <span>Import Excel</span>
      </button>
    </div>
  )
}

export default JsonExportImport