import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../pages/Profile'
import api from '../services/api'
import { toast } from 'react-hot-toast'


jest.mock('../components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar Component</div>
  }
})



jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))



jest.mock('../services/api', () => ({
  get: jest.fn(),
}))



describe('Profile Component', () => {
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })




  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })




  test('fetches user data on mount and displays user profile details', async () => {
    const mockUserData = {
      user: {
        name: 'Asadullah Rind',
        email: 'asadullah@example.com',
      },
    }


    api.get.mockResolvedValueOnce({ data: mockUserData })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
    expect(screen.getByText(/account overview/i)).toBeInTheDocument()

    await waitFor(() => {

      expect(api.get).toHaveBeenCalledWith('/auth/me')
      expect(screen.getByText('Account Active')).toBeInTheDocument()
      expect(screen.getAllByText('Asadullah Rind').length).toBeGreaterThan(0)
      expect(screen.getAllByText('asadullah@example.com').length).toBeGreaterThan(0)
      expect(screen.getByText('A')).toBeInTheDocument()

    })
  })

  test('handles API failure during user data fetch gracefully', async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { message: 'Failed to load profile' } },
    })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/auth/me')
      expect(toast.error).toHaveBeenCalledWith('Failed to load profile')
      expect(screen.getByText('Session Unavailable')).toBeInTheDocument()
      expect(screen.getByText('Unable to verify your current session.')).toBeInTheDocument()
    })
  })



  test('copies user email to clipboard when Copy Email button is clicked', async () => {
    const mockUserData = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    }
    
    api.get.mockResolvedValueOnce({ data: mockUserData })

    const writeTextMock = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('john@example.com')[0]).toBeInTheDocument()
    })

    const copyBtn = screen.getByRole('button', { name: /copy email/i })
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('john@example.com')
      expect(toast.success).toHaveBeenCalledWith('Email copied to clipboard!')
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })

  test('shows error toast if copying email to clipboard fails', async () => {
    const mockUserData = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    }
    api.get.mockResolvedValueOnce({ data: mockUserData })

    const writeTextMock = jest.fn().mockRejectedValue(new Error('Clipboard error'))
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('john@example.com')[0]).toBeInTheDocument()
    })

    const copyBtn = screen.getByRole('button', { name: /copy email/i })
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to copy email')
    })
  })
})