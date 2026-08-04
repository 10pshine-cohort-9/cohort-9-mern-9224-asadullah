import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { User, Mail, Lock, ShieldCheck, ArrowRight, Layers } from 'lucide-react'
import api from '../services/api'

const Register = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

const handleRegister = async (e) =>{
   e.preventDefault() 

    if (!username || !email || !password){
       toast.error('Please fill in all required fields') 
       return
      } 

       if (password !== confirmPassword) { 
        toast.error('Passwords do not match') 
        return
      } 

      setLoading(true) 

      try{
         await api.post('/auth/register', { name: username, email, password, }) 
         toast.success('Account created successfully! Please login.')
          navigate('/login')
         } catch (error)
          { console.error('Registration error:', error.response?.data || error)
             toast.error( error.response?.data?.message || 'Registration failed' ) 
            } finally { setLoading(false) } 
          }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0B0F17] text-slate-100 font-sans">
     
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#111622] border-r border-slate-800/80">
      
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black font-bold">
            <Layers className="h-5 w-5" />
          </div>

          <span className="text-xl font-bold tracking-tight text-white">Note APP</span>
        </div>

        <div className="my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold tracking-wide uppercase border border-slate-700">
            Enterprise Grade Workspace
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
            Digital Transformation for your daily notes & workflow.
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Engineered for modern developers. Organize, track, and secure your ideas with high precision and minimalism.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          © 2026 Note APP Platform. Built with quality engineering.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#0B0F17]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign up to access your Note APP workspace.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor='name' className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input id='name'
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full rounded-lg bg-[#161C2A] border border-slate-800 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor='email' className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input id='email'
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-lg bg-[#161C2A] border border-slate-800 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor='password' className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input id='password'
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#161C2A] border border-slate-800 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor='confirm-password' className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input id='confirm-password'
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#161C2A] border border-slate-800 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-slate-200 py-3 text-sm font-bold text-black transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating...' : 'Register Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register