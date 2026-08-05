import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, PlusCircle, Sparkles, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import RichTextEditor from '../components/RichTextEditor'

const CreateNote = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)





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
      await api.post('/notes', { title, content })
      toast.success('Note created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Create note error:', error.response?.data || error)
      toast.error(error.response?.data?.message || 'Failed to create note')
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
                <PlusCircle className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create New Workspace Note
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 self-start sm:self-auto">
            <Sparkles className="h-3.5 w-3.5" /> 10P Workspace Engine
          </div>
        </div>


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
                placeholder="Enter note title..."
                className="w-full rounded-xl bg-[#1A2234] border border-slate-700/60 px-4 py-3 text-base text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor='content' className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Content Body
              </label>
              <RichTextEditor
                value={content}
                ariaLabel="Note Content"
                onChange={setContent} />
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Note</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CreateNote