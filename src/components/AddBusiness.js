import { useState } from 'react'
import { supabase, HOME_CATEGORIES, PERSONAL_CATEGORIES, US_STATES } from '../lib/supabase'

export default function AddBusiness({ user, onBack, onSaved }) {
  const [serviceType, setServiceType] = useState('')
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = serviceType === 'home' ? HOME_CATEGORIES : serviceType === 'personal' ? PERSONAL_CATEGORIES : []

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !serviceType || !category || !city.trim() || !state) {
      setError('All fields are required.'); return
    }
    setError(''); setLoading(true)
    try {
      const { error } = await supabase.from('businesses').insert({
        user_id: user.id, name: name.trim(),
        service_type: serviceType, category,
        city: city.trim(), state,
        notes: notes.trim() || null
      })
      if (error) {
        if (error.code === '23505') {
          throw new Error(`"${name.trim()}" in ${city.trim()}, ${state} already exists. Search for it to add your experience.`)
        }
        throw error
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button style={s.back} onClick={onBack}>← Back</button>
        <h2 style={s.title}>Add a Business</h2>
        <p style={s.sub}>Add a service provider to the shared directory.</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Service Type *</label>
            <div style={s.typeRow}>
              {[{ val: 'home', label: '🏠 Home Services' }, { val: 'personal', label: '💇 Personal Services' }].map(opt => (
                <button key={opt.val} type="button"
                  style={{ ...s.typeBtn, ...(serviceType === opt.val ? s.typeBtnActive : {}) }}
                  onClick={() => { setServiceType(opt.val); setCategory('') }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {serviceType && (
            <div style={s.field}>
              <label style={s.label}>Category *</label>
              <select style={s.input} value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Select a category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Business Name *</label>
            <input style={s.input} type="text" placeholder="e.g. ABC Renovations" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={s.row}>
            <div style={{ ...s.field, flex: 2 }}>
              <label style={s.label}>City *</label>
              <input style={s.input} type="text" placeholder="e.g. Atlanta" value={city} onChange={e => setCity(e.target.value)} required />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>State *</label>
              <select style={s.input} value={state} onChange={e => setState(e.target.value)} required>
                <option value="">State</option>
                {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Notes (optional)</label>
            <textarea style={{ ...s.input, height: 80, padding: '12px 16px', resize: 'vertical' }}
              placeholder="Any notes about this business..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Business'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#F9F8F5', padding: '40px 20px', display: 'flex', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, border: '1px solid #E2E0DA', padding: 40, alignSelf: 'flex-start' },
  back: { background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 24, fontFamily: 'inherit' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, margin: '0 0 8px' },
  sub: { color: '#6B6B6B', fontSize: 14, margin: '0 0 28px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'flex', gap: 12 },
  label: { fontSize: 11, fontWeight: 500, color: '#6B6B6B', letterSpacing: 1, textTransform: 'uppercase' },
  typeRow: { display: 'flex', gap: 10 },
  typeBtn: { flex: 1, height: 48, background: '#FAFAF8', border: '1.5px solid #E2E0DA', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#0E0E0E' },
  typeBtnActive: { background: '#1A3A2A', color: '#E8C84A', border: '1.5px solid #1A3A2A' },
  input: { height: 48, border: '1.5px solid #E2E0DA', borderRadius: 10, padding: '0 16px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#FAFAF8', color: '#0E0E0E' },
  btn: { height: 50, background: '#1A3A2A', color: '#E8C84A', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  error: { color: '#C94125', fontSize: 13, margin: 0, lineHeight: 1.5 },
}
