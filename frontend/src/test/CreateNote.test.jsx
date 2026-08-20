import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CreateNote from '../pages/CreateNote'
import api from '../services/api'
import { toast } from 'react-hot-toast'




const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))




jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))




jest.mock('../services/api', () => ({
  post: jest.fn(),
}))



jest.mock('../components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Mocked Navbar</div>
  }
})


jest.mock('../components/RichTextEditor', () => {
  return function MockRichTextEditor({ value, onChange }) {
    return (
      <textarea
        data-testid="mock-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
})

describe('CreateNote Component', () => {
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
   
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  test('renders page headings, form inputs, and buttons correctly', () => {
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
    expect(screen.getByText(/Create New Workspace Note/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter note title.../i)).toBeInTheDocument()
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create note/i })).toBeInTheDocument()
  })

  test('shows validation error toast if title or content is empty on submit', () => {
    const { container } = render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )

    const form = container.querySelector('form')
    fireEvent.submit(form)

    expect(toast.error).toHaveBeenCalledWith('Please fill in both title and content')
    expect(api.post).not.toHaveBeenCalled()
  })

  test('creates note successfully, shows toast, and navigates to dashboard', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } })

    const { container } = render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )

    const titleInput = screen.getByPlaceholderText(/Enter note title.../i)
    const contentEditor = screen.getByTestId('mock-editor')
    const form = container.querySelector('form')

    fireEvent.change(titleInput, { target: { value: 'Test Title' } })
    fireEvent.change(contentEditor, { target: { value: '<p>Test Content Body</p>' } })

    fireEvent.submit(form)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/notes', {
        title: 'Test Title',
        content: '<p>Test Content Body</p>',
      })
      expect(toast.success).toHaveBeenCalledWith('Note created successfully!')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('handles API error on note creation failure gracefully', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Failed to create note on server' } },
    })

    const { container } = render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter note title.../i), {
      target: { value: 'Test Title' },
    })
    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: '<p>Test Content</p>' },
    })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create note on server')
    })
  })
})