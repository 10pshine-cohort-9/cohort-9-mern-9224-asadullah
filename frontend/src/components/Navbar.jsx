import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Layers, Plus,User } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/30 transition-transform group-hover:scale-105">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Note APP</span>
            <span className="hidden sm:block text-[10px] text-violet-400 font-semibold tracking-wider uppercase">Workspace</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/notes/create"
            className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-950/50 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Note</span>
          </Link>


          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#161C2A] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <User className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          

          <button
            onClick={handleLogout}
             aria-label="Log out"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#161C2A] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar