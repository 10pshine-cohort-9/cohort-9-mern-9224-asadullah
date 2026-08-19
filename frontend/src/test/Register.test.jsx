import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'
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

describe('Register Component', () => {
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  test('renders headings, form inputs, submit button, and login link correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register now/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  test('shows validation error toast if required fields are missing', () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    const form = container.querySelector('form')
    fireEvent.submit(form)

    expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
    expect(api.post).not.toHaveBeenCalled()
  })

  test('shows validation error toast if passwords do not match', () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'john@company.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match')
    expect(api.post).not.toHaveBeenCalled()
  })

  test('registers account successfully, shows toast, and navigates to login page', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } })

    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'john@company.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'johndoe',
        email: 'john@company.com',
        password: 'password123',
      })
      expect(toast.success).toHaveBeenCalledWith('Account created successfully! Please login.')
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  test('handles registration API failure gracefully', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } },
    })

    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'john@company.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists')
    })
  })
})