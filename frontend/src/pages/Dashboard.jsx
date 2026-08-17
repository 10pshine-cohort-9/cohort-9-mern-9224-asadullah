import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Edit3, Trash2, Search, FileText, Calendar, Plus, Sparkles, FolderOpen, Filter, X, RotateCcw } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import JsonExportImport from '../components/JsonExportImport'

const Dashboard = () => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')


   const stripHtml = (htmlString) => {
    if (!htmlString || typeof htmlString !== 'string') return ''

    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return (doc.body.textContent || '').trim()
  }

  const fetchNotes = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Session expired. Please login again.')
      navigate('/login', { replace: true })
      return
    }

    try {
      const response = await api.get('/notes')
      const data = Array.isArray(response.data) ? response.data : response.data?.notes || []
      setNotes(data)
    } catch (error) {
      console.error('Fetch notes error:', error.response?.data || error)
      toast.error(error.response?.data?.message || 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return

    try {
      await api.delete(`/notes/${noteId}`)
      setNotes((prev) => prev.filter((n) => n._id !== noteId))
      toast.success('Note deleted successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete note')
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
  }

  const isFilterActive = searchQuery !== '' || sortBy !== 'newest'

  const filteredNotes = notes
    .filter((note) => {
      const query = searchQuery.trim().toLowerCase()
      const title = note.title?.toLowerCase() || ''
      const content = stripHtml(note.content).toLowerCase()

      return title.includes(query) || content.includes(query)
    })

    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      }
      if (sortBy === 'a-z') {
        return (a.title || '').localeCompare(b.title || '')
      }
      if (sortBy === 'z-a') {
        return (b.title || '').localeCompare(a.title || '')
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Workspace Overview
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Note Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage, organize, and structure your daily notes and logs.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#111622] p-3 border border-slate-800 shadow-lg shadow-black/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div className="pr-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Notes</p>
              <p className="text-xl font-bold text-white">{notes.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

          <div className="flex flex-wrap items-center gap-3 flex-1">

            <div className="relative flex-1 min-w-60 sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                 aria-label="Search notes by title or content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title or content..."
                className="w-full rounded-xl bg-[#161C2A] border border-slate-800 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-44">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                aria-label="Sort notes"
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl bg-[#161C2A] border border-slate-800 pl-9 pr-4 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all cursor-pointer appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Title (A-Z)</option>
                <option value="z-a">Title (Z-A)</option>
              </select>
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium whitespace-nowrap transition-all"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center">
            <JsonExportImport
              notes={notes}
              setNotes={setNotes}
            />
          </div>

        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-[#111622] border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#111622] p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">
              {searchQuery ? 'No matching notes found' : 'No notes created yet'}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {searchQuery ? 'Try adjusting your search query or reset filter.' : 'Get started by creating your first note.'}
            </p>
            {isFilterActive ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Filter & Search
              </button>
            ) : (
              <Link
                to="/notes/create"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-all"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Create First Note
              </Link>
            )}
          </div>
        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#111622] p-6 shadow-sm hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-950/20 transition-all duration-200"
              >
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
                    {note.title}
                  </h3>

                  <div
                    className="mt-3 text-sm text-slate-400 line-clamp-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(note.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/notes/edit/${note._id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-violet-400 transition-all"
                      title="Edit Note"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteNote(note._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard