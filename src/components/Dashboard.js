import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const OUTCOME_CONFIG = {
  'Clear':     { bg: '#E6F2EC', text: '#1A5C35', dot: '#2D8A52' },
  'Caution':   { bg: '#FDF4E0', text: '#7A5200', dot: '#B8870A' },
  'Risk':      { bg: '#FDEEE9', text: '#8B2A16', dot: '#C94125' },
  'High Risk': { bg: '#F5E9E9', text: '#6B1A1A', dot: '#8B2A16' },
}

export default function Dashboard({ user, onAddBusiness, onViewBusiness, onSignOut }) {
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBusinesses() }, [])

  async function fetchBusinesses() {
    setLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('*, experiences(id, outcome, total_score, created_at)')
      .order('name', { ascending: true })
    setBusinesses(data || [])
    setLoading(false)
  }

  function getLatest(biz) {
    if (!biz.experiences?.length) return null
    return [...biz.experiences].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  }

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.state.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>The <span style={s.green}>Verdict</span></h1>
          <p style={s.tagline}>The Business Reputation Index</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.email}>{user.email}</span>
          <button style={s.signOut} onClick={onSignOut}>Sign out</button>
        </div>
      </header>
      <main style={s.main}>
        <div style={s.topBar}>
          <h2 style={s.pageTitle}>Businesses</h2>
          <button style={s.addBtn} onClick={onAddBusiness}>+ Add Business</button>
        </div>
        <input style={s.searchInput} type="text" placeholder="Search by name, city, state, or category..." value={search} onChange={e => setSearch(e.target.value)} />
        {loading ? (
          <p style={s.empty}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyTitle}>{search ? 'No businesses found' : 'No businesses yet'}</p>
            <p style={s.emptyText}>{search ? 'Try a different search.' : 'Be the first to add a business.'}</p>
            {!search && <button style={s.addBtn} onClick={onAddBusiness}>Add First Business</button>}
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(biz => {
              const latest = getLatest(biz)
              const oc = latest ? OUTCOME_CONFIG[latest.outcome] : null
              const count = biz.experiences?.length || 0
              return (
                <div key={biz.id} style={s.card} onClick={() => onViewBusiness(biz)}>
                  <div style={s.cardTop}>
                    <div style={s.cardLeft}>
                      <div style={s.bizName}>{biz.name}</div>
                      <div style={s.bizMeta}>{biz.category} • {biz.city}, {biz.state}</div>
                      <div style={s.bizType}>{biz.service_type === 'home' ? '🏠 Home Service' : '💇 Personal Service'}</div>
                    </div>
                    {latest && oc ? (
                      <div style={{ ...s.badge, background: oc.bg, color: oc.text }}>
                        <span style={{ ...s.dot, background: oc.dot }} />
                        {latest.outcome}
                      </div>
                    ) : (
                      <div style={s.noBadge}>No evaluations yet</div>
                    )}
                  </div>
                  <div style={s.cardBottom}>
                    <span style={s.count}>{count} evaluation{count !== 1 ? 's' : ''}</span>
                    {latest && <span style={s.score}>Score: {latest.total_score}/100</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', background: '#F9F8F5' },
  header: { background: '#fff', borderBottom: '1px solid #E2E0DA', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, margin: 0 },
  green: { color: '#1A3A2A' },
  tagline: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#6B6B6B', margin: '4px 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  email: { fontSize: 13, color: '#6B6B6B' },
  signOut: { background: 'transparent', border: '1px solid #E2E0DA', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#0E0E0E', fontFamily: 'inherit' },
  main: { maxWidth: 960, margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, margin: 0 },
  addBtn: { background: '#1A3A2A', color: '#E8C84A', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  searchInput: { width: '100%', height: 48, border: '1.5px solid #E2E0DA', borderRadius: 12, padding: '0 16px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', marginBottom: 24, color: '#0E0E0E' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #E2E0DA', borderRadius: 14, padding: 20, cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  cardLeft: { flex: 1, minWidth: 0 },
  bizName: { fontSize: 16, fontWeight: 500, color: '#0E0E0E', marginBottom: 3 },
  bizMeta: { fontSize: 12, color: '#6B6B6B', marginBottom: 2 },
  bizType: { fontSize: 11, color: '#6B6B6B' },
  badge: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap' },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  noBadge: { fontSize: 11, color: '#6B6B6B', fontStyle: 'italic', flexShrink: 0 },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: 12, color: '#6B6B6B' },
  score: { fontSize: 12, color: '#6B6B6B' },
  empty: { color: '#6B6B6B', textAlign: 'center', padding: '40px 0' },
  emptyState: { textAlign: 'center', padding: '60px 20px' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, margin: '0 0 8px' },
  emptyText: { color: '#6B6B6B', fontSize: 14, margin: '0 0 24px' },
}
