import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('renders headings, form inputs, submit button, and register link correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register account/i })).toBeInTheDocument()

  })

  test('shows validation error toast if email or password is missing on submit', () => {

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>

    )

    const form = container.querySelector('form')
    fireEvent.submit(form)

    expect(toast.error).toHaveBeenCalledWith('Please fill in all fields')
    expect(api.post).not.toHaveBeenCalled()

  })

  test('logs in successfully, saves token in localStorage, shows toast, and navigates to dashboard', async () => {
    const fakeToken = 'mock-jwt-token-123'
    api.post.mockResolvedValueOnce({ data: { token: fakeToken } })
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'user@company.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@company.com',
        password: 'password123',

      })
      expect(setItemSpy).toHaveBeenCalledWith('token', fakeToken)
      expect(toast.success).toHaveBeenCalledWith('Welcome back!')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('handles login API error gracefully', async () => {
    
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    })

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'user@company.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } })

    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})