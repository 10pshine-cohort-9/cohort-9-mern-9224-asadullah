import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Save, FileEdit, Sparkles, Loader2, Tag } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import RichTextEditor from '../components/RichTextEditor'

const EditNote = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        setCategories(response.data?.categories || response.data || [])
      } catch (err) {
        console.error('Fetch categories error:', err)
      }
    }
    fetchCategories()
  }, [])

  const fetchNoteDetails = useCallback(
    async (signal) => {
      if (!id || id === 'all') {
        toast.error('Invalid Note ID')
        navigate('/dashboard', { replace: true })
        return
      }

      try {
        const response = await api.get(`/notes/${id}`, { signal })
        const note = response.data?.note || response.data

        if (signal.aborted) return

        setTitle(note.title || '')
        setContent(note.content || '')
        setCategory(note.category?._id || note.category || '')
        setLoadError(false)
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return
        }

        console.error('Fetch note error:', error.response?.data || error)
        setLoadError(true)
        toast.error(
          error.response?.data?.message || 'Failed to load note details'
        )
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    },
    [id, navigate]
  )

  useEffect(() => {
    const controller = new AbortController()

    setTitle('')
    setContent('')
    setCategory('')
    setLoadError(false)
    setLoading(true)

    fetchNoteDetails(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchNoteDetails, retryKey])

  const getPlainText = (html) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent.trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !getPlainText(content)) {
      toast.error('Please fill in both title and content')
      return
    }

    setSubmitting(true)

    try {
      const payload = { title, content }
      if (category) payload.category = category

      await api.patch(`/notes/${id}`, payload)
      toast.success('Note updated successfully')
      navigate('/dashboard')
    } catch (error) {
      console.error('Update note error:', error.response?.data || error)
      toast.error(error.response?.data?.message || 'Failed to update note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        
     
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-900/30 pb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors mb-3 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md shadow-indigo-950/20">
                <FileEdit className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Edit Workspace Note
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 self-start sm:self-auto shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Workspace Editor
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-[#0F1525] p-16 shadow-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
            <p className="text-sm font-medium text-slate-400">
              Fetching note details from server...
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-900/30 bg-[#0F1525] p-16 shadow-2xl text-center">
            <FileEdit className="h-10 w-10 text-rose-400 mb-4" />

            <h2 className="text-xl font-bold text-white mb-2">
              Failed to Load Note
            </h2>

            <p className="text-sm text-slate-400 mb-6">
              We couldn't load this note. Please try again or return to the dashboard.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRetryKey((prev) => prev + 1)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-indigo-950/50"
              >
                Retry
              </button>

              <Link
                to="/dashboard"
                className="rounded-xl border border-slate-800 bg-[#131A2E] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-800/90 bg-linear-to-b from-[#0F1525] to-[#0A0E1A] p-6 sm:p-8 shadow-2xl shadow-indigo-950/20">

              <div className="grid gap-6 sm:grid-cols-3 mb-6">
                
               
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Note Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full rounded-xl bg-[#131A2E] border border-slate-800/90 px-4 py-3 text-base font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                    required
                  />
                </div>

             
                <div>
                  <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-[#131A2E] border border-slate-800/90 pl-10 pr-8 py-3 text-sm font-semibold text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none shadow-inner"
                    >
                      <option value="">No Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              <div className="mb-6">
                <label htmlFor="content" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Content Body <span className="text-rose-400">*</span>
                </label>
                <div className="rounded-xl border border-slate-800/90 bg-[#131A2E] overflow-hidden focus-within:border-indigo-500 transition-all">
                  <RichTextEditor
                    id="content"
                    value={content}
                    ariaLabel="Note Content"
                    onChange={setContent}
                  />
                </div>
              </div>

         
              <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-6">
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-slate-800 bg-[#131A2E] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        )}
      </main>
    </div>
  )
}

export default EditNote