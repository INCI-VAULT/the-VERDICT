import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import AddBusiness from './components/AddBusiness'
import ExperienceForm from './components/ExperienceForm'
import OutcomeResult from './components/OutcomeResult'
import BusinessDetail from './components/BusinessDetail'

export default function App() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [screen,  setScreen]  = useState('dashboard')
  const [selectedBiz, setSelectedBiz] = useState(null)
  const [lastResult,  setLastResult]  = useState(null)
  const [expCount,    setExpCount]    = useState(1)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null); setScreen('dashboard')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F8F5' }}>
      <p style={{ color: '#6B6B6B', fontSize: 14 }}>Loading…</p>
    </div>
  )

  if (!user) return <Auth />

  if (screen === 'add-business') return (
    <AddBusiness user={user} onBack={() => setScreen('dashboard')} onSaved={() => setScreen('dashboard')} />
  )

  if (screen === 'detail' && selectedBiz) return (
    <BusinessDetail
      user={user} business={selectedBiz}
      onBack={() => { setScreen('dashboard'); setSelectedBiz(null) }}
      onEvaluate={() => setScreen('evaluate')}
    />
  )

  if (screen === 'evaluate' && selectedBiz) return (
    <ExperienceForm
      user={user} business={selectedBiz}
      onBack={() => setScreen('detail')}
      onSaved={async (result) => {
        // get updated experience count
        const { count } = await supabase
          .from('experiences')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', selectedBiz.id)
        setExpCount(count || 1)
        setLastResult(result)
        setScreen('result')
      }}
    />
  )

  if (screen === 'result' && lastResult) return (
    <OutcomeResult
      outcome={lastResult.outcome}
      score={lastResult.score}
      keyPoints={lastResult.key_points}
      experienceCount={expCount}
      onDone={() => { setScreen('dashboard'); setSelectedBiz(null); setLastResult(null) }}
      onAnother={() => setScreen('evaluate')}
    />
  )

  return (
    <Dashboard
      user={user}
      onSignOut={handleSignOut}
      onAddBusiness={() => setScreen('add-business')}
      onViewBusiness={(biz) => { setSelectedBiz(biz); setScreen('detail') }}
    />
  )
}
