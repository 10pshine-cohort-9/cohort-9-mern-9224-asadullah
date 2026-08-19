import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { toast } from 'react-hot-toast'


const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))



jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
  },
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Storage.prototype.removeItem = jest.fn()
  })

  test('renders logo, app name, and navigation links correctly', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )


    expect(screen.getByText('Note APP')).toBeInTheDocument()


    expect(screen.getByRole('link', { name: /new note/i })).toBeInTheDocument()


    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()

  
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  test('clears token, shows toast, and navigates to /login on logout click', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const logoutButton = screen.getByRole('button', { name: /log out/i })
    fireEvent.click(logoutButton)

    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')

  
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully')

   
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})