import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Save, FileEdit, Sparkles, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

import RichTextEditor from '../components/RichTextEditor'

const EditNote = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

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

      await api.patch(`/notes/${id}`, { title, content })
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-950/20">
                <FileEdit className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Edit Workspace Note
              </h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#121826] p-16 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
            <p className="text-sm text-slate-400">
              Fetching note details from server...
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#121826] p-16 shadow-xl text-center">
            <FileEdit className="h-10 w-10 text-red-400 mb-4" />

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
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-all">
                Retry
              </button>

              <Link
                to="/dashboard"
                className="rounded-xl border border-slate-700/80 bg-[#1A2234] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">


            <div className="rounded-2xl border border-slate-800/80 bg-[#121826] p-6 sm:p-8 shadow-xl shadow-black/40">

              <div className="mb-6">
                <label htmlFor='title' className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Note Title
                </label>
                <input id='title'
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full rounded-xl bg-[#1A2234] border border-slate-700/60 px-4 py-3 text-base text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor='content' className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Content Body
                </label>
                <RichTextEditor
                 id="content"
                  value={content}
                    ariaLabel="Note Content"
                  onChange={setContent}
                />

              </div>



              <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-6">
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-slate-700/80 bg-[#1A2234] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                >
                  Cancel
                </Link>


                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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