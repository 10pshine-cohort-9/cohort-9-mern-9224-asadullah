import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Edit3, Search, FileText, Calendar, Plus, Sparkles,
  FolderOpen, Filter, X, RotateCcw, Pin, Archive, Trash2, Tag, FolderPlus
} from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import JsonExportImport from '../components/JsonExportImport'

const Dashboard = () => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dashboard_active_tab') || 'active'
  })

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    localStorage.setItem('dashboard_active_tab', tab)
  }

  const stripHtml = (htmlString) => {
    if (!htmlString || typeof htmlString !== 'string') return ''
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return (doc.body.textContent || '').trim()
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data?.categories || response.data || [])
    } catch (err) {
      console.error('Fetch categories error:', err)
    }
  }

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeTab === 'archived') {
        params.set('isArchived', 'true');
      } else if (activeTab === 'trashed') {
        params.set('isTrashed', 'true');
      } else {
        params.set('isArchived', 'false');
        params.set('isTrashed', 'false');
      }

      if (selectedCategory) {
        params.set('category', selectedCategory);
      }

      const response = await api.get(`/notes?${params.toString()}`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchNotes();
  }, [activeTab, selectedCategory]);



  const handleResetFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
    setSelectedCategory('')
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    try {
      await api.post('/categories', { name: newCatName })
      toast.success('Category created')
      setNewCatName('')
      setShowCatModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category')
    }
  }


  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${categoryId}`)

      if (selectedCategory === categoryId) {
        setSelectedCategory('');
      }

      
      toast.success('Category deleted')
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  }

  const toggleStatus = async (noteId, statusData) => {
    try {
      await api.patch(`/notes/${noteId}/status`, statusData)
      toast.success('Status updated')
      fetchNotes()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to permanently delete this note?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prevNotes) => prevNotes.filter((n) => n._id !== noteId));
      toast.success("Note permanently deleted!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  }

  const isFilterActive = searchQuery !== '' || sortBy !== 'newest' || selectedCategory !== ''

  const filteredNotes = notes
    .filter((note) => {
      const query = searchQuery.trim().toLowerCase()
      const title = note.title?.toLowerCase() || ''
      const content = stripHtml(note.content).toLowerCase()

      return title.includes(query) || content.includes(query)
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      if (sortBy === 'a-z') return (a.title || '').localeCompare(b.title || '')
      if (sortBy === 'z-a') return (b.title || '').localeCompare(a.title || '')
      return 0
    })

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">


        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-indigo-900/30 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Workspace Overview
            </div>
            <h1 className="text-3xl font-black bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              Note Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              Manage, search, and organize all your daily notes and workspace items.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center rounded-xl bg-[#0F1524] p-1.5 border border-slate-800 shadow-inner">
              {['active', 'archived', 'trashed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${activeTab === tab
                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                >
                  {tab === 'active' ? 'Notes' : tab}
                </button>
              ))}
            </div>


            <div className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-[#0F1524] px-4 py-2.5 text-sm font-medium text-slate-300 shadow-md">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total:</span>
              <span className="font-extrabold text-indigo-300">{notes.length}</span>
            </div>
          </div>
        </div>


       
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                aria-label="Search notes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title or content..."
                className="w-full rounded-xl bg-[#0F1524] border border-slate-800/90 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Single Row Action Controls (Export/Import + Category Button) */}
            <div className="w-full md:w-auto flex items-center justify-end gap-2.5 shrink-0">
              <JsonExportImport notes={notes} setNotes={setNotes} categories={categories} />
              <button
                type="button"
                onClick={() => setShowCatModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white px-3.5 py-2 text-xs font-bold text-indigo-300 transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                <FolderPlus className="h-4 w-4" />
                <span>+ Category</span>
              </button>
            </div>
          </div>

          {/* Category Dropdown & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C101D] p-3 rounded-2xl border border-slate-800/80 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-40">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl bg-[#131A2E] border border-slate-800 pl-9 pr-8 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none font-medium"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-37.5">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
                <select
                  value={sortBy}
                  aria-label="Sort notes"
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl bg-[#131A2E] border border-slate-800 pl-9 pr-8 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none font-medium"
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700/50"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>


        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-[#0F1524] border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-900/30 bg-[#0C101D] p-12 text-center shadow-inner">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {searchQuery ? 'No notes matched your query' : `No ${activeTab} notes found`}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {searchQuery ? 'Try adjusting your search keywords.' : 'Create a new note to start filling up your workspace!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-linear-to-b from-[#0F1525] to-[#0A0E1A] p-6 transition-all duration-300 hover:-translate-y-1 ${note.isPinned
                  ? 'border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-xl shadow-indigo-950/40'
                  : 'border-slate-800/90 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-950/20'
                  }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                      {note.title}
                    </h3>
                    {note.category && (
                      <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        {note.category.name}
                      </span>
                    )}
                  </div>

                  <div
                    className="mt-3 text-xs text-slate-300/80 line-clamp-4 leading-relaxed font-normal"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                    onClick={(e) => {
                      if (e.target.tagName === 'A') {
                        e.preventDefault();
                        window.open(e.target.href, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  />

                </div>


                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    {new Date(note.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    {activeTab === 'active' && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleStatus(note._id, { isPinned: !note.isPinned })}
                          className={`rounded-lg p-2 transition-all ${note.isPinned
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-300'
                            }`}
                          title={note.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStatus(note._id, { isArchived: true })}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-all"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/notes/edit/${note._id}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-all"
                          title="Edit Note"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </>
                    )}

                    {activeTab === 'archived' && (
                      <button
                        type="button"
                        onClick={() => toggleStatus(note._id, { isArchived: false })}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-all"
                        title="Unarchive"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}

                    {activeTab === 'trashed' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleStatus(note._id, { isTrashed: false })}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-all"
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note._id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                          title="Delete Permanently"
                        >
                          <Trash2 className="h-4 w-4 text-rose-400" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleStatus(note._id, { isTrashed: true })}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

   
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0F1524] border border-indigo-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Manage Categories</h3>
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

        
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-xl bg-[#131A2E] border border-slate-800 px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all whitespace-nowrap"
                >
                  Add
                </button>
              </form>

          
              <div className="max-h-48 overflow-y-auto space-y-2 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Existing Categories:</p>
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-500">No categories added yet.</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between bg-[#131A2E] px-3 py-2 rounded-lg border border-slate-800/60"
                    >
                      <span className="text-xs text-slate-200 font-medium">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}



      </main>
    </div>
  )
}

export default Dashboard