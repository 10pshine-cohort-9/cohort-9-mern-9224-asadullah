import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { User, Mail, ShieldCheck, Layers, Copy, Check, Sparkles, Activity, Key, Database, ArrowUpRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const Profile = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
    })

    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [profileError, setProfileError] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/me')
                setUser(response.data.user)
            } catch (error) {

                setProfileError(true)

                toast.error(
                    error.response?.data?.message || 'Failed to load profile'

                )
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])



    const handleCopyEmail = async () => {

        if (!user.email) return

        try {
            await navigator.clipboard.writeText(user.email)
            setCopied(true)
            toast.success('Email copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Failed to copy email')
        }
    }

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U'
    }

    return (
        <div className="relative min-h-screen bg-[#07090E] text-slate-100 selection:bg-cyan-500/20 overflow-hidden font-sans">


            <Navbar />

            <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:py-14">

                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-400 backdrop-blur-md mb-3">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                            <span>Profile</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Account Overview
                        </h1>
                        <p className="mt-1.5 text-sm sm:text-base text-slate-400">
                            Manage your profile credentials and live session state.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0F1420]/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
                            <span
                                className={`h-2 w-2 rounded-full ${profileError ? 'bg-red-500' : 'bg-emerald-500'}`}
                            />

                            {profileError ? 'Session Unavailable' : 'Account Active'}
                        </div>
                    </div>
                </div>

    <div className="grid gap-8 lg:grid-cols-12 items-start">

        <div className="lg:col-span-4">
            <div className="group relative rounded-3xl border border-slate-800/80 bg-[#0D111C]/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:shadow-cyan-500/10">

                <div className="absolute top-0 inset-x-8 h-0.5 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col items-center text-center">

                    <div className="relative mb-6">
                        
                       
                        <div className="absolute -inset-1 rounded-full bg-linear-to-r from-cyan-500 via-blue-500 to-violet-600 opacity-40 blur-md group-hover:opacity-80 transition duration-500" />
                    
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#121826] border-2 border-slate-700/80 text-4xl font-black text-cyan-300 shadow-2xl">
                    
                        {loading ? (
                            <User className="h-12 w-12 text-slate-600 animate-pulse" />
                        ) : (
                            <span className="bg-linear-to-br from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                {getInitial(user.name)}
                            </span>
                        )}
                    </div>

            <div className="absolute bottom-0 right-0 rounded-full bg-[#0D111C] p-1 border border-slate-700 shadow-md">
                <div className="rounded-full bg-cyan-500/20 p-1.5 text-cyan-400">
                    <ShieldCheck className="h-4 w-4" />
                </div>
            </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
            {loading ? (
                <div className="h-7 w-36 bg-slate-800 animate-pulse rounded-md mx-auto my-1" />
            ) : (
                user.name || 'User Name'
            )}
        </h2>

        <div className="mt-1.5 text-sm text-slate-400 font-medium truncate max-w-full px-2">
            {loading ? (
                <div className="h-4 w-48 bg-slate-800 animate-pulse rounded-md mx-auto my-1" />
            ) : (
                user.email
            )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 w-full">
            <div className="rounded-xl border border-slate-800/60 bg-[#131927]/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Account
                </p>

                <p className="mt-2 text-sm text-slate-300">
                    Your account information is securely synced with the Notes App.
                </p>
            </div>
        </div>

        </div>
    </div>
</div>

<div className="lg:col-span-8 space-y-6">

    <div className="rounded-3xl border border-slate-800/80 bg-[#0D111C]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <User className="h-5 w-5 text-cyan-400" />

                Personal Information
            </h3>

            <span className="text-xs font-mono text-slate-500 bg-slate-800/40 px-3 py-1 rounded-full border border-slate-700/50">
                Profile Data
            </span>
        </div>

        <div className="space-y-4">

            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#131927]/60 p-5 transition-all duration-300 hover:border-slate-700 hover:bg-[#131927] hover:shadow-lg">
                <div className="flex items-center justify-between">


            <div className="flex items-center gap-4">

                <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-6 w-6" />
                </div>
                <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Full Name
                    </p>

                    <p className="mt-1 text-base sm:text-lg font-bold text-white tracking-tight">
                        {loading ? 'Loading...' : user.name || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#131927]/60 p-5 transition-all duration-300 hover:border-slate-700 hover:bg-[#131927] hover:shadow-lg">
        <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4 overflow-hidden">

                <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6" />

                    </div>
                        
        <div className="overflow-hidden">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                 Email Address
                </p>
                <p className="mt-1 text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {loading ? 'Loading...' : user.email || 'N/A'}
                </p>
            </div>
        </div>

                {!loading && user.email && (
                    <button
                        onClick={handleCopyEmail}
                        aria-label="Copy email"
                        className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-slate-700 hover:text-white hover:border-slate-600 active:scale-95 shadow-sm"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 text-slate-400" />
                                <span className="hidden sm:inline">Copy Email</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>

    </div>


        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-[#0D111C]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-6 text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-emerald-400" />
                Session Architecture
            </h3>


    <div className="grid gap-4 sm:grid-cols-2">

        <div className="group rounded-2xl border border-slate-800 bg-[#131927]/60 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#131927]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20 text-emerald-400">
                        <Key className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm text-white">
                        JWT Security
                    </span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
                {profileError
                    ? 'Unable to verify your current session.'
                    : 'Your account is authenticated and your session is currently active.'}
            </p>
        </div>

    <div className="group rounded-2xl border border-slate-800 bg-[#131927]/60 p-5 transition-all duration-300 hover:border-violet-500/40 hover:bg-[#131927]">
        <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2.5">

                <div className="rounded-lg bg-violet-500/10 p-2 border border-violet-500/20 text-violet-400">
                    <Database className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-white">
                    Database Sync
                </span>
            </div>

            <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
            {profileError
                ? 'Unable to load profile data from the server.'
                : 'Your profile information is loaded securely from the server.'}
        </p>
    </div>

</div>
</div>

      </div>

        </div>

    </main>
</div>
)
}

export default Profile