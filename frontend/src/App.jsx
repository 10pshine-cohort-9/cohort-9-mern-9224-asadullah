import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateNote from './pages/CreateNote'
import EditNote from './pages/EditNote'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/create"
        element={
          <ProtectedRoute>
            <CreateNote />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/edit/:id"
        element={
          <ProtectedRoute>
            <EditNote />
          </ProtectedRoute>
        }
      />


      <Route
        path="/profile"
        element={
          <ProtectedRoute>
              <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App