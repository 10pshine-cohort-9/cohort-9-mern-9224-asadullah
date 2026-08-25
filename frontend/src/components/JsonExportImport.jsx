import React, { useState, useRef, useEffect } from 'react'
import { Download, Upload, ChevronDown, FileText, FileSpreadsheet, FileCode } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import * as XLSX from 'xlsx'

const JsonExportImport = ({ notes = [], setNotes, categories = [] }) => {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showImportMenu, setShowImportMenu] = useState(false)

  const jsonInputRef = useRef(null)
  const excelInputRef = useRef(null)
  const txtInputRef = useRef(null)
  
  const exportRef = useRef(null)
  const importRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
      if (importRef.current && !importRef.current.contains(event.target)) {
        setShowImportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const stripHtml = (htmlString) => {
    if (!htmlString || typeof htmlString !== 'string') return ''
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return (doc.body.textContent || '').trim()
  }

  const getCategoryName = (category) => {
    if (!category) return 'No Category'

    if (typeof category === 'object' && category !== null && category.name) {
      return category.name
    }

    const catIdOrName = String(category).trim()

    const match = categories.find(
      (c) =>
        String(c._id || c.id) === catIdOrName ||
        c.name?.toLowerCase() === catIdOrName.toLowerCase()
    )
    if (match) return match.name

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(catIdOrName)
    if (!isMongoId && catIdOrName) return catIdOrName

    return 'No Category'
  }

  const resolveCategoryId = (catVal) => {
    if (!catVal) return null
    if (typeof catVal === 'object' && catVal._id) return catVal._id

    if (typeof catVal === 'string') {
      const cleanVal = catVal.trim().toLowerCase()
      if (cleanVal === 'no category' || !cleanVal) return null

      const found = categories.find(
        (c) => String(c._id || c.id) === catVal || c.name?.toLowerCase() === cleanVal
      )
      return found ? found._id : null
    }
    return null
  }

  const getNoteData = (noteObj) => {
    if (!noteObj || typeof noteObj !== 'object' || Array.isArray(noteObj)) {
      return { title: '', content: '', category: null }
    }

    const title = noteObj.title || noteObj.Title || ''
    const rawContent = noteObj.content || noteObj.Content || ''
    const rawCategory = noteObj.category || noteObj.Category || null

    return {
      title: typeof title === 'string' ? title.trim() : '',
      content: stripHtml(String(rawContent)),
      category: resolveCategoryId(rawCategory),
    }
  }
const processAndImportNotes = async (validNotes) => {
    toast.loading('Importing notes...', { id: 'importStatus' })

    try {
      const formattedNotes = validNotes.map((note) => {
        let categoryName = null
        if (note.category) {
          const match = categories.find((c) => c._id === note.category || c.name.toLowerCase() === String(note.category).toLowerCase())
          categoryName = match ? match.name : note.category
        }

        return {
          title: note.title,
          content: note.content,
          categoryName: categoryName, 
        }
      })

     
      const response = await api.post('/notes/bulk-import', { notes: formattedNotes })

      const importedNotes = response.data.notes || []

  
      setNotes((prevNotes) => [...prevNotes, ...importedNotes])

      toast.success(`${importedNotes.length} notes imported successfully!`, {
        id: 'importStatus',
      })
    } catch (error) {
      console.error('Bulk import error:', error)
      toast.error(
        error.response?.data?.message || 'Failed to import notes',
        { id: 'importStatus' }
      )
    }
  }


  const handleExportJson = () => {
    setShowExportMenu(false)
    if (notes.length === 0) return toast.error('No notes to export')

    const cleanNotes = notes.map((note) => ({
      ...note,
      content: stripHtml(note.content),
      category: getCategoryName(note.category),
    }))

    const blob = new Blob([JSON.stringify(cleanNotes, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `notes_backup_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as JSON')
  }

  const handleExportExcel = () => {
    setShowExportMenu(false)
    if (notes.length === 0) return toast.error('No notes to export')

    const exportData = notes.map((note) => ({
      Title: note.title || '',
      Content: stripHtml(note.content || ''),
      Category: getCategoryName(note.category),
      CreatedAt: note.createdAt
        ? new Date(note.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes')
    XLSX.writeFile(workbook, `notes_backup_${Date.now()}.xlsx`)
    toast.success('Exported as Excel')
  }

  const handleExportTxt = () => {
    setShowExportMenu(false)
    if (notes.length === 0) return toast.error('No notes to export')

    const txtContent = notes
      .map(
        (note) =>
          `TITLE: ${note.title || 'Untitled'}\nCATEGORY: ${getCategoryName(
            note.category
          )}\nCONTENT:\n${stripHtml(note.content || '')}\n----------------------------------------\n`
      )
      .join('\n')

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `notes_backup_${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as TXT')
  }

 
  const handleImportJson = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const importedNotes = JSON.parse(event.target.result)
        if (!Array.isArray(importedNotes)) return toast.error('Invalid JSON format')

        const validNotes = importedNotes.map(getNoteData).filter((n) => n.title && n.content)
        if (!validNotes.length) return toast.error('No valid notes found')

        await processAndImportNotes(validNotes)
      } catch (err) {
        toast.error('Failed to import JSON')
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
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const importedNotes = XLSX.utils.sheet_to_json(worksheet)

        const validNotes = importedNotes.map(getNoteData).filter((n) => n.title && n.content)
        if (!validNotes.length) return toast.error('No valid notes found')

        await processAndImportNotes(validNotes)
      } catch (err) {
        toast.error('Failed to import Excel')
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImportTxt = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        const blocks = text.split('----------------------------------------')

        const parsedNotes = blocks
          .map((block) => {
            const titleMatch = block.match(/TITLE:\s*(.*)/i)
            const catMatch = block.match(/CATEGORY:\s*(.*)/i)
            const contentMatch = block.match(/CONTENT:\s*([\s\S]*)/i)

            const title = titleMatch ? titleMatch[1].trim() : ''
            const rawCategory = catMatch ? catMatch[1].trim() : ''
            const content = contentMatch ? contentMatch[1].trim() : ''

            return {
              title: title || file.name.replace('.txt', ''),
              content: content || block.trim(),
              category: resolveCategoryId(rawCategory),
            }
          })
          .filter((n) => n.title && n.content)

        if (!parsedNotes.length) return toast.error('No valid content found in TXT')

        await processAndImportNotes(parsedNotes)
      } catch (err) {
        toast.error('Failed to import TXT file')
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2">
    
      <input type="file" ref={jsonInputRef} onChange={handleImportJson} accept=".json" className="hidden" />
      <input type="file" ref={excelInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />
      <input type="file" ref={txtInputRef} onChange={handleImportTxt} accept=".txt" className="hidden" />

     
      <div className="relative" ref={exportRef}>
        <button
          type="button"
          onClick={() => {
            setShowExportMenu(!showExportMenu)
            setShowImportMenu(false)
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#161C2A] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-violet-400" />
          <span>Export</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-800 bg-[#161C2A] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
            <button
              onClick={handleExportJson}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileCode className="h-3.5 w-3.5 text-violet-400" /> JSON Format
            </button>
            <button
              onClick={handleExportExcel}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" /> Excel Sheet
            </button>
            <button
              onClick={handleExportTxt}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" /> Plain Text (.txt)
            </button>
          </div>
        )}
      </div>

     
      <div className="relative" ref={importRef}>
        <button
          type="button"
          onClick={() => {
            setShowImportMenu(!showImportMenu)
            setShowExportMenu(false)
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#161C2A] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        >
          <Upload className="h-3.5 w-3.5 text-emerald-400" />
          <span>Import</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${showImportMenu ? 'rotate-180' : ''}`} />
        </button>

        {showImportMenu && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-800 bg-[#161C2A] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowImportMenu(false)
                jsonInputRef.current?.click()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileCode className="h-3.5 w-3.5 text-violet-400" /> From JSON
            </button>
            <button
              onClick={() => {
                setShowImportMenu(false)
                excelInputRef.current?.click()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" /> From Excel
            </button>
            <button
              onClick={() => {
                setShowImportMenu(false)
                txtInputRef.current?.click()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" /> From Text (.txt)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JsonExportImport