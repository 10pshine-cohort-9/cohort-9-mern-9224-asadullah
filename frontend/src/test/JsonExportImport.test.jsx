import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JsonExportImport from '../components/JsonExportImport'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'



jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))



jest.mock('../services/api', () => ({
  post: jest.fn(),
}))



jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
    sheet_to_json: jest.fn(),
  },
  writeFile: jest.fn(),
  read: jest.fn(),
}))

describe('JsonExportImport Component', () => {
  let mockSetNotes
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetNotes = jest.fn()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})



    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    window.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })



  test('shows error toast if attempting to export JSON with empty notes', () => {
    render(<JsonExportImport notes={[]} setNotes={mockSetNotes} />)

    const exportJsonBtn = screen.getByRole('button', { name: /export json/i })
    fireEvent.click(exportJsonBtn)

    expect(toast.error).toHaveBeenCalledWith('Export karne ke liye koi notes nahi hain')
  })

  test('exports notes to JSON file successfully', () => {
    const mockNotes = [
      { _id: '1', title: 'Note 1', content: '<p>Content 1</p>' },
    ]

    render(<JsonExportImport notes={mockNotes} setNotes={mockSetNotes} />)

    const exportJsonBtn = screen.getByRole('button', { name: /export json/i })
    fireEvent.click(exportJsonBtn)

    expect(window.URL.createObjectURL).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('JSON file download ho gayi!')
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })



  test('shows error toast if attempting to export Excel with empty notes', () => {
    render(<JsonExportImport notes={[]} setNotes={mockSetNotes} />)

    const exportExcelBtn = screen.getByRole('button', { name: /export excel/i })
    fireEvent.click(exportExcelBtn)

    expect(toast.error).toHaveBeenCalledWith('No notes available to export')
  })

  test('exports notes to Excel file successfully', () => {
    const mockNotes = [
      { _id: '1', title: 'Note 1', content: 'Content 1', createdAt: '2026-08-01' },
    ]

    render(<JsonExportImport notes={mockNotes} setNotes={mockSetNotes} />)

    const exportExcelBtn = screen.getByRole('button', { name: /export excel/i })
    fireEvent.click(exportExcelBtn)

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled()
    expect(XLSX.writeFile).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Excel file downloaded successfully!')
  })



  test('handles JSON import with invalid format', async () => {
    render(<JsonExportImport notes={[]} setNotes={mockSetNotes} />)

    const file = new File(['{"invalid": "not an array"}'], 'test.json', {
      type: 'application/json',
    })

    const fileInputs = document.querySelectorAll('input[type="file"]')
    const jsonFileInput = fileInputs[0]

    fireEvent.change(jsonFileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid JSON format. Expected an array of notes.')
    })
  })

  test('imports valid JSON notes and posts them to API', async () => {
    const newNote = { _id: '101', title: 'Imported Title', content: 'Imported Content' }
    api.post.mockResolvedValueOnce({ data: { note: newNote } })

    render(<JsonExportImport notes={[]} setNotes={mockSetNotes} />)

    const validJson = JSON.stringify([{ title: 'Imported Title', content: 'Imported Content' }])
    const file = new File([validJson], 'valid_notes.json', { type: 'application/json' })

    const fileInputs = document.querySelectorAll('input[type="file"]')
    const jsonFileInput = fileInputs[0]

    fireEvent.change(jsonFileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/notes', {
        title: 'Imported Title',
        content: 'Imported Content',
      })
      expect(mockSetNotes).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('1 notes imported successfully!', {
        id: 'importStatus',
      })
    })
  })

  

 test('imports valid Excel notes successfully', async () => {
    const importedExcelData = [{ Title: 'Excel Title', Content: 'Excel Content' }]
  
    XLSX.read.mockReturnValueOnce({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    })
    XLSX.utils.sheet_to_json.mockReturnValueOnce(importedExcelData)

    const createdNote = { _id: '202', title: 'Excel Title', content: 'Excel Content' }
    api.post.mockResolvedValueOnce({ data: { note: createdNote } })

    render(<JsonExportImport notes={[]} setNotes={mockSetNotes} />)

    const file = new File(['dummy excel content'], 'notes.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const fileInputs = document.querySelectorAll('input[type="file"]')
    const excelFileInput = fileInputs[1]

    fireEvent.change(excelFileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(XLSX.read).toHaveBeenCalled()
      expect(api.post).toHaveBeenCalledWith('/notes', {
        title: 'Excel Title',
        content: 'Excel Content',
      })
      expect(mockSetNotes).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('1 notes imported successfully!', {
        id: 'importStatus',
      })
    })
  })
})