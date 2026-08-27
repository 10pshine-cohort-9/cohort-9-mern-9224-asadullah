import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, PlusCircle, Sparkles, Loader2, Tag } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import RichTextEditor from '../components/RichTextEditor'

const CreateNote = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)

  
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

      await api.post('/notes', payload)
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
                <PlusCircle className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Create New Workspace Note
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 self-start sm:self-auto shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Workspace Editor
          </div>
        </div>

        
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
                  Category (Optional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-[#131A2E] border border-slate-800/90 pl-10 pr-8 py-3 text-sm font-semibold text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none shadow-inner"
                  >
                    <option value="">Select Category</option>
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