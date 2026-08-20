import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EditNote from '../pages/EditNote'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const mockNavigate = jest.fn()
let mockParamId = '123'




jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: mockParamId }),
}))




jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))



jest.mock('../services/api', () => ({
  get: jest.fn(),
  patch: jest.fn(),
}))




jest.mock('../components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar Component</div>
  }
})




jest.mock('../components/RichTextEditor', () => {
  
  return function MockRichTextEditor({ value, onChange, id }) {
    return (
      <textarea
        id={id}
        data-testid="mock-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
})

describe('EditNote Component', () => {
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockParamId = '123'
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  test('redirects to dashboard when note ID is invalid or "all"', async () => {
    mockParamId = 'all'

    render(
      <MemoryRouter>
        <EditNote />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid Note ID')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })

  test('fetches and populates note details successfully', async () => {
    const mockNote = {
      title: 'Existing Note Title',
      content: '<p>Existing note content</p>',
    }
    api.get.mockResolvedValueOnce({ data: { note: mockNote } })

    render(
      <MemoryRouter>
        <EditNote />
      </MemoryRouter>
    )

    expect(screen.getByText(/fetching note details from server/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/notes/123', expect.any(Object))
      expect(screen.getByDisplayValue('Existing Note Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('<p>Existing note content</p>')).toBeInTheDocument()
    })
  })

  test('shows error view when fetching note details fails and allows retry', async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { message: 'Note not found' } },
    })

    render(
      <MemoryRouter>
        <EditNote />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Note not found')
      expect(screen.getByText('Failed to Load Note')).toBeInTheDocument()
    })



    api.get.mockResolvedValueOnce({
      data: { note: { title: 'Retried Title', content: 'Retried Content' } },
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Retried Title')).toBeInTheDocument()
    })
  })

 test('shows validation toast if title or content is empty on submit', async () => {
    api.get.mockResolvedValueOnce({
      data: { note: { title: 'Initial Title', content: '<p>Initial Content</p>' } },
    })

    render(
      <MemoryRouter>
        <EditNote />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument()
    })

    

    const titleInput = screen.getByLabelText(/note title/i)
    fireEvent.change(titleInput, { target: { value: '   ' } })

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    expect(toast.error).toHaveBeenCalledWith('Please fill in both title and content')
    expect(api.patch).not.toHaveBeenCalled()
  })

  
  test('shows error toast when note update API fails', async () => {
    api.get.mockResolvedValueOnce({
      data: { note: { title: 'Title', content: '<p>Content</p>' } },
    })
    api.patch.mockRejectedValueOnce({
      response: { data: { message: 'Server update failed' } },
    })

    render(
      <MemoryRouter>
        <EditNote />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Title')).toBeInTheDocument()
    })

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server update failed')
    })
  })
})