import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { createClient, User } from '@supabase/supabase-js'

const LOGO = "data:image/png;base64,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"

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)

type Space = 'personal' | 'empresa'
type TxType = 'ingreso' | 'egreso'
interface Tx { id: string; user_id: string; space: Space; date: string; type: TxType; description: string; amount: number; payment_method?: string; client?: string; category_name?: string; created_at: string }
interface Cat { id: string; user_id: string; space: string; type: string; name: string; color: string; is_default: boolean }
interface PM { id: string; user_id: string; name: string; is_default: boolean }
interface Gami { user_id: string; xp: number; level: number; streak_days: number }
interface Budget { id: string; user_id: string; space: Space; category_name: string; limit_amount: number }
interface Profile { id: string; name: string; email: string; plan: string }
interface AdminUser { id: string; email: string; name: string; plan: string; created_at: string; total_movimientos: number; ultimo_movimiento: string | null }

const ADMIN_EMAIL = 'fpadillav1@gmail.com'

const fmt = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString('es-CO')
const fmtM = (n: number) => n >= 1000000 ? '$' + (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : fmt(n)
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const C = {
  bg: '#0d0d14', sbg: '#0f0f18', card: '#12121e', border: '#252535',
  primary: '#8b7ff0', primaryLight: 'rgba(139,127,240,0.2)',
  text: '#e8e8f0', muted: '#6060a0', sub: '#5555a0',
  green: '#4ade80', red: '#f87171', purple: '#a89ef5',
}
const btn: React.CSSProperties = { padding: '7px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', fontFamily: 'inherit' }
const inp: React.CSSProperties = { width: '100%', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '7px', padding: '7px 10px', color: C.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '9px', colorScheme: 'dark' }
const sel: React.CSSProperties = { ...inp, marginBottom: 0, cursor: 'pointer' }
const card: React.CSSProperties = { background: C.card, borderRadius: '12px', border: `1px solid ${C.border}` }
const lbl: React.CSSProperties = { display: 'block', fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '5px' }

interface AuthCtx {
  user: User | null; loading: boolean
  signIn: (e: string, p: string) => Promise<{ error: any }>
  signUp: (e: string, p: string, n: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}
const AuthContext = createContext<AuthCtx | undefined>(undefined)
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => { setUser(s?.user ?? null); setLoading(false) })
    return () => subscription.unsubscribe()
  }, [])
  return (
    <AuthContext.Provider value={{
      user, loading,
      signIn: (e, p) => supabase.auth.signInWithPassword({ email: e, password: p }).then(r => ({ error: r.error })),
      signUp: (e, p, n) => supabase.auth.signUp({ email: e, password: p, options: { data: { name: n } } }).then(r => ({ error: r.error })),
      signOut: () => supabase.auth.signOut().then(() => { })
    }}>{children}</AuthContext.Provider>
  )
}
function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be inside AuthProvider')
  return c
}

function LoginPage({ onReg }: { onReg: () => void }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const submit = async () => {
    if (!email || !pw) return
    setLoading(true); setErr('')
    const { error } = await signIn(email, pw)
    if (error) setErr('Email o contraseña incorrectos')
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={LOGO} style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 16px', display: 'block', boxShadow: '0 0 24px rgba(13,13,20,.6)' }} alt="Clarix" />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: C.text, margin: '0 0 6px' }}>Clarix</h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>Inicia sesión para continuar</p>
        </div>
        <div style={{ ...card, padding: '28px' }}>
          {err && <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: '8px', padding: '10px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>{err}</div>}
          <label style={lbl}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="tu@email.com" style={inp} />
          <label style={lbl}>Contraseña</label>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••" style={{ ...inp, marginBottom: 0, paddingRight: '36px' }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '2px' }}>
              {showPw ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>
          <button onClick={submit} disabled={loading} style={{ ...btn, width: '100%', padding: '13px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Iniciando...' : 'Iniciar sesión'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: C.muted, fontSize: '14px' }}>
          ¿No tienes cuenta? <button onClick={onReg} style={{ background: 'none', border: 'none', color: C.purple, cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit' }}>Crear cuenta</button>
        </p>
      </div>
    </div>
  )
}

function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const [showPw, setShowPw] = useState(false)
  if (ok) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: C.text, marginBottom: '10px' }}>¡Cuenta creada!</h2>
        <p style={{ color: C.muted, marginBottom: '24px' }}>Ya puedes iniciar sesión.</p>
        <button onClick={onLogin} style={{ ...btn, padding: '12px 28px' }}>Ir al login</button>
      </div>
    </div>
  )
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={LOGO} style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 16px', display: 'block', boxShadow: '0 0 24px rgba(13,13,20,.6)' }} alt="Clarix" />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: C.text, margin: '0 0 6px' }}>Clarix</h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>Crea tu cuenta gratis</p>
        </div>
        <div style={{ ...card, padding: '28px' }}>
          {err && <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: '8px', padding: '10px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>{err}</div>}
          <label style={lbl}>Nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={inp} />
          <label style={lbl}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={inp} />
          <label style={lbl}>Contraseña</label>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ ...inp, marginBottom: 0, paddingRight: '36px' }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '2px' }}>
              {showPw ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>
          <button onClick={async () => {
            if (!name || !email || pw.length < 6) { setErr('Completa todos los campos (contraseña mín. 6 caracteres)'); return }
            setLoading(true); setErr('')
            const { error } = await signUp(email, pw, name)
            if (error) setErr(error.message || 'Error al crear cuenta')
            else setOk(true)
            setLoading(false)
          }} disabled={loading} style={{ ...btn, width: '100%', padding: '13px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: C.muted, fontSize: '14px' }}>
          ¿Ya tienes cuenta? <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.purple, cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit' }}>Iniciar sesión</button>
        </p>
      </div>
    </div>
  )
}

async function geminiSuggestCategory(desc: string, cats: Cat[]): Promise<string | null> {
  try {
    if (!desc.trim() || cats.length === 0) return null
    const catNames = cats.map(c => c.name).join(', ')
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Eres un asistente de categorización financiera. Dado el siguiente movimiento financiero, sugiere la categoría más apropiada de la lista disponible. Responde SOLO con el nombre exacto de la categoría, sin explicación ni puntuación adicional.\n\nMovimiento: "${desc}"\nCategorías disponibles: ${catNames}\n\nCategoría sugerida:` }] }],
        generationConfig: { maxOutputTokens: 20, temperature: 0.1 }
      })
    })
    const data = await res.json()
    const suggested = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (suggested && cats.find(c => c.name.toLowerCase() === suggested.toLowerCase())) {
      return cats.find(c => c.name.toLowerCase() === suggested.toLowerCase())!.name
    }
    return null
  } catch { return null }
}

function Modal({ pms, space, onAdd, onClose, cats }: { pms: PM[]; space: Space; onAdd: (tx: any) => Promise<void>; onClose: () => void; cats: Cat[] }) {
  const [mode, setMode] = useState<'menu' | 'form'>('menu')
  const [type, setType] = useState<TxType>('ingreso')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [pm, setPm] = useState(pms[0]?.name || '')
  const [client, setClient] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiFb, setAiFb] = useState('')
  const [catSuggestion, setCatSuggestion] = useState<string | null>(null)
  const [sugLoading, setSugLoading] = useState(false)
  const [selectedCat, setSelectedCat] = useState('')
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')

  useEffect(() => {
    if (!desc.trim() || desc.length < 3) { setCatSuggestion(null); return }
    const timer = setTimeout(async () => {
      setSugLoading(true)
      const suggestion = await geminiSuggestCategory(desc, spaceCats)
      setCatSuggestion(suggestion)
      if (suggestion && !selectedCat) setSelectedCat(suggestion)
      setSugLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [desc])
  const doAI = (t: 'audio' | 'foto' | 'chat') => {
    setMode('form')
    const d = { audio: { a: 800000, d: 'Pago arriendo', t: 'egreso' as TxType, m: '🎙 Escuchando...', r: '✅ "Arriendo 800k" detectado' }, foto: { a: 245000, d: 'Supermercado', t: 'egreso' as TxType, m: '📷 Analizando recibo...', r: '✅ Factura $245.000 detectada' }, chat: { a: 1500000, d: 'Consultoría a cliente', t: 'ingreso' as TxType, m: '💬 Procesando...', r: '✅ "Consultoría $1.5M" detectada' } }[t]
    setAiFb(d.m)
    setTimeout(() => { setAiFb(d.r); setAmount(String(d.a)); setDesc(d.d); setType(d.t) }, 1200)
  }
  const save = async () => {
    if (!desc || !amount) return
    setSaving(true)
    await onAdd({ space, date, type, description: desc, amount: Number(amount), payment_method: pm, client: space === 'empresa' ? client : undefined, category_name: selectedCat || catSuggestion || undefined })
    setSaving(false)
    onClose()
  }
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(5,5,10,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }
  const box: React.CSSProperties = { background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '14px', padding: '20px', width: '375px', maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,.7)', fontFamily: "'DM Sans', sans-serif" }
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        {mode === 'menu' ? (
          <>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px', color: C.text }}>¿Cómo quieres registrar?</div>
            {[{ id: 'manual', ic: '✏️', l: 'Manual', d: 'Llena el formulario' }, { id: 'audio', ic: '🎙', l: 'Audio', d: 'Habla en lenguaje natural' }, { id: 'foto', ic: '📷', l: 'Foto de recibo', d: 'La IA lee el recibo' }, { id: 'chat', ic: '💬', l: 'Chat IA', d: 'Escribe en lenguaje natural' }].map(o => (
              <div key={o.id} onClick={() => o.id === 'manual' ? setMode('form') : doAI(o.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #2a2a3e', background: C.card, marginBottom: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(139,127,240,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{o.ic}</div>
                <div><div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{o.l}</div><div style={{ fontSize: '10px', color: C.muted }}>{o.d}</div></div>
              </div>
            ))}
            <button onClick={onClose} style={{ width: '100%', padding: '9px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '9px', color: C.muted, fontSize: '12px', cursor: 'pointer', marginTop: '4px', fontFamily: 'inherit' }}>Cancelar</button>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px', color: C.text }}>Nueva transacción</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '9px' }}>
              <div><label style={lbl}>Tipo</label><select value={type} onChange={e => setType(e.target.value as TxType)} style={sel}><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div>
              <div><label style={lbl}>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, marginBottom: 0 }} /></div>
            </div>
            <label style={lbl}>Descripción</label>
            <input value={desc} onChange={e => { setDesc(e.target.value); setCatSuggestion(null) }} placeholder="Ej: Consultoría..." style={inp} />
            {(catSuggestion || sugLoading) && (
              <div style={{ marginTop: '-6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {sugLoading ? (
                  <span style={{ fontSize: '11px', color: C.muted }}>✨ Analizando categoría...</span>
                ) : catSuggestion ? (
                  <>
                    <span style={{ fontSize: '11px', color: C.muted }}>✨ Categoría sugerida:</span>
                    <button onClick={() => setSelectedCat(catSuggestion)} style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${selectedCat === catSuggestion ? C.primary : 'rgba(139,127,240,.4)'}`, background: selectedCat === catSuggestion ? 'rgba(139,127,240,.2)' : 'transparent', color: C.purple, fontFamily: 'inherit' }}>
                      {catSuggestion} {selectedCat === catSuggestion ? '✓' : ''}
                    </button>
                  </>
                ) : null}
              </div>
            )}
            <label style={lbl}>Categoría</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...sel, marginBottom: '9px', width: '100%' }}>
              <option value="">Sin categoría</option>
              {spaceCats.filter(c => type === 'ingreso' ? c.type === 'ingreso' : c.type !== 'ingreso').map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '9px' }}>
              <div><label style={lbl}>Monto</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ ...inp, marginBottom: 0 }} /></div>
              <div><label style={lbl}>Forma de pago</label><select value={pm} onChange={e => setPm(e.target.value)} style={sel}>{pms.map(p => <option key={p.id}>{p.name}</option>)}</select></div>
            </div>
            {space === 'empresa' && <><label style={lbl}>Cliente</label><input value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre del cliente..." style={inp} /></>}
            {aiFb && <div style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '11px', color: C.purple }}>{aiFb}</div>}
            <div style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', color: C.muted, marginBottom: '6px' }}>✨ IA activa</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {(['audio', 'foto', 'chat'] as const).map(t => <button key={t} onClick={() => doAI(t)} style={{ flex: 1, padding: '6px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '7px', fontSize: '11px', cursor: 'pointer', color: '#c0c0e0', fontFamily: 'inherit' }}>{t === 'audio' ? '🎙' : t === 'foto' ? '📷' : '💬'} {t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '7px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '12px', cursor: 'pointer', border: '1px solid #2a2a3e', background: '#1a1a2e', color: '#c0c0e0', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={save} disabled={saving} style={{ ...btn, opacity: saving ? 0.6 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function RegisterModal({ pms, space, cats, onAdd, onClose }: { pms: PM[]; space: Space; cats: Cat[]; onAdd: (tx: any) => Promise<void>; onClose: () => void }) {
  const [type, setType] = useState<TxType>('egreso')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [pm, setPm] = useState(pms[0]?.name || '')
  const [selectedCat, setSelectedCat] = useState('')
  const [saving, setSaving] = useState(false)
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')

  const save = async () => {
    if (!desc || !amount) return
    setSaving(true)
    await onAdd({ space, date, type, description: desc, amount: Number(amount), payment_method: pm, category_name: selectedCat || undefined })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,10,.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxWidth: '500px', maxHeight: '92vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#2a2a3e', borderRadius: '99px', margin: '0 auto 20px' }} />
        <div style={{ fontWeight: 700, fontSize: '18px', color: C.text, marginBottom: '16px' }}>Nueva transacción</div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['egreso', 'ingreso'] as TxType[]).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: type === t ? (t === 'ingreso' ? 'rgba(74,222,128,.2)' : 'rgba(248,113,113,.2)') : '#1a1a2e', color: type === t ? (t === 'ingreso' ? C.green : C.red) : C.muted }}>
              {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
            </button>
          ))}
        </div>

        <label style={lbl}>Descripción</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Comida, Arriendo, Consultoría..." style={inp} />

        <label style={lbl}>Categoría</label>
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...sel, marginBottom: '14px', width: '100%', fontSize: '15px' }}>
          <option value="">Sin categoría</option>
          {spaceCats.filter(c => type === 'ingreso' ? c.type === 'ingreso' : c.type !== 'ingreso').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <label style={lbl}>Monto</label>
        <input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ ...inp, fontSize: '28px', fontWeight: 700, textAlign: 'center' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={lbl}>Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, marginBottom: 0, fontSize: '13px' }} />
          </div>
          <div>
            <label style={lbl}>Forma de pago</label>
            <select value={pm} onChange={e => setPm(e.target.value)} style={{ ...sel, width: '100%', fontSize: '13px' }}>
              {pms.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <button onClick={save} disabled={saving || !desc || !amount} style={{ ...btn, width: '100%', padding: '16px', fontSize: '16px', borderRadius: '14px', opacity: (saving || !desc || !amount) ? 0.5 : 1, marginBottom: '10px' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button onClick={onClose} style={{ width: '100%', padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
      </div>
    </div>
  )
}

function EditModal({ tx, pms, space, cats, onSave, onDelete, onClose }: { tx: Tx; pms: PM[]; space: Space; cats: Cat[]; onSave: (data: any) => Promise<void>; onDelete: () => Promise<void>; onClose: () => void }) {
  const [type, setType] = useState<TxType>(tx.type)
  const [date, setDate] = useState(tx.date)
  const [desc, setDesc] = useState(tx.description)
  const [amount, setAmount] = useState(String(tx.amount))
  const [pm, setPm] = useState(tx.payment_method || pms[0]?.name || '')
  const [client, setClient] = useState(tx.client || '')
  const [selectedCat, setSelectedCat] = useState(tx.category_name || '')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [catSuggestion, setCatSuggestion] = useState<string | null>(null)
  const [sugLoading, setSugLoading] = useState(false)
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')
  const filteredCats = spaceCats.filter(c => type === 'ingreso' ? c.type === 'ingreso' : c.type !== 'ingreso')

  useEffect(() => {
    if (!desc.trim() || desc.length < 3) { setCatSuggestion(null); return }
    const timer = setTimeout(async () => {
      setSugLoading(true)
      const suggestion = await geminiSuggestCategory(desc, filteredCats)
      setCatSuggestion(suggestion)
      if (suggestion && !selectedCat) setSelectedCat(suggestion)
      setSugLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [desc, type])
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(5,5,10,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }
  const box: React.CSSProperties = { background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '14px', padding: '20px', width: '375px', maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,.7)', fontFamily: "'DM Sans', sans-serif" }
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: C.text }}>Editar transacción</div>
        <div style={{ fontSize: '11px', color: C.muted, marginBottom: '14px' }}>{tx.date} · {tx.description}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '9px' }}>
          <div><label style={lbl}>Tipo</label><select value={type} onChange={e => setType(e.target.value as TxType)} style={sel}><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div>
          <div><label style={lbl}>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, marginBottom: 0 }} /></div>
        </div>
        <label style={lbl}>Descripción</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} style={inp} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '9px' }}>
          <div><label style={lbl}>Monto</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inp, marginBottom: 0 }} /></div>
          <div><label style={lbl}>Forma de pago</label><select value={pm} onChange={e => setPm(e.target.value)} style={sel}>{pms.map(p => <option key={p.id}>{p.name}</option>)}</select></div>
        </div>
        {space === 'empresa' && <><label style={lbl}>Cliente</label><input value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre del cliente..." style={inp} /></>}
        <label style={lbl}>Categoría</label>
        {(catSuggestion || sugLoading) && (
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {sugLoading ? <span style={{ fontSize: '11px', color: C.muted }}>✨ Analizando...</span> : catSuggestion ? <>
              <span style={{ fontSize: '11px', color: C.muted }}>✨ Sugerida:</span>
              <button onClick={() => setSelectedCat(catSuggestion)} style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(139,127,240,.2)', color: C.purple, fontFamily: 'inherit' }}>{catSuggestion} ✓</button>
            </> : null}
          </div>
        )}
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...sel, marginBottom: '12px', width: '100%' }}>
          <option value="">Sin categoría</option>
          {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '7px', marginTop: '4px', justifyContent: 'space-between' }}>
          {!confirming ? (
            <button onClick={() => setConfirming(true)} style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '12px', cursor: 'pointer', border: '1px solid rgba(248,113,113,.3)', background: 'rgba(248,113,113,.1)', color: C.red, fontFamily: 'inherit' }}>🗑 Eliminar</button>
          ) : (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: C.red }}>¿Confirmar?</span>
              <button onClick={onDelete} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', border: 'none', background: C.red, color: 'white', fontFamily: 'inherit' }}>Sí</button>
              <button onClick={() => setConfirming(false)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontFamily: 'inherit' }}>No</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '7px' }}>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '12px', cursor: 'pointer', border: '1px solid #2a2a3e', background: '#1a1a2e', color: '#c0c0e0', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={async () => {
              if (!desc || !amount) return
              setSaving(true)
              await onSave({ type, date, description: desc, amount: Number(amount), payment_method: pm, client: space === 'empresa' ? client : undefined, category_name: selectedCat || undefined })
              setSaving(false)
            }} disabled={saving} style={{ ...btn, opacity: saving ? 0.6 : 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(5,5,10,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }
  const box: React.CSSProperties = { background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '28px', width: '380px', maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,.7)', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
        <div style={{ fontWeight: 700, fontSize: '20px', color: '#e8e8f0', marginBottom: '6px' }}>Clarix Pro</div>
        <div style={{ fontSize: '13px', color: '#6060a0', marginBottom: '20px', lineHeight: 1.5 }}>Desbloquea el registro de movimientos, categorías, presupuesto e IA</div>
        <div style={{ background: '#12121e', borderRadius: '12px', border: '1px solid #252535', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#e8e8f0', letterSpacing: '-.04em' }}>$5 <span style={{ fontSize: '14px', color: '#6060a0', fontWeight: 400 }}>USD/mes</span></div>
          <div style={{ fontSize: '11px', color: '#5555a0', marginTop: '4px' }}>Cancela cuando quieras</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
          {['✅ Movimientos ilimitados', '✅ Categorías personalizadas', '✅ Presupuesto por categoría', '✅ Autocategorización con IA', '✅ Reportes y Pareto 80/20', '✅ Espacios Personal y Empresa'].map((f, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#c0c0e0' }}>{f}</div>
          ))}
        </div>
        <a href="mailto:tu@email.com?subject=Quiero%20Clarix%20Pro" style={{ display: 'block', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', textDecoration: 'none', marginBottom: '10px' }}>
          Suscribirme por $5/mes →
        </a>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #252535', borderRadius: '9px', color: '#6060a0', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Ahora no</button>
      </div>
    </div>
  )
}

function BudgetCustomRow({ onSave }: { onSave: (name: string, amt: number) => void }) {
  const [name, setName] = useState('')
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <div style={{ background: '#12121e', borderRadius: '12px', border: '1px solid #252535', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre categoría..."
        style={{ flex: 1, minWidth: '120px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '7px', padding: '5px 8px', color: '#e8e8f0', fontSize: '11px', outline: 'none', fontFamily: 'inherit' }}
      />
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Límite mensual"
        style={{ width: '130px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '7px', padding: '5px 8px', color: '#e8e8f0', fontSize: '11px', outline: 'none', fontFamily: 'inherit' }}
      />
      <button onClick={async () => {
        if (!name.trim() || !val || Number(val) <= 0) return
        setSaving(true)
        await onSave(name.trim(), Number(val))
        setName(''); setVal('')
        setSaving(false)
      }} disabled={saving} style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
        {saving ? '...' : '+ Agregar'}
      </button>
    </div>
  )
}

function BudgetRow({ cat, onSave }: { cat: any; onSave: (amt: number) => void }) {
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <div style={{ ...{background:'#12121e',borderRadius:'12px',border:'1px solid #252535'}, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
      <span style={{ fontSize: '12px', flex: 1, color: '#c0c0e0' }}>{cat.name}</span>
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Límite mensual"
        style={{ width: '130px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '7px', padding: '5px 8px', color: '#e8e8f0', fontSize: '11px', outline: 'none', fontFamily: 'inherit' }}
      />
      <button onClick={async () => {
        if (!val || Number(val) <= 0) return
        setSaving(true)
        await onSave(Number(val))
        setVal('')
        setSaving(false)
      }} disabled={saving} style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
        {saving ? '...' : 'Agregar'}
      </button>
    </div>
  )
}

function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('admin_users').select('*')
    if (data) setUsers(data)
    setLoading(false)
  }

  async function togglePlan(userId: string, currentPlan: string) {
    if (userId === ADMIN_EMAIL) return
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro'
    setUpdating(userId)
    await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
    setUpdating(null)
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPro = users.filter(u => u.plan === 'pro').length
  const totalFree = users.filter(u => u.plan !== 'pro').length

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>👑 Panel Admin</div>
          <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>Gestión de usuarios Clarix</div>
        </div>
        <button onClick={loadUsers} style={{ ...btn, fontSize: '11px', padding: '6px 12px' }}>↻ Actualizar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px', marginBottom: '16px' }}>
        {[{ l: 'Total usuarios', v: users.length, c: C.text, ic: '👥' }, { l: 'Usuarios Pro', v: totalPro, c: C.green, ic: '⚡' }, { l: 'Usuarios Free', v: totalFree, c: C.muted, ic: '🔒' }].map((k, i) => (
          <div key={i} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>{k.ic}</div>
            <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.l}</div>
            <div style={{ fontWeight: 700, fontSize: '1.8rem', marginTop: '4px', color: k.c, letterSpacing: '-.04em' }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: '14px 16px', marginBottom: '16px', background: 'linear-gradient(135deg,rgba(139,127,240,.15),rgba(106,138,240,.08))', border: '1px solid rgba(139,127,240,.3)' }}>
        <div style={{ fontSize: '10px', color: C.primary, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>💰 MRR Estimado</div>
        <div style={{ fontWeight: 700, fontSize: '2rem', color: C.text, letterSpacing: '-.04em' }}>${(totalPro * 5).toLocaleString()} <span style={{ fontSize: '14px', color: C.muted, fontWeight: 400 }}>USD/mes</span></div>
        <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px' }}>{totalPro} usuarios Pro × $5 USD</div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por email o nombre..." style={{ ...inp, marginBottom: '12px' }} />

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 60px 100px 80px', padding: '8px 14px', borderBottom: `1px solid ${C.border}`, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          <span>Usuario</span><span>Registro</span><span>Movs.</span><span>Último mov.</span><span style={{ textAlign: 'right' }}>Plan</span>
        </div>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>No se encontraron usuarios</div>
        ) : filtered.map(u => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 60px 100px 80px', padding: '10px 14px', borderBottom: '1px solid rgba(37,37,53,.5)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: C.text }}>{u.name || '—'} {u.email === ADMIN_EMAIL ? '👑' : ''}</div>
              <div style={{ fontSize: '10px', color: C.muted, marginTop: '1px' }}>{u.email}</div>
            </div>
            <div style={{ fontSize: '10px', color: C.muted }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</div>
            <div style={{ fontSize: '12px', color: C.text, fontWeight: 600 }}>{u.total_movimientos || 0}</div>
            <div style={{ fontSize: '10px', color: C.muted }}>{u.ultimo_movimiento ? new Date(u.ultimo_movimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}</div>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => togglePlan(u.id, u.plan)}
                disabled={updating === u.id || u.email === ADMIN_EMAIL}
                style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700, cursor: u.email === ADMIN_EMAIL ? 'default' : 'pointer', border: 'none', fontFamily: 'inherit', background: u.plan === 'pro' ? 'rgba(74,222,128,.15)' : 'rgba(96,96,160,.15)', color: u.plan === 'pro' ? C.green : C.muted, opacity: updating === u.id ? 0.5 : 1 }}>
                {updating === u.id ? '...' : u.plan === 'pro' ? '⚡ Pro' : '🔒 Free'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: C.muted, marginTop: '8px', textAlign: 'center' }}>Clic en el badge para cambiar Free ↔ Pro</div>
    </div>
  )
}

function MainApp() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [space, setSpace] = useState<Space>('personal')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())
  const [txs, setTxs] = useState<Tx[]>([])
  const [cats, setCats] = useState<Cat[]>([])
  const [pms, setPms] = useState<PM[]>([])
  const [gami, setGami] = useState<Gami | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Tx | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [adjSub, setAdjSub] = useState('')
  const [newCat, setNewCat] = useState('')
  const [newCatType, setNewCatType] = useState('ingreso')
  const [newPM, setNewPM] = useState('')
  const [rTab, setRTab] = useState('resumen')
  const [paretoV, setParetoV] = useState('ingresos')
  const [movFilter, setMovFilter] = useState('')
  const [cajaF, setCajaF] = useState('hoy')
  const [movView, setMovView] = useState('lista')

  useEffect(() => { if (user) loadAll() }, [user, space])

  async function loadAll() {
    setLoading(true)
    const [t, c, p, g, b, pr] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user!.id).eq('space', space).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user!.id),
      supabase.from('payment_methods').select('*').eq('user_id', user!.id),
      supabase.from('gamification').select('*').eq('user_id', user!.id).single(),
      supabase.from('budgets').select('*').eq('user_id', user!.id).eq('space', space),
      supabase.from('profiles').select('*').eq('id', user!.id).single(),
    ])
    if (t.data) setTxs(t.data)
    if (c.data) setCats(c.data)
    if (p.data) setPms(p.data)
    if (g.data) setGami(g.data)
    if (b.data) setBudgets(b.data)
    if (pr.data) setProfile(pr.data)
    setLoading(false)
  }

  async function addTx(tx: any) {
    const { data, error } = await supabase.from('transactions').insert({ ...tx, user_id: user!.id }).select().single()
    if (!error && data) {
      setTxs(prev => [data, ...prev])
      const xp = (gami?.xp || 0) + 10
      const lv = Math.floor(xp / 500) + 1
      await supabase.from('gamification').update({ xp, level: lv, streak_days: (gami?.streak_days || 0) + 1, last_record_date: new Date().toISOString().split('T')[0] }).eq('user_id', user!.id)
      setGami(prev => prev ? { ...prev, xp, level: lv } : prev)
    }
  }

  async function updateTx(id: string, data: any) {
    const { data: updated } = await supabase.from('transactions').update(data).eq('id', id).select().single()
    if (updated) setTxs(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function delTx(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  async function upsertBudget(category_name: string, limit_amount: number) {
    const existing = await supabase.from('budgets').select('id').eq('user_id', user!.id).eq('space', space).eq('category_name', category_name).maybeSingle()
    let data
    if (existing.data?.id) {
      const res = await supabase.from('budgets').update({ limit_amount }).eq('id', existing.data.id).select().maybeSingle()
      data = res.data
    } else {
      const res = await supabase.from('budgets').insert({ user_id: user!.id, space, category_name, limit_amount }).select().maybeSingle()
      data = res.data
    }
    if (data) setBudgets(prev => { const exists = prev.find(b => b.category_name === category_name); return exists ? prev.map(b => b.category_name === category_name ? data : b) : [...prev, data] })
  }

  async function deleteBudget(id: string) {
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  async function addCat() {
    if (!newCat.trim()) return
    const colors = ['#a89ef5', '#60a5fa', '#fb923c', '#4ade80', '#f87171', '#c084fc', '#fbbf24', '#2dd4bf']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const { data } = await supabase.from('categories').insert({ space, type: newCatType, name: newCat.trim(), color, is_default: false, user_id: user!.id }).select().single()
    if (data) { setCats(prev => [...prev, data]); setNewCat('') }
  }

  async function delCat(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    setCats(prev => prev.filter(c => c.id !== id))
  }

  async function addPM() {
    if (!newPM.trim()) return
    const { data } = await supabase.from('payment_methods').insert({ name: newPM.trim(), user_id: user!.id }).select().single()
    if (data) { setPms(prev => [...prev, data]); setNewPM('') }
  }

  async function delPM(id: string) {
    await supabase.from('payment_methods').delete().eq('id', id)
    setPms(prev => prev.filter(p => p.id !== id))
  }

  const txMonth = txs.filter(t => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year })
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')
  const isEmp = space === 'empresa'
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'
  const ing = txMonth.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0)
  const eg = txMonth.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0)
  const util = ing - eg
  const margin = ing > 0 ? Math.round(util / ing * 100) : 0
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const xpPct = gami ? ((gami.xp % 500) / 500) * 100 : 0
  const movFiltered = movFilter ? txMonth.filter(t => t.type === movFilter) : txMonth
  const now = new Date()
  const cajaMap: Record<string, number> = { hoy: 0, '7d': 7, '15d': 15, '30d': 30 }
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - (cajaMap[cajaF] || 0))
  const cajaTx = cajaF === 'hoy' ? txs.filter(t => t.date === now.toISOString().split('T')[0]) : txs.filter(t => new Date(t.date) >= cutoff)
  const cajaIng = cajaTx.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0)
  const cajaEg = cajaTx.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0)
  const byMethod = (type: string) => { const m: Record<string, number> = {}; cajaTx.filter(t => t.type === type).forEach(t => { const k = t.payment_method || 'Sin método'; m[k] = (m[k] || 0) + t.amount }); return Object.entries(m).sort((a, b) => b[1] - a[1]) }
  const byMonthData = MONTHS.map((_, m) => { const tx = txs.filter(t => { const d = new Date(t.date); return d.getMonth() === m && d.getFullYear() === year }); const i = tx.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0); const e = tx.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0); return { ing: i, eg: e } })
  const totIng = byMonthData.reduce((s, m) => s + m.ing, 0); const totEg = byMonthData.reduce((s, m) => s + m.eg, 0); const totUtil = totIng - totEg; const avgMgn = totIng > 0 ? Math.round(totUtil / totIng * 100) : 0
  const bestM = byMonthData.reduce((b, m, i) => m.ing > (byMonthData[b]?.ing || 0) ? i : b, 0)
  const maxV = Math.max(...byMonthData.map(m => Math.max(m.ing, m.eg))) || 1
  const groupBy = (type: string) => { const m: Record<string, number> = {}; txMonth.filter(t => t.type === type).forEach(t => { m[t.description] = (m[t.description] || 0) + t.amount }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount })) }
  const groupByCat = (type: string) => { const m: Record<string, number> = {}; txMonth.filter(t => t.type === type).forEach(t => { const k = t.category_name || 'Sin categoría'; m[k] = (m[k] || 0) + t.amount }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount })) }

  const DONUT_COLORS = ['#8b7ff0','#f87171','#4ade80','#fbbf24','#60a5fa','#fb923c','#c084fc','#2dd4bf','#818cf8','#f472b6']

  const DonutChart = ({ items, total, size = 120 }: { items: {name:string;amount:number}[]; total: number; size?: number }) => {
    if (items.length === 0 || total === 0) return <div style={{ textAlign: 'center', color: C.muted, fontSize: '11px', padding: '20px 0' }}>Sin datos</div>
    const r = 40; const cx = 50; const cy = 50; const stroke = 14
    let offset = 0
    const circumference = 2 * Math.PI * r
    const slices = items.slice(0, 8).map((it, i) => {
      const pct = it.amount / total
      const dash = pct * circumference
      const gap = circumference - dash
      const slice = { pct, dash, gap, offset, color: DONUT_COLORS[i % DONUT_COLORS.length] }
      offset += dash
      return slice
    })
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke} />
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="700">{items.length}</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fill={C.muted} fontSize="6">categorías</text>
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {items.slice(0, 6).map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: '#c0c0e0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: DONUT_COLORS[i % DONUT_COLORS.length] }}>{Math.round(it.amount / total * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  const rItems = paretoV === 'ingresos' ? groupBy('ingreso') : groupBy('egreso')
  const rTotal = paretoV === 'ingresos' ? ing : eg
  const rColor = paretoV === 'ingresos' ? C.purple : C.red
  const rBarC = paretoV === 'ingresos' ? C.primary : C.red
  let acum = 0
  const rCalc = rItems.map((it, i) => { const pct = rTotal > 0 ? Math.round(it.amount / rTotal * 100) : 0; acum += pct; return { ...it, pct, acum, rank: i + 1 } })
  const cutIdx = rCalc.findIndex(it => it.acum >= 80)
  const countTop = cutIdx === -1 ? rCalc.length : cutIdx + 1
  const pctTop = rCalc[Math.max(0, countTop - 1)]?.acum || 0
  const navItems = [
    { id: 'dashboard', l: 'Inicio', d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
    { id: 'movimientos', l: 'Movimientos', d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { id: 'consolidado', l: 'Consolidado', d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
    { id: 'presupuesto', l: 'Presupuesto', d: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z' },
    { id: 'reportes', l: 'Reportes', d: 'M18 20V10M12 20V4M6 20v-6' },
  ]
  const isAdmin = user?.email === ADMIN_EMAIL
  const isPro = profile?.plan === 'pro'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const sb: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 9px', borderRadius: '9px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, marginBottom: '2px', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'all .15s' }
  const ph = (title: string, sub: string, extra?: ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>{title}</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{sub}</div></div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...sel, padding: '6px 10px', width: 'auto' }}>{MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
        {extra}
        {isPro
          ? <button style={btn} onClick={() => setShowModal(true)}>+ Registrar</button>
          : <button style={{ ...btn, background: 'rgba(139,127,240,.3)', position: 'relative' }} onClick={() => setShowUpgrade(true)}>🔒 Registrar</button>
        }
      </div>
    </div>
  )
  const kpis = (items: { l: string; v: number; c: string }[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length},1fr)`, gap: '9px', marginBottom: '12px' }}>
      {items.map((k, i) => (
        <div key={i} style={{ ...card, padding: '13px 15px' }}>
          <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.l}</div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', marginTop: '5px', color: k.c }}>{fmt(k.v)}</div>
          <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px' }}>{MONTHS[month]} {year}</div>
        </div>
      ))}
    </div>
  )

  if (isMobile) return <MobileApp />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark' }}>
      <div style={{ width: '200px', flexShrink: 0, background: C.sbg, borderRight: `1px solid #1e1e2e`, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <img src={LOGO} style={{ width: '30px', height: '30px', borderRadius: '8px' }} alt="Clarix" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: C.text, letterSpacing: '-.02em' }}>Clarix</div>
              <div style={{ fontSize: '10px', color: C.sub, marginTop: '1px' }}>Planeación financiera</div>
            </div>
          </div>
        </div>
        <div style={{ margin: '8px 10px 4px', background: '#18182a', borderRadius: '8px', padding: '3px', display: 'flex', border: '1px solid #2a2a3e' }}>
          {(['personal', 'empresa'] as Space[]).map(s => (
            <button key={s} onClick={() => setSpace(s)} style={{ flex: 1, padding: '5px 0', textAlign: 'center', borderRadius: '5px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: space === s ? 'linear-gradient(135deg,#8b7ff0,#6a8af0)' : 'transparent', color: space === s ? '#fff' : '#7070b0' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ ...sb, background: page === item.id ? C.primaryLight : 'transparent', color: page === item.id ? '#b0a8ff' : '#8888b8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.d} /></svg>
              {item.l}
            </button>
          ))}
          <div style={{ height: '1px', background: '#1e1e2e', margin: '5px 4px' }} />
          <button onClick={() => setPage('ajustes')} style={{ ...sb, background: page === 'ajustes' ? C.primaryLight : 'transparent', color: page === 'ajustes' ? '#b0a8ff' : '#8888b8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Ajustes
          </button>
          {isAdmin && (
            <button onClick={() => setPage('admin')} style={{ ...sb, background: page === 'admin' ? 'rgba(251,191,36,.15)' : 'transparent', color: page === 'admin' ? '#fbbf24' : '#8888b8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Admin
            </button>
          )}
        </nav>
        <div style={{ padding: '10px 12px', borderTop: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '11px', fontWeight: 500, color: C.text }}>{userName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <div style={{ fontSize: '10px', color: C.sub }}>{user?.email}</div>
              {isAdmin && <span style={{ fontSize: '8px', background: 'rgba(251,191,36,.2)', color: '#fbbf24', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>ADMIN</span>}
            </div>
          </div>
          <button onClick={signOut} title="Cerrar sesión" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px' }}>→</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.muted }}>Cargando datos...</div>
        ) : (
          <div style={{ padding: '20px' }}>
            {page === 'admin' && isAdmin && <AdminPage />}
            {page === 'dashboard' && <>
              {ph('Inicio', `${isEmp ? 'Finanzas empresa' : 'Finanzas personales'} · ${MONTHS[month]} ${year}`)}
              {!isPro && (
                <div onClick={() => setShowUpgrade(true)} style={{ ...card, padding: '14px 16px', marginBottom: '12px', cursor: 'pointer', background: 'linear-gradient(135deg,rgba(139,127,240,.15),rgba(106,138,240,.1))', border: '1px solid rgba(139,127,240,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#b0a8ff' }}>⚡ Activa Clarix Pro — $5 USD/mes</div>
                    <div style={{ fontSize: '11px', color: '#6060a0', marginTop: '3px' }}>Registra movimientos, usa IA y mucho más</div>
                  </div>
                  <div style={{ fontSize: '18px', color: '#8b7ff0' }}>›</div>
                </div>
              )}
              <div style={{ ...card, padding: '16px 18px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle,rgba(139,127,240,.08),transparent 70%)', pointerEvents: 'none' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>{greet}, {userName} 👋</div>
                  <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px' }}>{isEmp ? 'Tu negocio va por buen camino' : 'Tus finanzas están bajo control'}</div>
                  {gami && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '7px', fontSize: '11px', color: '#fbbf24' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24' }} />{gami.streak_days} días de racha 🔥</div>}
                </div>
                {gami && <div style={{ textAlign: 'right', minWidth: '140px' }}>
                  <div style={{ fontSize: '10px', color: C.muted, marginBottom: '5px' }}>Nivel {gami.level} · {500 - (gami.xp % 500)} XP para nivel {gami.level + 1}</div>
                  <div style={{ width: '130px', height: '5px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden', marginLeft: 'auto' }}><div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#8b7ff0,#6a8af0)', borderRadius: '99px' }} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.muted, marginTop: '3px', width: '130px', marginLeft: 'auto' }}><span>{gami.xp} XP</span><span>{Math.round(xpPct)}%</span></div>
                </div>}
              </div>
              {kpis([{ l: 'Ingresos', v: ing, c: C.purple }, { l: isEmp ? 'Egresos' : 'Gastos', v: eg, c: C.red }, { l: isEmp ? 'Utilidad' : 'Ahorro', v: util, c: C.green }])}
              <div style={{ ...card, padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Gastos por categoría</div>
                <DonutChart items={groupByCat('egreso')} total={eg} />
              </div>
              <div style={{ ...card, padding: '14px' }}>
                <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Últimos movimientos</div>
                {txMonth.length === 0 ? <div style={{ textAlign: 'center', padding: '20px', color: C.muted, fontSize: '12px' }}>No hay movimientos este mes. ¡Registra el primero!</div> :
                  txMonth.slice(0, 5).map(t => (
                    <div key={t.id} onClick={() => setEditTx(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(37,37,53,.5)', cursor: 'pointer' }}>
                      <div><div style={{ fontSize: '12px', color: '#c0c0e0' }}>{t.description}</div><div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{t.date} · {t.payment_method || '—'}</div></div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: t.type === 'ingreso' ? C.green : C.red }}>{t.type === 'ingreso' ? '+' : '-'}{fmt(t.amount)}</div>
                    </div>
                  ))}
              </div>
            </>}

            {page === 'movimientos' && <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>Movimientos</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{MONTHS[month]} {year}</div></div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...sel, padding: '6px 10px', width: 'auto' }}>{MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
                  <select value={movFilter} onChange={e => setMovFilter(e.target.value)} style={{ ...sel, padding: '6px 10px', width: 'auto' }}><option value="">Todos</option><option value="ingreso">Ingresos</option><option value="egreso">Egresos</option></select>
                  <button style={btn} onClick={() => setShowModal(true)}>+ Registrar</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {['lista', 'caja'].map((v, i) => <button key={v} onClick={() => setMovView(v)} style={{ padding: '6px 13px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: movView === v ? '1px solid rgba(139,127,240,.3)' : `1px solid ${C.border}`, background: movView === v ? 'rgba(139,127,240,.18)' : '#1a1a2e', color: movView === v ? '#b0a8ff' : '#8888b8' }}>{i === 0 ? 'Movimientos' : 'Caja'}</button>)}
              </div>
              {movView === 'lista' ? <>
                {kpis([{ l: 'Ingresos', v: movFiltered.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0), c: C.purple }, { l: 'Egresos', v: movFiltered.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0), c: C.red }, { l: isEmp ? 'Utilidad' : 'Balance', v: movFiltered.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0) - movFiltered.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0), c: C.green }])}
                <div style={{ ...card, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isEmp ? '80px 110px 1fr 80px 90px' : '80px 1fr 110px 90px', padding: '8px 13px', borderBottom: `1px solid ${C.border}`, fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <span>Fecha</span>{isEmp && <span>Cat.</span>}<span>Descripción</span><span>Categoría</span>{isEmp && <span>Cliente</span>}<span style={{ textAlign: 'right' }}>Monto</span>
                  </div>
                  {movFiltered.length === 0 ? <div style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>No hay movimientos este mes</div> :
                    movFiltered.map(t => (
                      <div key={t.id} onClick={() => setEditTx(t)} style={{ display: 'grid', gridTemplateColumns: isEmp ? '80px 110px 1fr 80px 90px' : '80px 1fr 110px 90px', padding: '9px 13px', borderBottom: '1px solid rgba(37,37,53,.5)', alignItems: 'center', fontSize: '12px', color: '#c0c0e0', cursor: 'pointer' }} title="Clic para editar">
                        <span style={{ fontSize: '11px', color: C.muted }}>{t.date.slice(5).replace('-', '/')}</span>
                        {isEmp && <span style={{ fontSize: '11px' }}>{t.description.split(' ').slice(0, 2).join(' ')}</span>}
                        <span>{t.description}</span>
                        <span style={{ fontSize: '11px', color: C.muted }}>{t.category_name || '—'}</span>
                        {isEmp && <span style={{ fontSize: '11px', color: C.muted }}>{t.client || '—'}</span>}
                        <span style={{ fontWeight: 700, textAlign: 'right', color: t.type === 'ingreso' ? C.green : C.red }}>{t.type === 'ingreso' ? '+' : '-'}{fmt(t.amount)}</span>
                      </div>
                    ))}
                </div>
                <div style={{ fontSize: '10px', color: C.muted, marginTop: '6px', textAlign: 'center' }}>Clic en una fila para editar o eliminar</div>
              </> : <>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {['hoy', '7d', '15d', '30d'].map(f => <button key={f} onClick={() => setCajaF(f)} style={{ padding: '5px 11px', borderRadius: '99px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: cajaF === f ? 'none' : `1px solid ${C.border}`, background: cajaF === f ? 'linear-gradient(135deg,#8b7ff0,#6a8af0)' : '#1a1a2e', color: cajaF === f ? 'white' : '#8888b8' }}>{f === 'hoy' ? 'Hoy' : f === '7d' ? '7 días' : f === '15d' ? '15 días' : '30 días'}</button>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '9px', marginBottom: '12px' }}>
                  {[{ l: 'Saldo inicial', v: '$0', c: C.text, s: 'Opcional' }, { l: 'Ingresos', v: fmt(cajaIng), c: C.purple }, { l: 'Egresos', v: fmt(cajaEg), c: C.red }, { l: 'Disponible', v: fmt(cajaIng - cajaEg), c: C.green }].map((c, i) => (
                    <div key={i} style={{ ...card, padding: '11px 13px' }}>
                      <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{c.l}</div>
                      <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-.03em', marginTop: '4px', color: c.c }}>{c.v}</div>
                      {c.s && <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{c.s}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[{ title: 'Ingresos por método de pago', data: byMethod('ingreso'), color: C.green }, { title: 'Egresos por método de pago', data: byMethod('egreso'), color: C.red }].map((sec, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>{sec.title}</div>
                      <div style={{ ...card, overflow: 'hidden' }}>
                        {sec.data.length === 0 ? <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: C.muted }}>Sin movimientos</div> :
                          sec.data.map(([pm, amt]) => (
                            <div key={pm} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', borderBottom: '1px solid rgba(37,37,53,.4)' }}>
                              <span style={{ fontSize: '12px', color: '#c0c0e0' }}>{pm}</span>
                              <span style={{ fontWeight: 700, fontSize: '13px', color: sec.color }}>{fmt(amt)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>}
            </>}

            {page === 'consolidado' && <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>Consolidado</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>Vista general {isEmp ? 'empresa' : 'personal'} · {year}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px', marginBottom: '14px' }}>
                {[{ l: 'Ingresos acum.', v: fmtM(totIng), c: C.purple }, { l: 'Egresos acum.', v: fmtM(totEg), c: C.red }, { l: isEmp ? 'Utilidad acum.' : 'Ahorro acum.', v: fmtM(totUtil), c: C.green, s: `Margen ${avgMgn}%` }].map((k, i) => (
                  <div key={i} style={{ ...card, padding: '13px 15px' }}>
                    <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.l}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', marginTop: '5px', color: k.c }}>{k.v}</div>
                    {k.s && <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px' }}>{k.s}</div>}
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Evolución mensual {year}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '90px' }}>
                  {byMonthData.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1px', justifyContent: 'center' }}>
                      <div style={{ width: '48%', height: `${m.ing / maxV * 80}px`, background: C.primary, borderRadius: '3px 3px 0 0', minHeight: m.ing > 0 ? '4px' : '0' }} />
                      <div style={{ width: '48%', height: `${m.eg / maxV * 80}px`, background: C.red, borderRadius: '3px 3px 0 0', minHeight: m.eg > 0 ? '4px' : '0' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>{MONTHS.map((m, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: C.muted }}>{m.slice(0, 1)}</div>)}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  {[{ c: C.primary, l: 'Ingresos' }, { c: C.red, l: 'Egresos' }].map(b => <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: b.c }} /><span style={{ fontSize: '10px', color: C.muted }}>{b.l}</span></div>)}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                <div style={{ ...card, padding: '14px' }}><div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>Mejor mes</div><div style={{ fontWeight: 700, fontSize: '18px', color: C.green, margin: '6px 0 2px' }}>{MONTHS[bestM]}</div><div style={{ fontSize: '11px', color: C.muted }}>{fmtM(byMonthData[bestM]?.ing || 0)} ingresos</div></div>
                <div style={{ ...card, padding: '14px' }}><div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>Margen promedio</div><div style={{ fontWeight: 700, fontSize: '18px', color: C.purple, margin: '6px 0 2px' }}>{avgMgn}%</div><div style={{ fontSize: '11px', color: C.muted }}>Ene — {MONTHS[new Date().getMonth()]} {year}</div></div>
              </div>
            </>}

            {page === 'presupuesto' && (() => {
              const egressCats = spaceCats.filter(c => c.type !== 'ingreso')
              const allCatsWithBudget = egressCats.map(c => {
                const budget = budgets.find(b => b.category_name === c.name)
                const spent = txMonth.filter(t => t.type === 'egreso' && t.category_name === c.name).reduce((s, t) => s + t.amount, 0)
                const limit = budget?.limit_amount || 0
                const pct = limit > 0 ? Math.min(100, Math.round(spent / limit * 100)) : 0
                const warning = pct >= 80 && pct < 100
                const over = pct >= 100
                return { ...c, spent, limit, pct, warning, over, budgetId: budget?.id }
              })
              const withBudget = allCatsWithBudget.filter(c => c.limit > 0)
              const withoutBudget = allCatsWithBudget.filter(c => c.limit === 0)
              return <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>Presupuesto</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{isEmp ? 'Empresa' : 'Personal'} · {MONTHS[month]} {year}</div></div>
                  <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...sel, padding: '6px 10px', width: 'auto' }}>{MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
                </div>

                {withBudget.length === 0 && (
                  <div style={{ ...card, padding: '24px', textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>💰</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: C.text, marginBottom: '4px' }}>Sin límites configurados</div>
                    <div style={{ fontSize: '11px', color: C.muted }}>Agrega un límite a tus categorías para controlar tus gastos</div>
                  </div>
                )}

                {withBudget.map((c, i) => (
                  <div key={i} style={{ ...card, padding: '14px 16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{c.name}</span>
                        {c.warning && <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(251,191,36,.15)', color: '#fbbf24', fontWeight: 600 }}>⚠ 80%+</span>}
                        {c.over && <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(248,113,113,.15)', color: C.red, fontWeight: 600 }}>🚨 Superado</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: c.over ? C.red : c.warning ? '#fbbf24' : C.muted }}>{fmt(c.spent)} / {fmt(c.limit)}</span>
                        <button onClick={() => { if (c.budgetId) deleteBudget(c.budgetId) }} style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
                      </div>
                    </div>
                    <div style={{ background: '#1a1a2e', height: '8px', borderRadius: '99px', overflow: 'hidden', marginBottom: '5px' }}>
                      <div style={{ height: '100%', width: `${c.pct}%`, background: c.over ? C.red : c.warning ? '#fbbf24' : c.color, borderRadius: '99px', transition: 'width .3s' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: c.over ? C.red : c.warning ? '#fbbf24' : C.muted }}>{c.pct}% utilizado{c.over ? ' · Límite superado' : c.warning ? ' · Casi al límite' : ''}</div>
                  </div>
                ))}

                <div style={{ marginTop: withBudget.length > 0 ? '6px' : '0' }}>
                  <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>
                    {withBudget.length > 0 ? 'Agregar límite a más categorías' : 'Tus categorías de gasto'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {withoutBudget.map((c, i) => (
                      <BudgetRow key={i} cat={c} onSave={(amt) => upsertBudget(c.name, amt)} />
                    ))}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>O agrega una categoría personalizada</div>
                    <BudgetCustomRow onSave={(name, amt) => upsertBudget(name, amt)} />
                  </div>
                </div>
              </>
            })()}

            {page === 'reportes' && <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>Reportes</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{MONTHS[month]} {year}</div></div>
                <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...sel, padding: '6px 10px', width: 'auto' }}>{MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
              </div>
              <div style={{ display: 'flex', gap: '3px', background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '11px', padding: '3px', marginBottom: '16px' }}>
                {['resumen', 'ingresos', 'gastos', 'pareto'].map(t => <button key={t} onClick={() => setRTab(t)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 500, border: rTab === t ? `1px solid ${C.border}` : 'none', background: rTab === t ? C.card : 'transparent', color: rTab === t ? C.text : '#7070b0', fontFamily: 'inherit' }}>{t === 'pareto' ? 'Pareto 80/20' : t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
              </div>
              {rTab === 'resumen' && <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '9px', marginBottom: '12px' }}>
                  {[{ l: 'Ingresos', v: fmtM(ing), c: C.purple }, { l: 'Ut. bruta', v: fmtM(ing), c: C.purple, s: `Margen ${margin}%` }, { l: 'Ut. operacional', v: fmtM(util), c: C.purple, s: `Margen ${margin}%` }, { l: 'Ut. neta', v: fmtM(util), c: C.green }].map((k, i) => (
                    <div key={i} style={{ ...card, padding: '11px 13px' }}>
                      <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.l}</div>
                      <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-.03em', color: k.c, margin: '4px 0 2px' }}>{k.v}</div>
                      {k.s && <div style={{ fontSize: '10px', color: C.green }}>{k.s}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                  <div style={{ ...card, padding: '14px' }}>
                    <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Ingresos vs Egresos</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '80px' }}>
                      {[{ v: ing, c: C.primary, l: 'Ing' }, { v: eg, c: C.red, l: 'Eg' }, { v: Math.max(0, util), c: C.green, l: 'Neto' }].map((b, i) => { const max = Math.max(ing, eg, util) || 1; return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}><div style={{ fontSize: '9px', color: C.muted }}>{fmtM(b.v)}</div><div style={{ width: '100%', height: `${b.v / max * 60}px`, background: b.c, borderRadius: '3px 3px 0 0', minHeight: '4px' }} /><div style={{ fontSize: '8px', color: C.muted }}>{b.l}</div></div> })}
                    </div>
                  </div>
                  <div style={{ ...card, padding: '14px' }}>
                    <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Margen neto</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', gap: '14px' }}>
                      <svg width="60" height="60" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}><circle cx="18" cy="18" r="14" fill="none" stroke="#1a1a2e" strokeWidth="3.5" /><circle cx="18" cy="18" r="14" fill="none" stroke={C.primary} strokeWidth="3.5" strokeDasharray={`${margin} 100`} strokeLinecap="round" /></svg>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: C.purple }}>{margin}%</div>
                    </div>
                  </div>
                </div>
              </>}
              {(rTab === 'ingresos' || rTab === 'gastos') && (() => {
                const items = rTab === 'ingresos' ? groupBy('ingreso') : groupBy('egreso')
                const catItems = rTab === 'ingresos' ? groupByCat('ingreso') : groupByCat('egreso')
                const total = rTab === 'ingresos' ? ing : eg
                const color = rTab === 'ingresos' ? C.purple : C.red
                return <>
                  <div style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-.04em', marginBottom: '14px', color }}>{fmt(total)}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ ...card, padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Por categoría</div>
                      <DonutChart items={catItems} total={total} size={100} />
                    </div>
                    <div style={{ ...card, padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Top movimientos</div>
                      {items.length === 0 ? <div style={{ textAlign: 'center', color: C.muted, fontSize: '12px', padding: '20px' }}>No hay datos este mes</div> :
                        items.slice(0, 5).map((it, i) => { const pct = total > 0 ? Math.round(it.amount / total * 100) : 0; return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><span style={{ fontSize: '11px', flex: 1, color: '#c0c0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span><div style={{ width: '50px', height: '4px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px' }} /></div><span style={{ fontSize: '10px', fontWeight: 700, color, minWidth: '60px', textAlign: 'right' }}>{fmt(it.amount)}</span></div> })}
                    </div>
                  </div>
                </>
              })()}
              {rTab === 'pareto' && <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px', marginBottom: '14px' }}>
                  {[{ l: 'Ingresos', v: fmtM(ing), c: C.purple }, { l: 'Egresos', v: fmtM(eg), c: C.red }, { l: 'Neto', v: fmtM(util), c: C.green, s: `Margen ${margin}%` }].map((k, i) => <div key={i} style={{ ...card, padding: '12px 14px' }}><div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.l}</div><div style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-.04em', marginTop: '4px', color: k.c }}>{k.v}</div>{k.s && <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px' }}>{k.s}</div>}</div>)}
                </div>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '14px' }}>
                  {[{ v: 'ingresos', l: '📈 ¿De dónde entra más?' }, { v: 'egresos', l: '📉 ¿A dónde se va más?' }].map(b => <button key={b.v} onClick={() => setParetoV(b.v)} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: paretoV === b.v ? (b.v === 'ingresos' ? '1px solid rgba(139,127,240,.35)' : '1px solid rgba(248,113,113,.3)') : `1px solid ${C.border}`, background: paretoV === b.v ? (b.v === 'ingresos' ? 'rgba(139,127,240,.15)' : 'rgba(248,113,113,.1)') : '#1a1a2e', color: paretoV === b.v ? (b.v === 'ingresos' ? C.purple : C.red) : '#8888b8' }}>{b.l}</button>)}
                </div>
                <div style={{ ...card, padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>Análisis Pareto 80/20</div>
                      <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}><span style={{ color: C.text, fontWeight: 600 }}>{countTop}</span> de {rItems.length} fuentes generan el <span style={{ color: rColor, fontSize: '15px', fontWeight: 700 }}>{pctTop}%</span> de tus {paretoV === 'ingresos' ? 'ingresos' : 'egresos'}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700, background: paretoV === 'ingresos' ? 'rgba(139,127,240,.15)' : 'rgba(248,113,113,.12)', color: rColor, border: `1px solid ${paretoV === 'ingresos' ? 'rgba(139,127,240,.3)' : 'rgba(248,113,113,.25)'}` }}>{paretoV === 'ingresos' ? 'INGRESOS' : 'EGRESOS'}</div>
                  </div>
                  {rCalc.length === 0 ? <div style={{ textAlign: 'center', color: C.muted, fontSize: '12px', padding: '20px' }}>No hay datos este mes</div> :
                    rCalc.map((it, i) => {
                      const isTop = i < countTop
                      const bw = rItems[0]?.amount > 0 ? Math.round(it.amount / rItems[0].amount * 100) : 0
                      return (
                        <div key={i}>
                          {i === countTop && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 10px' }}><div style={{ flex: 1, height: '1px', background: 'rgba(139,127,240,.25)' }} /><div style={{ fontSize: '10px', color: C.primary, fontWeight: 600, whiteSpace: 'nowrap' }}>─── 80% alcanzado</div><div style={{ flex: 1, height: '1px', background: 'rgba(139,127,240,.25)' }} /></div>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '6px 8px', borderRadius: '8px', opacity: isTop ? 1 : 0.45 }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, flexShrink: 0, background: isTop ? rBarC : '#1a1a2e', color: isTop ? 'white' : C.muted }}>{it.rank}</div>
                            <div style={{ fontSize: '12px', fontWeight: 500, flex: 1, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                            <div style={{ flex: 1.8, height: '6px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${bw}%`, background: isTop ? rBarC : '#2a2a3e', borderRadius: '99px' }} /></div>
                            <div style={{ fontSize: '10px', color: C.muted, minWidth: '26px', textAlign: 'right' }}>{it.pct}%</div>
                            <div style={{ fontWeight: 700, fontSize: '12px', minWidth: '84px', textAlign: 'right', color: isTop ? rColor : C.muted }}>{fmt(it.amount)}</div>
                          </div>
                        </div>
                      )
                    })}
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: '#0f0f1a', borderRadius: '8px', border: '1px solid #1e1e2e', fontSize: '10px', color: C.sub, lineHeight: 1.6 }}>
                    <strong style={{ color: C.primary }}>Principio de Pareto:</strong> El ~20% de tus fuentes concentran el ~80% del total.
                  </div>
                </div>
              </>}
            </>}

            {page === 'ajustes' && <>
              {!adjSub ? <>
                <div style={{ marginBottom: '16px' }}><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>Ajustes</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>Personaliza tu experiencia</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[{ id: 'perfil', l: 'Perfil', d: 'Nombre y configuración' }, { id: 'categorias', l: 'Categorías', d: 'Ingresos, costos y gastos' }, { id: 'pagos', l: 'Métodos de pago', d: 'Cómo recibes pagos' }, { id: 'whatsapp', l: 'WhatsApp', d: 'Conecta para reportes' }].map(item => (
                    <div key={item.id} onClick={() => setAdjSub(item.id)} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2">
                          {item.id === 'perfil' && <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>}
                          {item.id === 'categorias' && <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />}
                          {item.id === 'pagos' && <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>}
                          {item.id === 'whatsapp' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: 500, color: C.text }}>{item.l}</div><div style={{ fontSize: '11px', color: C.muted, marginTop: '1px' }}>{item.d}</div></div>
                      <div style={{ color: C.muted, fontSize: '16px' }}>›</div>
                    </div>
                  ))}
                </div>
              </> : <>
                <button onClick={() => setAdjSub('')} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '12px', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>Ajustes
                </button>
                {adjSub === 'perfil' && <>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: C.text, marginBottom: '14px' }}>Perfil</div>
                  <div style={{ ...card, padding: '16px' }}>
                    <label style={lbl}>Email</label>
                    <div style={{ background: '#0f0f1a', border: `1px solid ${C.border}`, borderRadius: '7px', padding: '7px 10px', color: C.muted, fontSize: '12px', marginBottom: '9px' }}>{user?.email}</div>
                    <label style={lbl}>Moneda</label>
                    <select style={sel}><option>COP — Peso colombiano</option><option>USD — Dólar</option><option>CLP — Peso chileno</option></select>
                  </div>
                </>}
                {adjSub === 'categorias' && <>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: C.text, marginBottom: '14px' }}>Categorías</div>
                  <div style={{ ...card, padding: '14px' }}>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {spaceCats.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 0', borderBottom: '1px solid rgba(37,37,53,.5)' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', flex: 1, color: '#c0c0e0' }}>{c.name}</span>
                          <span style={{ fontSize: '9px', color: C.muted, background: '#1a1a2e', padding: '2px 6px', borderRadius: '99px' }}>{c.type}</span>
                          {!c.is_default && <button onClick={() => delCat(c.id)} style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px' }}>×</button>}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="Nueva categoría..." style={{ flex: 1, background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '7px', padding: '6px 9px', color: C.text, fontSize: '11px', outline: 'none', fontFamily: 'inherit' }} />
                      <select value={newCatType} onChange={e => setNewCatType(e.target.value)} style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, color: C.text, borderRadius: '7px', padding: '5px 7px', fontSize: '10px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option><option value="costo">Costo</option><option value="gasto">Gasto</option></select>
                      <button onClick={addCat} style={{ padding: '6px 11px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </>}
                {adjSub === 'pagos' && <>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: C.text, marginBottom: '14px' }}>Métodos de pago</div>
                  <div style={{ ...card, padding: '14px' }}>
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                      {pms.map(pm => (
                        <div key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 0', borderBottom: '1px solid rgba(37,37,53,.5)' }}>
                          <span style={{ fontSize: '13px', width: '18px', textAlign: 'center' }}>{pm.name === 'Efectivo' ? '💵' : pm.name === 'Transferencia' ? '💳' : pm.name === 'Nequi' ? '🟢' : pm.name === 'Daviplata' ? '🔵' : '💰'}</span>
                          <span style={{ fontSize: '12px', flex: 1, color: '#c0c0e0' }}>{pm.name}</span>
                          {!pm.is_default && <button onClick={() => delPM(pm.id)} style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px' }}>×</button>}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <input value={newPM} onChange={e => setNewPM(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPM()} placeholder="Nueva forma de pago..." style={{ flex: 1, background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '7px', padding: '6px 9px', color: C.text, fontSize: '11px', outline: 'none', fontFamily: 'inherit' }} />
                      <button onClick={addPM} style={{ padding: '6px 11px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </>}
                {adjSub === 'whatsapp' && <>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: C.text, marginBottom: '14px' }}>WhatsApp</div>
                  <div style={{ ...card, padding: '16px' }}>
                    <label style={lbl}>Número</label>
                    <input placeholder="+57 300 000 0000" style={inp} />
                    <div style={{ fontSize: '11px', color: C.muted, marginBottom: '12px' }}>Conecta para consultas y reportes automáticos</div>
                    <button style={{ ...btn, width: '100%' }}>Conectar WhatsApp</button>
                  </div>
                </>}
              </>}
            </>}
          </div>
        )}
      </div>

      {showModal && isPro && <Modal pms={pms} space={space} cats={cats} onAdd={addTx} onClose={() => setShowModal(false)} />}
      {editTx && (
        <EditModal
          tx={editTx}
          pms={pms}
          space={space}
          cats={cats}
          onSave={async (data) => { await updateTx(editTx.id, data); setEditTx(null) }}
          onDelete={async () => { await delTx(editTx.id); setEditTx(null) }}
          onClose={() => setEditTx(null)}
        />
      )}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}


// ── MOBILE COMPONENTS ────────────────────────────────────────────────────────
function BudgetCustomRowMobile({ onSave }: { onSave: (name: string, amt: number) => void }) {
  const [name, setName] = useState('')
  const [val, setVal] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <div style={{ background: '#12121e', borderRadius: '12px', border: '1px solid #252535', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre..." style={{ flex: 1, minWidth: '100px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '8px', padding: '8px 10px', color: '#e8e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
      <input type="number" inputMode="numeric" value={val} onChange={e => setVal(e.target.value)} placeholder="Límite" style={{ width: '90px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '8px', padding: '8px 10px', color: '#e8e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
      <button onClick={async () => { if (!name.trim() || !val || Number(val) <= 0) return; setSaving(true); await onSave(name.trim(), Number(val)); setName(''); setVal(''); setSaving(false) }} disabled={saving} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
        {saving ? '...' : '+ Agregar'}
      </button>
    </div>
  )
}

function BudgetCatRow({ cat, onSave, C, card }: { cat: any; onSave: (amt: number) => void; C: any; card: any }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ ...card, padding: '12px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
      <span style={{ fontSize: '13px', flex: 1, color: '#c0c0e0' }}>{cat.name}</span>
      <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="Límite" style={{ width: '100px', background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 8px', color: C.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
      <button onClick={async () => { if (!val || Number(val) <= 0) return; await onSave(Number(val)); setVal('') }} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', fontFamily: 'inherit' }}>+</button>
    </div>
  )
}

// ── ADMIN PAGE ────────────────────────────────────────────────────────────────
function MobileAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('admin_users').select('*')
    if (data) setUsers(data)
    setLoading(false)
  }

  async function togglePlan(userId: string, email: string, currentPlan: string) {
    if (email === ADMIN_EMAIL) return
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro'
    setUpdating(userId)
    await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
    setUpdating(null)
  }

  const filtered = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()))
  const totalPro = users.filter(u => u.plan === 'pro').length

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '4px' }}>👑 Admin</div>
      <div style={{ fontSize: '12px', color: C.sub, marginBottom: '16px' }}>Gestión de usuarios</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' }}>
        {[{ l: 'Total', v: users.length, c: C.text }, { l: 'Pro', v: totalPro, c: C.green }, { l: 'MRR', v: `$${totalPro * 5}`, c: C.purple }].map((k, i) => (
          <div key={i} style={{ ...card, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>{k.l}</div>
            <div style={{ fontWeight: 700, fontSize: '1.4rem', color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario..." style={{ ...inp, marginBottom: '12px', fontSize: '14px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? <div style={{ textAlign: 'center', color: C.muted, padding: '24px', fontSize: '14px' }}>Cargando...</div> :
          filtered.map(u => (
            <div key={u.id} style={{ ...card, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {u.name || '—'} {u.email === ADMIN_EMAIL ? '👑' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ fontSize: '11px', color: C.sub, marginTop: '3px' }}>{u.total_movimientos || 0} movs · {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}</div>
                </div>
                <button onClick={() => togglePlan(u.id, u.email, u.plan)} disabled={updating === u.id || u.email === ADMIN_EMAIL} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, cursor: u.email === ADMIN_EMAIL ? 'default' : 'pointer', border: 'none', fontFamily: 'inherit', background: u.plan === 'pro' ? 'rgba(74,222,128,.15)' : 'rgba(96,96,160,.15)', color: u.plan === 'pro' ? C.green : C.muted, opacity: updating === u.id ? 0.5 : 1, flexShrink: 0, marginLeft: '12px' }}>
                  {updating === u.id ? '...' : u.plan === 'pro' ? '⚡ Pro' : '🔒 Free'}
                </button>
              </div>
            </div>
          ))}
      </div>
      <button onClick={loadUsers} style={{ ...btn, width: '100%', marginTop: '14px', padding: '12px', fontSize: '13px' }}>↻ Actualizar</button>
    </div>
  )
}

function MobileApp() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState('inicio')
  const [space, setSpace] = useState<Space>('personal')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())
  const [txs, setTxs] = useState<Tx[]>([])
  const [cats, setCats] = useState<Cat[]>([])
  const [pms, setPms] = useState<PM[]>([])
  const [gami, setGami] = useState<Gami | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [editTx, setEditTx] = useState<Tx | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [adjSub, setAdjSub] = useState('')
  const [newCat, setNewCat] = useState(''); const [newCatType, setNewCatType] = useState('ingreso'); const [newPM, setNewPM] = useState('')
  const [rTab, setRTab] = useState('resumen'); const [paretoV, setParetoV] = useState('ingresos')
  const [movFilter, setMovFilter] = useState(''); const [cajaF, setCajaF] = useState('hoy'); const [movView, setMovView] = useState('lista')

  const isAdmin = user?.email === ADMIN_EMAIL
  const isPro = profile?.plan === 'pro'
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768
  const [desktop, setDesktop] = useState(isDesktop)

  useEffect(() => {
    const handler = () => setDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { if (user) loadAll() }, [user, space])

  async function loadAll() {
    setLoading(true)
    const [t, c, p, g, b, pr] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user!.id).eq('space', space).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user!.id),
      supabase.from('payment_methods').select('*').eq('user_id', user!.id),
      supabase.from('gamification').select('*').eq('user_id', user!.id).single(),
      supabase.from('budgets').select('*').eq('user_id', user!.id).eq('space', space),
      supabase.from('profiles').select('*').eq('id', user!.id).single(),
    ])
    if (t.data) setTxs(t.data); if (c.data) setCats(c.data); if (p.data) setPms(p.data)
    if (g.data) setGami(g.data); if (b.data) setBudgets(b.data); if (pr.data) setProfile(pr.data)
    setLoading(false)
  }

  async function addTx(tx: any) {
    const { data, error } = await supabase.from('transactions').insert({ ...tx, user_id: user!.id }).select().single()
    if (!error && data) {
      setTxs(prev => [data, ...prev])
      const xp = (gami?.xp || 0) + 10; const lv = Math.floor(xp / 500) + 1
      await supabase.from('gamification').update({ xp, level: lv, streak_days: (gami?.streak_days || 0) + 1, last_record_date: new Date().toISOString().split('T')[0] }).eq('user_id', user!.id)
      setGami(prev => prev ? { ...prev, xp, level: lv } : prev)
    }
  }

  async function updateTx(id: string, data: any) {
    const { data: updated } = await supabase.from('transactions').update(data).eq('id', id).select().single()
    if (updated) setTxs(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function delTx(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  async function upsertBudget(category_name: string, limit_amount: number) {
    const existing = await supabase.from('budgets').select('id').eq('user_id', user!.id).eq('space', space).eq('category_name', category_name).maybeSingle()
    let data
    if (existing.data?.id) {
      const res = await supabase.from('budgets').update({ limit_amount }).eq('id', existing.data.id).select().maybeSingle()
      data = res.data
    } else {
      const res = await supabase.from('budgets').insert({ user_id: user!.id, space, category_name, limit_amount }).select().maybeSingle()
      data = res.data
    }
    if (data) setBudgets(prev => { const exists = prev.find(b => b.category_name === category_name); return exists ? prev.map(b => b.category_name === category_name ? data : b) : [...prev, data] })
  }

  async function deleteBudget(id: string) {
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  async function addCat() {
    if (!newCat.trim()) return
    const colors = ['#a89ef5','#60a5fa','#fb923c','#4ade80','#f87171','#c084fc','#fbbf24','#2dd4bf']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const { data } = await supabase.from('categories').insert({ space, type: newCatType, name: newCat.trim(), color, is_default: false, user_id: user!.id }).select().single()
    if (data) { setCats(prev => [...prev, data]); setNewCat('') }
  }

  async function delCat(id: string) { await supabase.from('categories').delete().eq('id', id); setCats(prev => prev.filter(c => c.id !== id)) }
  async function addPM() { if (!newPM.trim()) return; const { data } = await supabase.from('payment_methods').insert({ name: newPM.trim(), user_id: user!.id }).select().single(); if (data) { setPms(prev => [...prev, data]); setNewPM('') } }
  async function delPM(id: string) { await supabase.from('payment_methods').delete().eq('id', id); setPms(prev => prev.filter(p => p.id !== id)) }

  const txMonth = txs.filter(t => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year })
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')
  const isEmp = space === 'empresa'
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'
  const ing = txMonth.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0)
  const eg = txMonth.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0)
  const util = ing - eg
  const margin = ing > 0 ? Math.round(util / ing * 100) : 0
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const xpPct = gami ? ((gami.xp % 500) / 500) * 100 : 0

  const movFiltered = movFilter ? txMonth.filter(t => t.type === movFilter) : txMonth
  const now = new Date()
  const cajaMap: Record<string, number> = { hoy: 0, '7d': 7, '15d': 15, '30d': 30 }
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - (cajaMap[cajaF] || 0))
  const cajaTx = cajaF === 'hoy' ? txs.filter(t => t.date === now.toISOString().split('T')[0]) : txs.filter(t => new Date(t.date) >= cutoff)
  const cajaIng = cajaTx.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0)
  const cajaEg = cajaTx.filter(t => t.type === 'egreso').reduce((s, t) => s + t.amount, 0)
  const byMethod = (type: string) => { const m: Record<string,number>={};cajaTx.filter(t=>t.type===type).forEach(t=>{const k=t.payment_method||'Sin método';m[k]=(m[k]||0)+t.amount});return Object.entries(m).sort((a,b)=>b[1]-a[1]) }
  const byMonthData = MONTHS.map((_,m)=>{const tx=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===year});const i=tx.filter(t=>t.type==='ingreso').reduce((s,t)=>s+t.amount,0);const e=tx.filter(t=>t.type==='egreso').reduce((s,t)=>s+t.amount,0);return{ing:i,eg:e}})
  const totIng=byMonthData.reduce((s,m)=>s+m.ing,0);const totEg=byMonthData.reduce((s,m)=>s+m.eg,0);const totUtil=totIng-totEg;const avgMgn=totIng>0?Math.round(totUtil/totIng*100):0
  const bestM=byMonthData.reduce((b,m,i)=>m.ing>(byMonthData[b]?.ing||0)?i:b,0);const maxV=Math.max(...byMonthData.map(m=>Math.max(m.ing,m.eg)))||1
  const groupBy=(type:string)=>{const m:Record<string,number>={};txMonth.filter(t=>t.type===type).forEach(t=>{m[t.description]=(m[t.description]||0)+t.amount});return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>({name,amount}))}
  const groupByCat=(type:string)=>{const m:Record<string,number>={};txMonth.filter(t=>t.type===type).forEach(t=>{const k=t.category_name||'Sin categoría';m[k]=(m[k]||0)+t.amount});return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>({name,amount}))}
  const DONUT_COLORS=['#8b7ff0','#f87171','#4ade80','#fbbf24','#60a5fa','#fb923c','#c084fc','#2dd4bf','#818cf8','#f472b6']

  const DonutChart = ({ items, total, size=140 }: { items:{name:string;amount:number}[]; total:number; size?:number }) => {
    if (items.length===0||total===0) return <div style={{textAlign:'center',color:C.muted,fontSize:'13px',padding:'20px 0'}}>Sin datos este mes</div>
    const r=40;const cx=50;const cy=50;const stroke=14;let offset=0;const circumference=2*Math.PI*r
    const slices=items.slice(0,8).map((it,i)=>{const pct=it.amount/total;const dash=pct*circumference;const gap=circumference-dash;const slice={pct,dash,gap,offset,color:DONUT_COLORS[i%DONUT_COLORS.length]};offset+=dash;return slice})
    return (
      <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{flexShrink:0}}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke}/>
          {slices.map((s,i)=><circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset} style={{transform:'rotate(-90deg)',transformOrigin:'50px 50px'}}/>)}
          <text x={cx} y={cy-4} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="700">{items.length}</text>
          <text x={cx} y={cy+8} textAnchor="middle" fill={C.muted} fontSize="6">categorías</text>
        </svg>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'6px'}}>
          {items.slice(0,5).map((it,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{width:'10px',height:'10px',borderRadius:'50%',background:DONUT_COLORS[i%DONUT_COLORS.length],flexShrink:0}}/>
              <span style={{fontSize:'12px',color:'#c0c0e0',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.name}</span>
              <span style={{fontSize:'12px',fontWeight:700,color:DONUT_COLORS[i%DONUT_COLORS.length]}}>{Math.round(it.amount/total*100)}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const rItems=paretoV==='ingresos'?groupBy('ingreso'):groupBy('egreso');const rTotal=paretoV==='ingresos'?ing:eg;const rColor=paretoV==='ingresos'?C.purple:C.red;const rBarC=paretoV==='ingresos'?C.primary:C.red
  let acum=0;const rCalc=rItems.map((it,i)=>{const pct=rTotal>0?Math.round(it.amount/rTotal*100):0;acum+=pct;return{...it,pct,acum,rank:i+1}})
  const cutIdx=rCalc.findIndex(it=>it.acum>=80);const countTop=cutIdx===-1?rCalc.length:cutIdx+1;const pctTop=rCalc[Math.max(0,countTop-1)]?.acum||0

  const pageStyle: React.CSSProperties = { padding: '16px', paddingBottom: desktop ? '20px' : '130px', minHeight: '100vh', background: C.bg }

  // ── BOTTOM NAV ──
  const navItems = [
    { id: 'inicio', l: 'Inicio', d: 'inicio' },
    { id: 'movimientos', l: 'Movs.', d: 'movimientos' },
    { id: '__add__', l: '', d: '' },
    { id: 'presupuesto', l: 'Presup.', d: 'presupuesto' },
    { id: 'reportes', l: 'Reportes', d: 'reportes' },
    { id: 'ajustes', l: 'Ajustes', d: 'ajustes' },
  ]

  if (desktop) {

    // ── DESKTOP SIDEBAR LAYOUT ──
    const sb: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 9px', borderRadius: '9px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, marginBottom: '2px', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'all .15s' }
    const desktopNav = [
      { id: 'inicio', l: 'Inicio', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
      { id: 'movimientos', l: 'Movimientos', d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
      { id: 'consolidado', l: 'Consolidado', d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
      { id: 'presupuesto', l: 'Presupuesto', d: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z' },
      { id: 'reportes', l: 'Reportes', d: 'M18 20V10M12 20V4M6 20v-6' },
    ]
    const { signOut: so } = useAuth()
    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark' }}>
        <div style={{ width: '200px', flexShrink: 0, background: C.sbg, borderRight: `1px solid #1e1e2e`, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #1e1e2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img src={LOGO} style={{ width: '30px', height: '30px', borderRadius: '8px' }} alt="Clarix" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>Clarix</div>
                <div style={{ fontSize: '10px', color: C.sub }}>Planeación financiera</div>
              </div>
            </div>
          </div>
          <div style={{ margin: '8px 10px 4px', background: '#18182a', borderRadius: '8px', padding: '3px', display: 'flex', border: '1px solid #2a2a3e' }}>
            {(['personal', 'empresa'] as Space[]).map(s => (
              <button key={s} onClick={() => setSpace(s)} style={{ flex: 1, padding: '5px 0', textAlign: 'center', borderRadius: '5px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: space === s ? 'linear-gradient(135deg,#8b7ff0,#6a8af0)' : 'transparent', color: space === s ? '#fff' : '#7070b0' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {desktopNav.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ ...sb, background: page === item.id ? C.primaryLight : 'transparent', color: page === item.id ? '#b0a8ff' : '#8888b8' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.d} /></svg>
                {item.l}
              </button>
            ))}
            <div style={{ height: '1px', background: '#1e1e2e', margin: '5px 4px' }} />
            <button onClick={() => setPage('ajustes')} style={{ ...sb, background: page === 'ajustes' ? C.primaryLight : 'transparent', color: page === 'ajustes' ? '#b0a8ff' : '#8888b8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Ajustes
            </button>
            {isAdmin && (
              <button onClick={() => setPage('admin')} style={{ ...sb, background: page === 'admin' ? 'rgba(251,191,36,.15)' : 'transparent', color: page === 'admin' ? '#fbbf24' : '#8888b8' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Admin
              </button>
            )}
          </nav>
          <div style={{ padding: '10px 12px', borderTop: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: C.text }}>{user?.user_metadata?.name || user?.email?.split('@')[0]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <div style={{ fontSize: '10px', color: C.sub }}>{user?.email}</div>
                {isAdmin && <span style={{ fontSize: '8px', background: 'rgba(251,191,36,.2)', color: '#fbbf24', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>ADMIN</span>}
              </div>
            </div>
            <button onClick={so} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px' }}>→</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
          {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.muted }}>Cargando...</div> : (
            <div style={{ padding: '20px' }}>
              {page === 'admin' && isAdmin && <MobileAdminPage />}
              {page !== 'admin' && (
                <div style={{ padding: '0' }}>
                  <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
                    {loading ? null : (
                      <div>
                        {(page === 'inicio' || page === 'dashboard') && <>
                          {ph('Inicio', `${isEmp ? 'Finanzas empresa' : 'Finanzas personales'} · ${MONTHS[month]} ${year}`)}
                          {!isPro && (
                            <div onClick={() => setShowUpgrade(true)} style={{ ...card, padding: '14px 16px', marginBottom: '12px', cursor: 'pointer', background: 'linear-gradient(135deg,rgba(139,127,240,.15),rgba(106,138,240,.1))', border: '1px solid rgba(139,127,240,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div><div style={{ fontWeight: 700, fontSize: '13px', color: '#b0a8ff' }}>⚡ Activa Clarix Pro — $5 USD/mes</div><div style={{ fontSize: '11px', color: '#6060a0', marginTop: '3px' }}>Registra movimientos y mucho más</div></div>
                              <div style={{ fontSize: '18px', color: '#8b7ff0' }}>›</div>
                            </div>
                          )}
                          <div style={{ ...card, padding: '16px 18px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>{greet}, {userName} 👋</div>
                              <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px' }}>{isEmp ? 'Tu negocio va por buen camino' : 'Tus finanzas están bajo control'}</div>
                              {gami && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '7px', fontSize: '11px', color: '#fbbf24' }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24' }} />{gami.streak_days} días de racha 🔥</div>}
                            </div>
                            {gami && <div style={{ textAlign: 'right', minWidth: '140px' }}>
                              <div style={{ fontSize: '10px', color: C.muted, marginBottom: '5px' }}>Nivel {gami.level} · {500 - (gami.xp % 500)} XP para nivel {gami.level + 1}</div>
                              <div style={{ width: '130px', height: '5px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden', marginLeft: 'auto' }}><div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#8b7ff0,#6a8af0)', borderRadius: '99px' }} /></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.muted, marginTop: '3px', width: '130px', marginLeft: 'auto' }}><span>{gami.xp} XP</span><span>{Math.round(xpPct)}%</span></div>
                            </div>}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px', marginBottom: '12px' }}>
                            {[{ l: 'Ingresos', v: ing, c: C.purple }, { l: isEmp ? 'Egresos' : 'Gastos', v: eg, c: C.red }, { l: isEmp ? 'Utilidad' : 'Ahorro', v: util, c: C.green }].map((k, i) => (
                              <div key={i} style={{ ...card, padding: '13px 15px' }}>
                                <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.l}</div>
                                <div style={{ fontWeight: 700, fontSize: '1.25rem', marginTop: '5px', color: k.c }}>{fmt(k.v)}</div>
                                <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px' }}>{MONTHS[month]} {year}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ ...card, padding: '14px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Gastos por categoría</div>
                            <DonutChart items={groupByCat('egreso')} total={eg} />
                          </div>
                          <div style={{ ...card, padding: '14px' }}>
                            <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Últimos movimientos</div>
                            {txMonth.length === 0 ? <div style={{ textAlign: 'center', padding: '20px', color: C.muted, fontSize: '12px' }}>No hay movimientos este mes</div> :
                              txMonth.slice(0, 5).map(t => (
                                <div key={t.id} onClick={() => setEditTx(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(37,37,53,.5)', cursor: 'pointer' }}>
                                  <div><div style={{ fontSize: '12px', color: '#c0c0e0' }}>{t.description}</div><div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{t.date} · {t.category_name || t.payment_method || '—'}</div></div>
                                  <div style={{ fontWeight: 700, fontSize: '13px', color: t.type === 'ingreso' ? C.green : C.red }}>{t.type === 'ingreso' ? '+' : '-'}{fmt(t.amount)}</div>
                                </div>
                              ))}
                          </div>
                        </>}
                        {page === 'presupuesto' && (() => {
                          const egressCats = spaceCats.filter(c => c.type !== 'ingreso')
                          const allCatsWithBudget = egressCats.map(c => {
                            const budget = budgets.find(b => b.category_name === c.name)
                            const spent = txMonth.filter(t => t.type === 'egreso' && t.category_name === c.name).reduce((s, t) => s + t.amount, 0)
                            const limit = budget?.limit_amount || 0
                            const pct = limit > 0 ? Math.min(100, Math.round(spent / limit * 100)) : 0
                            const warning = pct >= 80 && pct < 100
                            const over = pct >= 100
                            return { ...c, spent, limit, pct, warning, over, budgetId: budget?.id }
                          })
                          const withBudget = allCatsWithBudget.filter(c => c.limit > 0)
                          const withoutBudget = allCatsWithBudget.filter(c => c.limit === 0)
                          return <>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div><div style={{ fontWeight: 700, fontSize: '17px', color: C.text }}>Presupuesto</div><div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{isEmp ? 'Empresa' : 'Personal'} · {MONTHS[month]} {year}</div></div>
                              <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...sel, padding: '6px 10px', width: 'auto' }}>{MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
                            </div>
                            {withBudget.length === 0 && <div style={{ ...card, padding: '24px', textAlign: 'center', marginBottom: '14px' }}><div style={{ fontSize: '28px', marginBottom: '8px' }}>💰</div><div style={{ fontSize: '13px', fontWeight: 500, color: C.text, marginBottom: '4px' }}>Sin límites configurados</div><div style={{ fontSize: '11px', color: C.muted }}>Agrega un límite a tus categorías</div></div>}
                            {withBudget.map((c, i) => (
                              <div key={i} style={{ ...card, padding: '14px 16px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color }} />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{c.name}</span>
                                    {c.warning && <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(251,191,36,.15)', color: '#fbbf24', fontWeight: 600 }}>⚠ 80%+</span>}
                                    {c.over && <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(248,113,113,.15)', color: C.red, fontWeight: 600 }}>🚨 Superado</span>}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', color: c.over ? C.red : c.warning ? '#fbbf24' : C.muted }}>{fmt(c.spent)} / {fmt(c.limit)}</span>
                                    <button onClick={() => c.budgetId && deleteBudget(c.budgetId)} style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
                                  </div>
                                </div>
                                <div style={{ background: '#1a1a2e', height: '8px', borderRadius: '99px', overflow: 'hidden', marginBottom: '5px' }}>
                                  <div style={{ height: '100%', width: `${c.pct}%`, background: c.over ? C.red : c.warning ? '#fbbf24' : c.color, borderRadius: '99px', transition: 'width .3s' }} />
                                </div>
                                <div style={{ fontSize: '10px', color: c.over ? C.red : c.warning ? '#fbbf24' : C.muted }}>{c.pct}% utilizado{c.over ? ' · Límite superado' : c.warning ? ' · Casi al límite' : ''}</div>
                              </div>
                            ))}
                            <div style={{ marginTop: '6px' }}>
                              <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>{withBudget.length > 0 ? 'Agregar límite a más categorías' : 'Tus categorías de gasto'}</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {withoutBudget.map((c, i) => <BudgetRow key={i} cat={c} onSave={(amt) => upsertBudget(c.name, amt)} />)}
                              </div>
                              <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>O agrega una categoría personalizada</div>
                                <BudgetCustomRow onSave={(name, amt) => upsertBudget(name, amt)} />
                              </div>
                            </div>
                          </>
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {showRegister && <RegisterModal pms={pms} space={space} cats={cats} onAdd={addTx} onClose={() => setShowRegister(false)} />}
        {editTx && <EditModal tx={editTx} pms={pms} space={space} cats={cats} onSave={async (data) => { await updateTx(editTx.id, data); setEditTx(null) }} onDelete={async () => { await delTx(editTx.id); setEditTx(null) }} onClose={() => setEditTx(null)} />}
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    )
  }

  // ── MOBILE LAYOUT ──
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.sbg, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LOGO} style={{ width: '32px', height: '32px', borderRadius: '9px' }} alt="Clarix" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: C.text, letterSpacing: '-.02em' }}>Clarix</div>
            <div style={{ fontSize: '10px', color: C.sub }}>
              {isAdmin ? <span style={{ color: '#fbbf24' }}>👑 Admin</span> : isPro ? <span style={{ color: C.green }}>⚡ Pro</span> : <span>Free</span>}
            </div>
          </div>
        </div>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '5px 8px', color: C.text, fontSize: '11px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m.slice(0, 3)}</option>)}
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: C.muted }}>Cargando...</div>
      ) : (
        <>
          {/* INICIO */}
          {page === 'inicio' && (
            <div style={pageStyle}>
              {!isPro && (
                <div onClick={() => setShowUpgrade(true)} style={{ ...card, padding: '14px 16px', marginBottom: '14px', cursor: 'pointer', background: 'linear-gradient(135deg,rgba(139,127,240,.15),rgba(106,138,240,.1))', border: '1px solid rgba(139,127,240,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><div style={{ fontWeight: 700, fontSize: '13px', color: '#b0a8ff' }}>⚡ Activa Clarix Pro — $5 USD/mes</div><div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>Registra movimientos y mucho más</div></div>
                  <div style={{ fontSize: '18px', color: '#8b7ff0' }}>›</div>
                </div>
              )}

              <div style={{ ...card, padding: '16px', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle,rgba(139,127,240,.1),transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ fontWeight: 700, fontSize: '16px', color: C.text }}>{greet}, {userName} 👋</div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '3px' }}>{isEmp ? 'Tu negocio va por buen camino' : 'Tus finanzas están bajo control'}</div>
                {gami && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.muted, marginBottom: '5px' }}>
                      <span>🔥 {gami.streak_days} días de racha</span>
                      <span>Nivel {gami.level} · {gami.xp} XP</span>
                    </div>
                    <div style={{ height: '6px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#8b7ff0,#6a8af0)', borderRadius: '99px' }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' }}>
                {[{ l: 'Ingresos', v: ing, c: C.purple }, { l: isEmp ? 'Egresos' : 'Gastos', v: eg, c: C.red }, { l: isEmp ? 'Utilidad' : 'Ahorro', v: util, c: C.green }].map((k, i) => (
                  <div key={i} style={{ ...card, padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{k.l}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px', color: k.c }}>{fmtM(k.v)}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...card, padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>Gastos por categoría</div>
                <DonutChart items={groupByCat('egreso')} total={eg} />
              </div>

              <div style={{ ...card, padding: '14px' }}>
                <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>Últimos movimientos</div>
                {txMonth.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: C.muted, fontSize: '14px' }}>No hay movimientos. ¡Registra el primero!</div>
                ) : txMonth.slice(0, 6).map(t => (
                  <div key={t.id} onClick={() => setEditTx(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(37,37,53,.5)', cursor: 'pointer' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', color: '#c0c0e0', fontWeight: 500 }}>{t.description}</div>
                      <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{t.date.slice(5).replace('-', '/')} · {t.category_name || t.payment_method || '—'}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: t.type === 'ingreso' ? C.green : C.red, marginLeft: '12px', flexShrink: 0 }}>{t.type === 'ingreso' ? '+' : '-'}{fmtM(t.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MOVIMIENTOS */}
          {page === 'movimientos' && (
            <div style={pageStyle}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '4px' }}>Movimientos</div>
                <div style={{ fontSize: '12px', color: C.sub }}>{MONTHS[month]} {year}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' }}>
                {[{ l: 'Ingresos', v: movFiltered.filter(t=>t.type==='ingreso').reduce((s,t)=>s+t.amount,0), c: C.purple }, { l: 'Egresos', v: movFiltered.filter(t=>t.type==='egreso').reduce((s,t)=>s+t.amount,0), c: C.red }, { l: 'Balance', v: movFiltered.filter(t=>t.type==='ingreso').reduce((s,t)=>s+t.amount,0)-movFiltered.filter(t=>t.type==='egreso').reduce((s,t)=>s+t.amount,0), c: C.green }].map((k,i) => (
                  <div key={i} style={{ ...card, padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{k.l}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px', color: k.c }}>{fmtM(k.v)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto' }}>
                {['', 'ingreso', 'egreso'].map((f, i) => (
                  <button key={f} onClick={() => setMovFilter(f)} style={{ padding: '7px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', border: movFilter === f ? 'none' : `1px solid ${C.border}`, background: movFilter === f ? 'linear-gradient(135deg,#8b7ff0,#6a8af0)' : '#1a1a2e', color: movFilter === f ? 'white' : '#8888b8' }}>
                    {i === 0 ? 'Todos' : i === 1 ? '↑ Ingresos' : '↓ Egresos'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {['lista', 'caja'].map((v,i) => <button key={v} onClick={() => setMovView(v)} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: movView===v?'1px solid rgba(139,127,240,.3)':`1px solid ${C.border}`, background: movView===v?'rgba(139,127,240,.18)':'#1a1a2e', color: movView===v?'#b0a8ff':'#8888b8' }}>{i===0?'Lista':'Caja'}</button>)}
              </div>

              {movView === 'lista' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {movFiltered.length === 0 ? <div style={{ textAlign: 'center', padding: '32px', color: C.muted, fontSize: '14px' }}>No hay movimientos este mes</div> :
                    movFiltered.map(t => (
                      <div key={t.id} onClick={() => setEditTx(t)} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: t.type === 'ingreso' ? 'rgba(74,222,128,.15)' : 'rgba(248,113,113,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          {t.type === 'ingreso' ? '↑' : '↓'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                          <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{t.date.slice(5).replace('-','/')} · {t.category_name || '—'} · {t.payment_method || '—'}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: t.type === 'ingreso' ? C.green : C.red, flexShrink: 0 }}>{t.type === 'ingreso' ? '+' : '-'}{fmtM(t.amount)}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto' }}>
                    {['hoy','7d','15d','30d'].map(f => <button key={f} onClick={() => setCajaF(f)} style={{ padding: '7px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', border: cajaF===f?'none':`1px solid ${C.border}`, background: cajaF===f?'linear-gradient(135deg,#8b7ff0,#6a8af0)':'#1a1a2e', color: cajaF===f?'white':'#8888b8' }}>{f==='hoy'?'Hoy':f==='7d'?'7 días':f==='15d'?'15 días':'30 días'}</button>)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {[{ l: 'Ingresos', v: fmt(cajaIng), c: C.purple }, { l: 'Egresos', v: fmt(cajaEg), c: C.red }, { l: 'Disponible', v: fmt(cajaIng-cajaEg), c: C.green }, { l: 'Transacciones', v: cajaTx.length, c: C.text }].map((c,i) => (
                      <div key={i} style={{ ...card, padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{c.l}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px', color: c.c }}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                  {[{ title: 'Por método — Ingresos', data: byMethod('ingreso'), color: C.green }, { title: 'Por método — Egresos', data: byMethod('egreso'), color: C.red }].map((sec,i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>{sec.title}</div>
                      <div style={{ ...card, overflow: 'hidden' }}>
                        {sec.data.length === 0 ? <div style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: C.muted }}>Sin movimientos</div> :
                          sec.data.map(([pm,amt]) => (
                            <div key={pm} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(37,37,53,.4)' }}>
                              <span style={{ fontSize: '14px', color: '#c0c0e0' }}>{pm}</span>
                              <span style={{ fontWeight: 700, fontSize: '14px', color: sec.color }}>{fmt(amt)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* REPORTES */}
          {page === 'reportes' && (
            <div style={pageStyle}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '4px' }}>Reportes</div>
                <div style={{ fontSize: '12px', color: C.sub }}>{MONTHS[month]} {year}</div>
              </div>

              <div style={{ display: 'flex', gap: '4px', background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '3px', marginBottom: '16px', overflowX: 'auto' }}>
                {['resumen','gastos','ingresos','pareto'].map(t => <button key={t} onClick={() => setRTab(t)} style={{ flex: 1, padding: '8px 6px', borderRadius: '9px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, border: rTab===t?`1px solid ${C.border}`:'none', background: rTab===t?C.card:'transparent', color: rTab===t?C.text:'#7070b0', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t==='pareto'?'Pareto':t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
              </div>

              {rTab === 'resumen' && <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  {[{ l: 'Ingresos', v: fmtM(ing), c: C.purple }, { l: 'Egresos', v: fmtM(eg), c: C.red }, { l: 'Neto', v: fmtM(util), c: C.green }, { l: 'Margen', v: `${margin}%`, c: C.text }].map((k,i) => (
                    <div key={i} style={{ ...card, padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{k.l}</div>
                      <div style={{ fontWeight: 700, fontSize: '1.4rem', marginTop: '5px', color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...card, padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>Evolución {year}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
                    {byMonthData.map((m,i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1px', justifyContent: 'center' }}>
                        <div style={{ width: '48%', height: `${m.ing/maxV*70}px`, background: C.primary, borderRadius: '2px 2px 0 0', minHeight: m.ing>0?'3px':'0' }} />
                        <div style={{ width: '48%', height: `${m.eg/maxV*70}px`, background: C.red, borderRadius: '2px 2px 0 0', minHeight: m.eg>0?'3px':'0' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>{MONTHS.map((_,i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '7px', color: C.muted }}>{MONTHS[i].slice(0,1)}</div>)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ ...card, padding: '14px' }}><div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase' }}>Acum. ingresos</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: C.purple, marginTop: '4px' }}>{fmtM(totIng)}</div></div>
                  <div style={{ ...card, padding: '14px' }}><div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase' }}>Mejor mes</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: C.green, marginTop: '4px' }}>{MONTHS[bestM].slice(0,3)}</div></div>
                </div>
              </>}

              {(rTab === 'gastos' || rTab === 'ingresos') && (() => {
                const isIng = rTab === 'ingresos'
                const items = isIng ? groupBy('ingreso') : groupBy('egreso')
                const catItems = isIng ? groupByCat('ingreso') : groupByCat('egreso')
                const total = isIng ? ing : eg
                const color = isIng ? C.purple : C.red
                return <>
                  <div style={{ fontWeight: 700, fontSize: '28px', letterSpacing: '-.04em', marginBottom: '16px', color }}>{fmt(total)}</div>
                  <div style={{ ...card, padding: '16px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>Por categoría</div>
                    <DonutChart items={catItems} total={total} size={120} />
                  </div>
                  <div style={{ ...card, padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>Detalle</div>
                    {items.length === 0 ? <div style={{ textAlign: 'center', color: C.muted, fontSize: '14px', padding: '20px' }}>Sin datos</div> :
                      items.map((it,i) => { const pct = total>0?Math.round(it.amount/total*100):0; return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', flex: 1, color: '#c0c0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
                          <div style={{ width: '60px', height: '5px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px' }} /></div>
                          <span style={{ fontSize: '12px', color: C.muted, minWidth: '28px' }}>{pct}%</span>
                          <span style={{ fontWeight: 700, fontSize: '13px', color, minWidth: '70px', textAlign: 'right' }}>{fmtM(it.amount)}</span>
                        </div>
                      )})}
                  </div>
                </>
              })()}

              {rTab === 'pareto' && <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {[{ v: 'ingresos', l: '📈 Ingresos' }, { v: 'egresos', l: '📉 Egresos' }].map(b => <button key={b.v} onClick={() => setParetoV(b.v)} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: paretoV===b.v?(b.v==='ingresos'?'1px solid rgba(139,127,240,.35)':'1px solid rgba(248,113,113,.3)'):`1px solid ${C.border}`, background: paretoV===b.v?(b.v==='ingresos'?'rgba(139,127,240,.15)':'rgba(248,113,113,.1)'):'#1a1a2e', color: paretoV===b.v?(b.v==='ingresos'?C.purple:C.red):'#8888b8' }}>{b.l}</button>)}
                </div>
                <div style={{ ...card, padding: '16px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>Análisis Pareto 80/20</div>
                    <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}><span style={{ color: C.text, fontWeight: 600 }}>{countTop}</span> de {rItems.length} fuentes = <span style={{ color: rColor, fontWeight: 700 }}>{pctTop}%</span></div>
                  </div>
                  {rCalc.length === 0 ? <div style={{ textAlign: 'center', color: C.muted, fontSize: '14px', padding: '20px' }}>Sin datos</div> :
                    rCalc.map((it,i) => {
                      const isTop = i < countTop
                      const bw = rItems[0]?.amount>0?Math.round(it.amount/rItems[0].amount*100):0
                      return (
                        <div key={i}>
                          {i===countTop && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 12px' }}><div style={{ flex: 1, height: '1px', background: 'rgba(139,127,240,.25)' }} /><span style={{ fontSize: '11px', color: C.primary, fontWeight: 600 }}>80% alcanzado</span><div style={{ flex: 1, height: '1px', background: 'rgba(139,127,240,.25)' }} /></div>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', opacity: isTop?1:0.4 }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, background: isTop?rBarC:'#1a1a2e', color: isTop?'white':C.muted }}>{it.rank}</div>
                            <div style={{ fontSize: '13px', fontWeight: 500, flex: 1, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                            <div style={{ width: '60px', height: '5px', background: '#1a1a2e', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${bw}%`, background: isTop?rBarC:'#2a2a3e', borderRadius: '99px' }} /></div>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: isTop?rColor:C.muted, minWidth: '70px', textAlign: 'right' }}>{fmtM(it.amount)}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </>}
            </div>
          )}

          {/* PRESUPUESTO */}
          {page === 'presupuesto' && (() => {
            const spaceCats2 = cats.filter(c => (c.space === space || c.space === 'ambos') && c.type !== 'ingreso')
            const withBudget = spaceCats2.map(c => {
              const budget = budgets.find(b => b.category_name === c.name)
              const spent = txMonth.filter(t => t.type === 'egreso' && t.category_name === c.name).reduce((s, t) => s + t.amount, 0)
              const limit = budget?.limit_amount || 0
              const pct = limit > 0 ? Math.min(100, Math.round(spent / limit * 100)) : 0
              return { ...c, spent, limit, pct, warning: pct >= 80 && pct < 100, over: pct >= 100, budgetId: budget?.id }
            }).filter(c => c.limit > 0)
            const withoutBudget = spaceCats2.filter(c => !budgets.find(b => b.category_name === c.name))
            return (
              <div style={{ padding: '16px', paddingBottom: '120px' }}>
                <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '4px' }}>Presupuesto</div>
                <div style={{ fontSize: '12px', color: C.sub, marginBottom: '16px' }}>{MONTHS[month]} {year}</div>

                {withBudget.length === 0 && (
                  <div style={{ ...card, padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>Sin límites configurados</div>
                    <div style={{ fontSize: '12px', color: C.muted }}>Agrega un límite a tus categorías</div>
                  </div>
                )}

                {withBudget.map((c, i) => (
                  <div key={i} style={{ ...card, padding: '14px 16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{c.name}</span>
                        {c.warning && <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(251,191,36,.15)', color: '#fbbf24', fontWeight: 600 }}>⚠ 80%+</span>}
                        {c.over && <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(248,113,113,.15)', color: C.red, fontWeight: 600 }}>🚨 Superado</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: c.over ? C.red : c.warning ? '#fbbf24' : C.muted }}>{fmtM(c.spent)} / {fmtM(c.limit)}</span>
                        <button onClick={() => c.budgetId && deleteBudget(c.budgetId)} style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px' }}>×</button>
                      </div>
                    </div>
                    <div style={{ background: '#1a1a2e', height: '8px', borderRadius: '99px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ height: '100%', width: `${c.pct}%`, background: c.over ? C.red : c.warning ? '#fbbf24' : c.color, borderRadius: '99px', transition: 'width .3s' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: c.over ? C.red : c.warning ? '#fbbf24' : C.muted }}>{c.pct}% utilizado</div>
                  </div>
                ))}

                <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px', marginTop: '8px' }}>
                  {withBudget.length > 0 ? 'Agregar más categorías' : 'Tus categorías de gasto'}
                </div>
                {withoutBudget.map((c, i) => (
                  <BudgetCatRow key={i} cat={c} onSave={(amt) => upsertBudget(c.name, amt)} C={C} card={card} />
                ))}

                <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px', marginTop: '14px' }}>Categoría personalizada</div>
                <BudgetCustomRowMobile onSave={(name, amt) => upsertBudget(name, amt)} />
              </div>
            )
          })()}

          {/* AJUSTES */}
          {page === 'ajustes' && (
            <div style={pageStyle}>
              {!adjSub ? <>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: C.text }}>Ajustes</div>
                  <div style={{ fontSize: '12px', color: C.sub, marginTop: '2px' }}>Personaliza tu experiencia</div>
                </div>

                {!isPro && (
                  <div onClick={() => setShowUpgrade(true)} style={{ ...card, padding: '16px', marginBottom: '16px', cursor: 'pointer', background: 'linear-gradient(135deg,rgba(139,127,240,.15),rgba(106,138,240,.1))', border: '1px solid rgba(139,127,240,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div><div style={{ fontWeight: 700, fontSize: '14px', color: '#b0a8ff' }}>⚡ Clarix Pro</div><div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>$5 USD/mes · Desbloquea todo</div></div>
                    <div style={{ fontSize: '20px', color: '#8b7ff0' }}>›</div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'perfil', l: 'Perfil', d: `${user?.email} · Plan ${isPro ? 'Pro ⚡' : 'Free'}`, ic: '👤' },
                    { id: 'presupuesto', l: 'Presupuesto', d: 'Límites por categoría', ic: '💰' },
                    { id: 'categorias', l: 'Categorías', d: `${spaceCats.length} categorías`, ic: '🏷' },
                    { id: 'pagos', l: 'Métodos de pago', d: `${pms.length} métodos`, ic: '💳' },
                    ...(isAdmin ? [{ id: 'admin', l: 'Panel Admin', d: 'Gestión de usuarios', ic: '👑' }] : []),
                  ].map(item => (
                    <div key={item.id} onClick={() => ['admin','presupuesto'].includes(item.id) ? setPage(item.id) : setAdjSub(item.id)} style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{item.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 500, color: C.text }}>{item.l}</div>
                        <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{item.d}</div>
                      </div>
                      <div style={{ color: C.muted, fontSize: '18px' }}>›</div>
                    </div>
                  ))}
                </div>

                <button onClick={signOut} style={{ width: '100%', marginTop: '20px', padding: '14px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: '12px', color: C.red, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cerrar sesión</button>
              </> : <>
                <button onClick={() => setAdjSub('')} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '14px', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>Ajustes
                </button>

                {adjSub === 'perfil' && <>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '16px' }}>Perfil</div>
                  <div style={{ ...card, padding: '16px' }}>
                    <label style={lbl}>Email</label>
                    <div style={{ background: '#0f0f1a', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', color: C.muted, fontSize: '14px', marginBottom: '14px' }}>{user?.email}</div>
                    <label style={lbl}>Plan</label>
                    <div style={{ background: '#0f0f1a', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', fontSize: '14px', marginBottom: '14px', color: isPro ? C.green : C.muted }}>{isPro ? '⚡ Pro' : '🔒 Free'}</div>
                    <label style={lbl}>Moneda</label>
                    <select style={{ ...sel, width: '100%', fontSize: '15px' }}><option>COP — Peso colombiano</option><option>USD — Dólar</option><option>CLP — Peso chileno</option><option>MXN — Peso mexicano</option><option>PEN — Sol peruano</option></select>
                  </div>
                </>}

                {adjSub === 'categorias' && <>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '16px' }}>Categorías</div>
                  <div style={{ ...card, padding: '16px', marginBottom: '12px' }}>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {spaceCats.map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(37,37,53,.5)' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '14px', flex: 1, color: '#c0c0e0' }}>{c.name}</span>
                          <span style={{ fontSize: '10px', color: C.muted, background: '#1a1a2e', padding: '3px 8px', borderRadius: '99px' }}>{c.type}</span>
                          {!c.is_default && <button onClick={() => delCat(c.id)} style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px' }}>×</button>}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="Nueva categoría..." style={{ flex: 1, background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
                      <select value={newCatType} onChange={e => setNewCatType(e.target.value)} style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, color: C.text, borderRadius: '10px', padding: '8px 10px', fontSize: '12px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select>
                      <button onClick={addCat} style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </>}

                {adjSub === 'pagos' && <>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: C.text, marginBottom: '16px' }}>Métodos de pago</div>
                  <div style={{ ...card, padding: '16px' }}>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {pms.map(pm => (
                        <div key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(37,37,53,.5)' }}>
                          <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{pm.name==='Efectivo'?'💵':pm.name==='Transferencia'?'💳':pm.name==='Nequi'?'🟢':pm.name==='Daviplata'?'🔵':pm.name==='Tarjeta'?'💳':'💰'}</span>
                          <span style={{ fontSize: '14px', flex: 1, color: '#c0c0e0' }}>{pm.name}</span>
                          {!pm.is_default && <button onClick={() => delPM(pm.id)} style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px' }}>×</button>}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <input value={newPM} onChange={e => setNewPM(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPM()} placeholder="Nueva forma de pago..." style={{ flex: 1, background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
                      <button onClick={addPM} style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </>}
              </>}
            </div>
          )}

          {/* ADMIN */}
          {page === 'admin' && isAdmin && (
            <div style={pageStyle}>
              <button onClick={() => setPage('ajustes')} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '14px', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>Ajustes
              </button>
              <AdminPage />
            </div>
          )}
        </>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '500px', background: C.sbg, borderTop: `1px solid ${C.border}`, zIndex: 50 }}>
        {/* Space toggle */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '6px 16px 4px' }}>
          <div style={{ display: 'flex', background: '#18182a', borderRadius: '8px', padding: '2px', border: '1px solid #2a2a3e', width: '100%' }}>
            {(['personal', 'empresa'] as Space[]).map(s => (
              <button key={s} onClick={() => setSpace(s)} style={{ flex: 1, padding: '5px 0', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: space === s ? 'linear-gradient(135deg,#8b7ff0,#6a8af0)' : 'transparent', color: space === s ? '#fff' : '#7070b0' }}>
                {s === 'personal' ? '👤 Personal' : '🏢 Empresa'}
              </button>
            ))}
          </div>
        </div>
        {/* Nav items */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 0 max(10px, env(safe-area-inset-bottom))' }}>
          {[
            { id: 'inicio', l: 'Inicio', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
            { id: 'movimientos', l: 'Movs.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> },
            { id: '__add__', l: '', icon: null },
            { id: 'presupuesto', l: 'Presup.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/></svg> },
            { id: 'reportes', l: 'Reportes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
            { id: 'ajustes', l: 'Ajustes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
          ].map(item => {
            if (item.id === '__add__') return (
              <button key="add" onClick={() => isPro ? setShowRegister(true) : setShowUpgrade(true)} style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(139,127,240,.5)', marginTop: '-18px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            )
            const active = page === item.id
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontFamily: 'inherit', color: active ? C.primary : '#6060a0' }}>
                {item.icon}
                <span style={{ fontSize: '9px', fontWeight: active ? 600 : 400 }}>{item.l}</span>
              </button>
            )
          })}
        </div>
      </div>

      {showRegister && <RegisterModal pms={pms} space={space} cats={cats} onAdd={addTx} onClose={() => setShowRegister(false)} />}
      {editTx && <EditModal tx={editTx} pms={pms} space={space} cats={cats} onSave={async (data) => { await updateTx(editTx.id, data); setEditTx(null) }} onDelete={async () => { await delTx(editTx.id); setEditTx(null) }} onClose={() => setEditTx(null)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  )
}

function AppRoot() {
  const { user, loading } = useAuth()
  const [view, setView] = useState<'login' | 'register'>('login')
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <img src={LOGO} style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 14px', display: 'block' }} alt="Clarix" />
        <div style={{ color: '#6060a0', fontSize: '13px' }}>Cargando Clarix...</div>
      </div>
    </div>
  )
  if (!user) return view === 'register'
    ? <RegisterPage onLogin={() => setView('login')} />
    : <LoginPage onReg={() => setView('register')} />
  return <MainApp />
}
