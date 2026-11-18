import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

type Profile = { id: string; name: string; age: number; photo: string; bio: string; location: string; interests: string[] }
type SwipeAction = 'like' | 'pass'

const api = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error((await response.json()).error || 'Something went wrong')
  return response.status === 204 ? (undefined as T) : response.json()
}

function App() {
  const [tab, setTab] = useState<'home' | 'discover' | 'matches'>('discover')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [matches, setMatches] = useState<Profile[]>([])
  const [activeMatch, setActiveMatch] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [feed, mutualMatches] = await Promise.all([api<Profile[]>('/feed'), api<Profile[]>('/matches')])
      setProfiles(feed); setMatches(mutualMatches); setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load profiles')
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  const swipe = async (action: SwipeAction) => {
    const profile = profiles[0]
    if (!profile) return
    try {
      const result = await api<{ match: boolean; profile: Profile | null }>('/swipe', { method: 'POST', body: JSON.stringify({ profileId: profile.id, action }) })
      setProfiles((current) => current.slice(1)); setDragX(0)
      if (result.match && result.profile) { setMatches((current) => [result.profile!, ...current]); setActiveMatch(result.profile) }
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to record swipe') }
  }
  const handlePointerDown = (event: React.PointerEvent) => { if (!profiles[0]) return; startX.current = event.clientX; setIsDragging(true); event.currentTarget.setPointerCapture(event.pointerId) }
  const handlePointerMove = (event: React.PointerEvent) => { if (isDragging) setDragX(event.clientX - startX.current) }
  const handlePointerUp = async () => { if (!isDragging) return; setIsDragging(false); if (Math.abs(dragX) > 90) await swipe(dragX > 0 ? 'like' : 'pass'); else setDragX(0) }
  const reset = async () => { await api('/reset', { method: 'POST' }); setActiveMatch(null); await load() }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">c</span><span>coy</span></div><button className="avatar" aria-label="Profile menu">PS</button></header>
    <main>
      {tab === 'home' && <section className="home-placeholder"><span className="eyebrow">YOUR SPACE</span><h1>Home is where<br /><em>your people are.</em></h1><p>Your Coy home will live here. Head to Discover when you are ready to meet someone new.</p><button className="primary-button" onClick={() => setTab('discover')}>Explore Discover</button></section>}
      {tab === 'discover' && <section className="discover">
        <div className="section-heading"><div><span className="eyebrow">MEET SOMEONE NEW</span><h1>Discover</h1></div><button className="reset-button" onClick={reset}>Reset demo</button></div><p className="intro">A little serendipity, one profile at a time.</p>
        {error && <div className="error">{error}</div>}
        {loading ? <div className="loading">Finding your people<span>...</span></div> : profiles.length === 0 ? <div className="empty-state"><div className="empty-icon">✦</div><h2>You’re all caught up</h2><p>You’ve seen everyone in your area. Come back soon for more discoveries.</p><button className="primary-button" onClick={reset}>Start over</button></div> : <div className="swipe-stage">
          <div className="card-stack">{profiles[1] && <article className="profile-card behind"><img src={profiles[1].photo} alt="" /><div className="card-gradient" /></article>}
            <article className={`profile-card current ${isDragging ? 'dragging' : ''}`} style={{ transform: `translateX(${dragX}px) rotate(${dragX / 14}deg)` }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
              <img src={profiles[0].photo} alt={`${profiles[0].name} profile`} /><div className="card-gradient" /><div className="swipe-label like-label" style={{ opacity: Math.min(Math.max(dragX / 100, 0), 1) }}>LIKE</div><div className="swipe-label pass-label" style={{ opacity: Math.min(Math.max(-dragX / 100, 0), 1) }}>PASS</div>
              <div className="profile-details"><div className="profile-name"><h2>{profiles[0].name}, {profiles[0].age}</h2><span className="verified">✓</span></div><p className="location">⌖ {profiles[0].location}</p><p className="bio">{profiles[0].bio}</p><div className="chips">{profiles[0].interests.map((interest) => <span key={interest}>{interest}</span>)}</div></div>
            </article>
          </div><p className="swipe-hint">Drag the card, or choose an action</p><div className="action-row"><button className="action-button pass" onClick={() => swipe('pass')} aria-label="Pass profile">×</button><button className="action-button like" onClick={() => swipe('like')} aria-label="Like profile">♥</button></div>
        </div>}
      </section>}
      {tab === 'matches' && <section className="matches-view"><span className="eyebrow">THE GOOD PART</span><h1>Your matches</h1><p className="intro">Only mutual connections appear here.</p>{matches.length === 0 ? <div className="empty-state small"><div className="empty-icon">♡</div><h2>No matches yet</h2><p>Keep discovering. When you both like each other, you’ll find them here.</p></div> : <div className="match-grid">{matches.map((match) => <button className="match-tile" key={match.id} onClick={() => setActiveMatch(match)}><img src={match.photo} alt="" /><span>{match.name}</span><small>{match.location}</small></button>)}</div>}</section>}
    </main>
    <nav className="tabbar" aria-label="Main navigation"><button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><span>⌂</span>Home</button><button className={tab === 'discover' ? 'active' : ''} onClick={() => setTab('discover')}><span>✦</span>Discover</button><button className={tab === 'matches' ? 'active' : ''} onClick={() => setTab('matches')}><span>♡</span>Matches{matches.length > 0 && <b>{matches.length}</b>}</button></nav>
    {activeMatch && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="match-modal"><button className="close" onClick={() => setActiveMatch(null)} aria-label="Close">×</button><span className="match-sparkle">✦</span><p className="eyebrow">IT’S A MATCH</p><h2>You and {activeMatch.name}<br /><em>like each other.</em></h2><img src={activeMatch.photo} alt="" /><p className="match-copy">The best conversations start with a hello.</p><button className="primary-button" onClick={() => setActiveMatch(null)}>Keep discovering</button></div></div>}
  </div>
}

export default App
