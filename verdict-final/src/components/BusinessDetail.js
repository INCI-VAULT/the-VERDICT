import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const OUTCOME_CONFIG = {
  'Clear':     { bg: '#E6F2EC', text: '#1A5C35', dot: '#2D8A52' },
  'Caution':   { bg: '#FDF4E0', text: '#7A5200', dot: '#B8870A' },
  'Risk':      { bg: '#FDEEE9', text: '#8B2A16', dot: '#C94125' },
  'High Risk': { bg: '#F5E9E9', text: '#6B1A1A', dot: '#8B2A16' },
}

export default function BusinessDetail({ user, business, onBack, onEvaluate }) {
  const [experiences, setExperiences] = useState([])
  const [expanded, setExpanded]       = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => { fetchExperiences() }, [])

  async function fetchExperiences() {
    setLoading(true)
    const { data } = await supabase
      .from('experiences')
      .select('*, experience_responses(*)')
      .eq('business_id', business.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setExperiences(data || [])
    setLoading(false)
  }

  async function deleteBusiness() {
    if (!window.confirm(`Delete "${business.name}"? This cannot be undone.`)) return
    await supabase.from('businesses').delete().eq('id', business.id)
    onBack()
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <button style={s.back} onClick={onBack}>← Back to Dashboard</button>

        <div style={s.header}>
          <div>
            <h2 style={s.bizName}>{business.name}</h2>
            <p style={s.bizCat}>{business.category} • {business.service_type === 'home' ? '🏠 Home Services' : '💇 Personal Services'}</p>
            {business.notes && <p style={s.notes}>{business.notes}</p>}
          </div>
          <div style={s.headerBtns}>
            <button style={s.evalBtn} onClick={onEvaluate}>+ New Evaluation</button>
            <button style={s.deleteBtn} onClick={deleteBusiness}>Delete</button>
          </div>
        </div>

        <h3 style={s.sectionTitle}>Evaluation History</h3>

        {loading ? <p style={s.empty}>Loading…</p>
        : experiences.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyTitle}>No evaluations yet</p>
            <p style={s.emptyText}>Submit an evaluation to generate an outcome.</p>
            <button style={s.evalBtn} onClick={onEvaluate}>Submit First Evaluation</button>
          </div>
        ) : (
          <div style={s.list}>
            {experiences.map(exp => {
              const oc     = OUTCOME_CONFIG[exp.outcome] || OUTCOME_CONFIG['Caution']
              const isOpen = expanded === exp.id
              return (
                <div key={exp.id} style={s.expCard}>
                  <div style={s.expHeader} onClick={() => setExpanded(isOpen ? null : exp.id)}>
                    <div style={s.expLeft}>
                      <div style={{ ...s.badge, background: oc.bg, color: oc.text }}>
                        <span style={{ ...s.dot, background: oc.dot }} />
                        {exp.outcome}
                      </div>
                      <span style={s.expDate}>{new Date(exp.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={s.expRight}>
                      <span style={s.expScore}>Score: {exp.total_score}/100</span>
                      <span style={s.chevron}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={s.expBody}>
                      {/* Key Points */}
                      {exp.key_points?.length > 0 && (
                        <div style={s.keyPoints}>
                          <div style={s.kpTitle}>Key Points</div>
                          {exp.key_points.map((pt, i) => (
                            <div key={i} style={s.kpRow}>
                              <span style={s.kpBullet}>—</span>
                              <span style={s.kpText}>{pt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Responses */}
                      {exp.experience_responses?.length > 0 && (
                        <div style={s.responses}>
                          <div style={s.kpTitle}>Full Responses</div>
                          {exp.experience_responses.map(r => {
                            const sigColor = r.signal_type === 'positive' ? '#2D8A52' : r.signal_type === 'critical_risk' ? '#C94125' : r.signal_type === 'risk' ? '#B8870A' : '#6B6B6B'
                            return (
                              <div key={r.id} style={s.respRow}>
                                <span style={s.respQ}>{r.question_key.replace(/_/g, ' ')}</span>
                                <div style={s.respRight}>
                                  <span style={s.respA}>{r.answer_label}</span>
                                  <span style={{ ...s.respSig, color: sigColor }}>{r.signal_type.replace('_', ' ')}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:       { minHeight: '100vh', background: '#F9F8F5', padding: '32px 20px' },
  inner:      { maxWidth: 720, margin: '0 auto' },
  back:       { background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 24, fontFamily: 'inherit' },
  header:     { background: '#fff', borderRadius: 14, border: '1px solid #E2E0DA', padding: 28, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  bizName:    { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, margin: '0 0 4px' },
  bizCat:     { fontSize: 13, color: '#6B6B6B', margin: '0 0 8px' },
  notes:      { fontSize: 13, color: '#6B6B6B', margin: 0, fontStyle: 'italic' },
  headerBtns: { display: 'flex', gap: 10, flexShrink: 0 },
  evalBtn:    { background: '#1A3A2A', color: '#E8C84A', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  deleteBtn:  { background: 'transparent', border: '1px solid #E2E0DA', borderRadius: 10, padding: '10px 18px', fontSize: 13, color: '#C94125', cursor: 'pointer', fontFamily: 'inherit' },
  sectionTitle:{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, margin: '0 0 16px' },
  empty:      { color: '#6B6B6B', padding: '20px 0' },
  emptyState: { background: '#fff', borderRadius: 14, border: '1px solid #E2E0DA', padding: 40, textAlign: 'center' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, margin: '0 0 8px' },
  emptyText:  { color: '#6B6B6B', fontSize: 14, margin: '0 0 20px' },
  list:       { display: 'flex', flexDirection: 'column', gap: 12 },
  expCard:    { background: '#fff', borderRadius: 12, border: '1px solid #E2E0DA', overflow: 'hidden' },
  expHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' },
  expLeft:    { display: 'flex', alignItems: 'center', gap: 12 },
  expRight:   { display: 'flex', alignItems: 'center', gap: 12 },
  badge:      { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  dot:        { width: 6, height: 6, borderRadius: '50%' },
  expDate:    { fontSize: 12, color: '#6B6B6B' },
  expScore:   { fontSize: 12, color: '#6B6B6B' },
  chevron:    { fontSize: 10, color: '#6B6B6B' },
  expBody:    { borderTop: '1px solid #F0EDE8', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 },
  keyPoints:  { display: 'flex', flexDirection: 'column', gap: 8 },
  kpTitle:    { fontSize: 10, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 4 },
  kpRow:      { display: 'flex', gap: 8, fontSize: 13, color: '#0E0E0E', lineHeight: 1.5 },
  kpBullet:   { color: '#6B6B6B', flexShrink: 0 },
  kpText:     { flex: 1 },
  responses:  { display: 'flex', flexDirection: 'column', gap: 8 },
  respRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid #F8F6F3' },
  respQ:      { fontSize: 12, color: '#6B6B6B', flex: 1, textTransform: 'capitalize' },
  respRight:  { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  respA:      { fontSize: 12, color: '#0E0E0E' },
  respSig:    { fontSize: 11, fontWeight: 500, textTransform: 'capitalize' },
}
