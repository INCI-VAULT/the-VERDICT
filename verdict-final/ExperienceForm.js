const OUTCOME_CONFIG = {
  'Clear':     { bg: '#E6F2EC', border: '#2D8A52', color: '#1A5C35', icon: '🟢' },
  'Caution':   { bg: '#FDF4E0', border: '#B8870A', color: '#7A5200', icon: '🟡' },
  'Risk':      { bg: '#FDEEE9', border: '#C94125', color: '#8B2A16', icon: '🟠' },
  'High Risk': { bg: '#F5E9E9', border: '#8B2A16', color: '#6B1A1A', icon: '🔴' },
}

export default function OutcomeResult({ outcome, score, keyPoints, experienceCount, onDone, onAnother }) {
  const c = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG['Caution']
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ ...s.outcomeBox, background: c.bg, border: `2px solid ${c.border}` }}>
          <div style={s.icon}>{c.icon}</div>
          <h2 style={{ ...s.outcomeLabel, color: c.color }}>{outcome}</h2>
        </div>

        {keyPoints?.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionTitle}>What This Is Based On</div>
            <div style={s.points}>
              {keyPoints.map((pt, i) => (
                <div key={i} style={s.point}>
                  <span style={s.bullet}>—</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={s.meta}>
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Supporting Score</span>
            <span style={s.metaValue}>{score}<span style={s.metaSub}>/100</span></span>
          </div>
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Total Evaluations</span>
            <span style={s.metaValue}>{experienceCount || 1}</span>
          </div>
        </div>

        <p style={s.note}>This outcome reflects what was reported. The final decision is yours.</p>

        <div style={s.actions}>
          <button style={s.anotherBtn} onClick={onAnother}>Submit Another Evaluation</button>
          <button style={s.doneBtn} onClick={onDone}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  page:       { minHeight: '100vh', background: '#F9F8F5', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:       { width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, border: '1px solid #E2E0DA', padding: 40 },
  outcomeBox: { borderRadius: 14, padding: '28px 24px', marginBottom: 28, textAlign: 'center' },
  icon:       { fontSize: 32, marginBottom: 10 },
  outcomeLabel:{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 600, margin: 0 },
  section:    { marginBottom: 24 },
  sectionTitle:{ fontSize: 10, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 12 },
  points:     { display: 'flex', flexDirection: 'column', gap: 10 },
  point:      { display: 'flex', gap: 10, fontSize: 14, color: '#0E0E0E', lineHeight: 1.5 },
  bullet:     { color: '#6B6B6B', flexShrink: 0 },
  meta:       { display: 'flex', gap: 16, padding: '16px 0', borderTop: '1px solid #E2E0DA', borderBottom: '1px solid #E2E0DA', marginBottom: 20 },
  metaItem:   { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
  metaLabel:  { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#6B6B6B' },
  metaValue:  { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: '#0E0E0E' },
  metaSub:    { fontSize: 14, color: '#6B6B6B', fontFamily: 'inherit' },
  note:       { fontSize: 12, color: '#6B6B6B', lineHeight: 1.6, margin: '0 0 24px', fontStyle: 'italic', textAlign: 'center' },
  actions:    { display: 'flex', flexDirection: 'column', gap: 10 },
  doneBtn:    { height: 50, background: '#1A3A2A', color: '#E8C84A', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  anotherBtn: { height: 50, background: 'transparent', color: '#0E0E0E', border: '1.5px solid #E2E0DA', borderRadius: 10, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' },
}
