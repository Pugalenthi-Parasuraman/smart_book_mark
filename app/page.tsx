'use client'

import { createClient } from '@/utils/supabase/client'
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

export default function HomePage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let channel: any = null;

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoading(false); return; }

        setUser(user);

        const { data, error } = await supabase
          .from("bookmarks").select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) console.error("❌ Fetch error:", error);
        else setBookmarks(data || []);

        setIsLoading(false);

        channel = supabase.channel("test-connection").subscribe((status) => {
          setRealtimeStatus(status);
          if (status === "SUBSCRIBED") {
            channel = supabase.channel("bookmarks-changes")
              .on("postgres_changes",
                { event: "*", schema: "public", table: "bookmarks", filter: `user_id=eq.${user.id}` },
                (payload: RealtimePostgresChangesPayload<Bookmark>) => {
                  if (payload.eventType === "INSERT") setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
                  else if (payload.eventType === "DELETE") setBookmarks((prev) => prev.filter((b) => b.id !== (payload.old as Bookmark).id));
                  else if (payload.eventType === "UPDATE") setBookmarks((prev) => prev.map((b) => b.id === (payload.new as Bookmark).id ? (payload.new as Bookmark) : b));
                })
              .subscribe((status) => setRealtimeStatus(status));
          }
        });
      } catch (error) {
        console.error("❌ Init error:", error);
        setIsLoading(false);
      }
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let formattedUrl = url.trim()
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) formattedUrl = 'https://' + formattedUrl
      const { error } = await supabase.from('bookmarks').insert([{ title: title.trim(), url: formattedUrl, user_id: user.id }])
      if (error) throw error
      setTitle(''); setUrl(''); setShowForm(false)
    } catch (error) {
      console.error('Error adding:', error)
      alert('Failed to add bookmark')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm('Delete this bookmark?')) return
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete bookmark')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F6FA' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#1E2A5A' }}></div>
          <p className="text-sm" style={{ color: '#6B7280' }}>Loading your library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F6FA' }}>

      {/* Nav */}
      <nav className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #1F2937' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-[5px]" style={{ backgroundColor: '#1E2A5A' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight" style={{ color: '#1E2A5A' }}>My Library</span>
                {realtimeStatus === 'SUBSCRIBED' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Live
                  </span>
                )}
                {realtimeStatus === 'CHANNEL_ERROR' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Error
                  </span>
                )}
                {(realtimeStatus === 'connecting' || realtimeStatus === 'TIMED_OUT') && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>Connecting
                  </span>
                )}
                {realtimeStatus === 'CLOSED' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full" style={{ color: '#6B7280' }}>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Offline
                  </span>
                )}
              </div>
              <p className="text-[11px]" style={{ color: '#6B7280' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[5px] transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#1E2A5A' }}>Bookmarks</h2>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {bookmarks.length === 0 ? 'No saved links yet' : `${bookmarks.length} saved link${bookmarks.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-[5px] active:scale-95 transition-all"
            style={{ backgroundColor: '#1E2A5A' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-[5px] p-5 mb-5" style={{ border: '1px solid #1F2937' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#1E2A5A' }}>New Bookmark</h3>
            <form onSubmit={handleAddBookmark} className="space-y-3">
              <div>
                <label htmlFor="title" className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>
                  Title
                </label>
                <input
                  type="text" id="title" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Website Name " required
                  className="w-full px-3.5 py-2.5 text-sm rounded-[5px] outline-none transition placeholder-gray-300 focus:ring-2"
                  style={{ backgroundColor: '#F4F6FA', border: '1px solid #1F2937', color: '#1E2A5A' }}
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>
                  URL
                </label>
                <input
                  type="url" id="url" value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://website.com" required
                  className="w-full px-3.5 py-2.5 text-sm rounded-[5px] outline-none transition placeholder-gray-300 focus:ring-2"
                  style={{ backgroundColor: '#F4F6FA', border: '1px solid #1F2937', color: '#1E2A5A' }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit" disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-[5px] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#1E2A5A' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Bookmark'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setTitle(''); setUrl('') }}
                  className="px-4 py-2.5 text-sm font-medium rounded-[5px] hover:bg-gray-100 transition-colors"
                  style={{ backgroundColor: '#F4F6FA', color: '#6B7280', border: '1px solid #1F2937' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty state */}
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-[5px] p-12 text-center" style={{ border: '1px solid #1F2937' }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[5px] mb-4" style={{ backgroundColor: '#F4F6FA' }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6B7280' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: '#1E2A5A' }}>Your library is empty</h3>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Save links you want to revisit later.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 text-white text-sm font-medium rounded-[5px] active:scale-95 transition-all"
              style={{ backgroundColor: '#1E2A5A' }}
            >
              Add Your First Bookmark
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-[5px] p-4 transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #1F2937' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-[5px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#F4F6FA', border: '1px solid #1F2937' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6B7280' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate leading-snug" style={{ color: '#1E2A5A' }}>
                        {bookmark.title}
                      </h3>
                      <a
                        href={bookmark.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs truncate block mt-0.5 transition-colors hover:underline"
                        style={{ color: '#6B7280' }}
                      >
                        {bookmark.url}
                      </a>
                      <p className="text-[11px] mt-1.5" style={{ color: '#6B7280', opacity: 0.6 }}>
                        {new Date(bookmark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a
                      href={bookmark.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-[5px] transition-colors hover:bg-gray-100"
                      style={{ color: '#6B7280' }} title="Open"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-[5px] transition-colors hover:bg-red-50 hover:text-red-500"
                      style={{ color: '#6B7280' }} title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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