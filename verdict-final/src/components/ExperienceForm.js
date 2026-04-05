import { useState } from 'react'
import { supabase, HOME_QUESTIONS, PERSONAL_QUESTIONS, calculateOutcome, calculateScore, buildKeyPoints } from '../lib/supabase'

export default function ExperienceForm({ user, business, onBack, onSaved }) {
  const questions = business.service_type === 'personal' ? PERSONAL_QUESTIONS : HOME_QUESTIONS
  const [step, setStep]     = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const current  = questions[step]
  const isReview = step >= questions.length

  function selectAnswer(key, option) {
    setAnswers(prev => ({ ...prev, [key]: option }))
    if (step < questions.length - 1) setTimeout(() => setStep(s => s + 1), 180)
    else setTimeout(() => setStep(questions.length), 180)
  }

  async function submit() {
    setSaving(true); setError('')
    try {
      const responses = questions.map(q => ({
        question_key: q.key,
        answer_label: answers[q.key]?.label || '',
        answer_value: answers[q.key]?.value ?? 0,
        signal_type:  answers[q.key]?.signal || 'neutral',
      }))

      const outcome    = calculateOutcome(responses)
      const score      = calculateScore(responses, outcome)
      const key_points = buildKeyPoints(responses, business.service_type)

      const { data: exp, error: expErr } = await supabase
        .from('experiences')
        .insert({ user_id: user.id, business_id: business.id, outcome, total_score: score, key_points })
        .select().single()

      if (expErr) throw expErr

      const { error: resErr } = await supabase
        .from('experience_responses')
        .insert(responses.map(r => ({ ...r, experience_id: exp.id })))

      if (resErr) throw resErr

      onSaved({ outcome, score, key_points })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button style={s.back} onClick={onBack}>← Back</button>

        <div style={s.bizInfo}>
          <span style={s.bizName}>{business.name}</span>
          <span style={s.bizCat}>{business.category}</span>
        </div>

        {/* Progress */}
        <div style={s.progWrap}>
          {questions.map((_, i) => (
            <div key={i} style={{ ...s.seg, background: i < step ? '#1A3A2A' : i === step ? '#E8C84A' : '#E2E0DA' }} />
          ))}
        </div>

        {!isReview ? (
          <>
            <p style={s.qNum}>Question {step + 1} of {questions.length}</p>
            <h3 style={s.qText}>{current.text}</h3>
            <div style={s.options}>
              {current.options.map(opt => {
                const sel = answers[current.key]?.label === opt.label
                const optStyle = sel
                  ? opt.signal === 'positive'                    ? s.selGood
                  : opt.signal === 'neutral'                     ? s.selMid
                  : s.selBad
                  : {}
                return (
                  <button key={opt.label} style={{ ...s.optBtn, ...optStyle }} onClick={() => selectAnswer(current.key, opt)}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {step > 0 && <button style={s.prev} onClick={() => setStep(s => s - 1)}>← Previous</button>}
          </>
        ) : (
          <div>
            <h3 style={s.reviewTitle}>Review Your Answers</h3>
            <div style={s.reviewList}>
              {questions.map(q => {
                const a   = answers[q.key]
                const col = a?.signal === 'positive' ? '#2D8A52' : a?.signal === 'critical_risk' ? '#C94125' : a?.signal === 'risk' ? '#B8870A' : '#6B6B6B'
                return (
                  <div key={q.key} style={s.reviewRow}>
                    <div style={s.reviewQ}>{q.text}</div>
                    <div style={{ ...s.reviewA, color: col }}>{a?.label || '—'}</div>
                  </div>
                )
              })}
            </div>
            {error && <p style={s.error}>{error}</p>}
            <button style={s.submitBtn} onClick={submit} disabled={saving}>
              {saving ? 'Submitting…' : 'Submit Evaluation'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:        { minHeight: '100vh', background: '#F9F8F5', padding: '40px 20px', display: 'flex', justifyContent: 'center' },
  card:        { width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, border: '1px solid #E2E0DA', padding: 40, alignSelf: 'flex-start' },
  back:        { background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 20, fontFamily: 'inherit' },
  bizInfo:     { display: 'flex', flexDirection: 'column', marginBottom: 24 },
  bizName:     { fontSize: 18, fontWeight: 500, color: '#0E0E0E' },
  bizCat:      { fontSize: 12, color: '#6B6B6B', marginTop: 3, textTransform: 'capitalize' },
  progWrap:    { display: 'flex', gap: 4, marginBottom: 28 },
  seg:         { flex: 1, height: 3, borderRadius: 2, transition: 'background .2s' },
  qNum:        { fontSize: 11, color: '#6B6B6B', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 10px' },
  qText:       { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, lineHeight: 1.4, margin: '0 0 24px', color: '#0E0E0E' },
  options:     { display: 'flex', flexDirection: 'column', gap: 10 },
  optBtn:      { width: '100%', padding: '16px 20px', background: '#FAFAF8', border: '1.5px solid #E2E0DA', borderRadius: 12, fontSize: 15, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: '#0E0E0E', transition: 'all .15s' },
  selGood:     { borderColor: '#2D8A52', background: '#E6F2EC', color: '#1A5C35' },
  selMid:      { borderColor: '#B8870A', background: '#FDF4E0', color: '#7A5200' },
  selBad:      { borderColor: '#C94125', background: '#FDEEE9', color: '#8B2A16' },
  prev:        { background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: 13, marginTop: 20, padding: 0, fontFamily: 'inherit' },
  reviewTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, margin: '0 0 20px' },
  reviewList:  { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 },
  reviewRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0EDE8' },
  reviewQ:     { fontSize: 13, color: '#0E0E0E', flex: 1, lineHeight: 1.4 },
  reviewA:     { fontSize: 13, fontWeight: 500, flexShrink: 0 },
  submitBtn:   { width: '100%', height: 52, background: '#1A3A2A', color: '#E8C84A', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  error:       { color: '#C94125', fontSize: 13, margin: '0 0 12px' },
}
