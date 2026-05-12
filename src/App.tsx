import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { createClient, User } from '@supabase/supabase-js'

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
const btnStyle: React.CSSProperties = { padding: '7px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', fontFamily: 'inherit' }
const inp: React.CSSProperties = { width: '100%', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '10px', padding: '12px 14px', color: C.text, fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '12px', colorScheme: 'dark' }
const sel: React.CSSProperties = { ...inp, marginBottom: 0, cursor: 'pointer' }
const card: React.CSSProperties = { background: C.card, borderRadius: '14px', border: `1px solid ${C.border}` }
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }

// ── AUTH ──────────────────────────────────────────────────────────────────────
interface AuthCtx { user: User | null; loading: boolean; signIn: (e: string, p: string) => Promise<{ error: any }>; signUp: (e: string, p: string, n: string) => Promise<{ error: any }>; signOut: () => Promise<void> }
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
function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error('useAuth'); return c }

// ── GEMINI ────────────────────────────────────────────────────────────────────
async function geminiSuggestCategory(desc: string, cats: Cat[]): Promise<string | null> {
  try {
    if (!desc.trim() || cats.length === 0) return null
    const res = await fetch('/api/gemini', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Categoriza este movimiento financiero. Responde SOLO con el nombre exacto de la categoría.\nMovimiento: "${desc}"\nCategorías: ${cats.map(c => c.name).join(', ')}\nCategoría:` }] }], generationConfig: { maxOutputTokens: 20, temperature: 0.1 } })
    })
    const data = await res.json()
    const suggested = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return cats.find(c => c.name.toLowerCase() === suggested?.toLowerCase())?.name || null
  } catch { return null }
}

async function geminiParseAudio(text: string, cats: Cat[]): Promise<{ description: string; amount: number; type: TxType; category_name?: string } | null> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Extrae los datos de este movimiento financiero hablado. Responde SOLO con JSON válido sin markdown.\nTexto: "${text}"\nCategorías disponibles: ${cats.map(c => c.name).join(', ')}\nFormato: {"description":"nombre del gasto/ingreso","amount":numero,"type":"ingreso o egreso","category_name":"categoría o null"}` }] }],
        generationConfig: { maxOutputTokens: 100, temperature: 0.1 }
      })
    })
    const data = await res.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    const clean = raw?.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch { return null }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onReg }: { onReg: () => void }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState(''); const [showPw, setShowPw] = useState(false)
  const submit = async () => { if (!email || !pw) return; setLoading(true); setErr(''); const { error } = await signIn(email, pw); if (error) setErr('Email o contraseña incorrectos'); setLoading(false) }
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(139,127,240,.5)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-.03em' }}>Clarix</h1>
          <p style={{ color: C.muted, fontSize: '15px', margin: 0 }}>Tu copiloto financiero</p>
        </div>
        <div style={{ ...card, padding: '28px' }}>
          {err && <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: '10px', padding: '12px', color: C.red, fontSize: '14px', marginBottom: '16px' }}>{err}</div>}
          <label style={lbl}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="tu@email.com" style={inp} />
          <label style={lbl}>Contraseña</label>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••" style={{ ...inp, marginBottom: 0, paddingRight: '44px' }} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              {showPw ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>
          <button onClick={submit} disabled={loading} style={{ ...btnStyle, width: '100%', padding: '15px', fontSize: '16px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Iniciando...' : 'Iniciar sesión'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: C.muted, fontSize: '15px' }}>
          ¿No tienes cuenta? <button onClick={onReg} style={{ background: 'none', border: 'none', color: C.purple, cursor: 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit' }}>Crear cuenta</button>
        </p>
      </div>
    </div>
  )
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const { signUp } = useAuth()
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState(''); const [ok, setOk] = useState(false); const [showPw, setShowPw] = useState(false)
  if (ok) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: C.text, marginBottom: '10px', fontSize: '22px' }}>¡Cuenta creada!</h2>
        <p style={{ color: C.muted, marginBottom: '28px', fontSize: '15px' }}>Ya puedes iniciar sesión.</p>
        <button onClick={onLogin} style={{ ...btnStyle, padding: '14px 32px', fontSize: '15px', borderRadius: '12px' }}>Ir al login</button>
      </div>
    </div>
  )
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(139,127,240,.5)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-.03em' }}>Clarix</h1>
          <p style={{ color: C.muted, fontSize: '15px', margin: 0 }}>Crea tu cuenta gratis</p>
        </div>
        <div style={{ ...card, padding: '28px' }}>
          {err && <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: '10px', padding: '12px', color: C.red, fontSize: '14px', marginBottom: '16px' }}>{err}</div>}
          <label style={lbl}>Nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={inp} />
          <label style={lbl}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={inp} />
          <label style={lbl}>Contraseña</label>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ ...inp, marginBottom: 0, paddingRight: '44px' }} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              {showPw ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>
          <button onClick={async () => {
            if (!name || !email || pw.length < 6) { setErr('Completa todos los campos (contraseña mín. 6 caracteres)'); return }
            setLoading(true); setErr('')
            const { error } = await signUp(email, pw, name)
            if (error) setErr(error.message || 'Error al crear cuenta')
            else setOk(true)
            setLoading(false)
          }} disabled={loading} style={{ ...btnStyle, width: '100%', padding: '15px', fontSize: '16px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: C.muted, fontSize: '15px' }}>
          ¿Ya tienes cuenta? <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.purple, cursor: 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit' }}>Iniciar sesión</button>
        </p>
      </div>
    </div>
  )
}

// ── UPGRADE MODAL ─────────────────────────────────────────────────────────────
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,10,.9)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: '500px', boxShadow: '0 -8px 40px rgba(0,0,0,.7)', fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#2a2a3e', borderRadius: '99px', margin: '0 auto 24px' }} />
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '44px', marginBottom: '10px' }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: '22px', color: C.text, marginBottom: '6px' }}>Clarix Pro</div>
          <div style={{ fontSize: '14px', color: C.muted }}>Desbloquea todo por solo $5 USD/mes</div>
        </div>
        <div style={{ ...card, padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: C.text, letterSpacing: '-.04em' }}>$5 <span style={{ fontSize: '16px', color: C.muted, fontWeight: 400 }}>USD/mes</span></div>
        </div>
        {['✅ Movimientos ilimitados', '✅ Audio para registrar', '✅ IA autocategorización', '✅ Presupuesto por categoría', '✅ Reportes y Pareto 80/20'].map((f, i) => (
          <div key={i} style={{ fontSize: '14px', color: '#c0c0e0', marginBottom: '8px' }}>{f}</div>
        ))}
        <a href={`mailto:${ADMIN_EMAIL}?subject=Quiero%20Clarix%20Pro`} style={{ display: 'block', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', color: '#fff', textDecoration: 'none', textAlign: 'center', marginTop: '20px', marginBottom: '10px' }}>
          Suscribirme por $5/mes →
        </a>
        <button onClick={onClose} style={{ width: '100%', padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Ahora no</button>
      </div>
    </div>
  )
}

// ── REGISTER MODAL (bottom sheet) ─────────────────────────────────────────────
function RegisterModal({ pms, space, cats, onAdd, onClose }: { pms: PM[]; space: Space; cats: Cat[]; onAdd: (tx: any) => Promise<void>; onClose: () => void }) {
  const [step, setStep] = useState<'menu' | 'form' | 'audio'>('menu')
  const [type, setType] = useState<TxType>('egreso')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [pm, setPm] = useState(pms[0]?.name || '')
  const [selectedCat, setSelectedCat] = useState('')
  const [catSuggestion, setCatSuggestion] = useState<string | null>(null)
  const [sugLoading, setSugLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioFb, setAudioFb] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')

  useEffect(() => {
    if (!desc.trim() || desc.length < 3) { setCatSuggestion(null); return }
    const t = setTimeout(async () => {
      setSugLoading(true)
      const s = await geminiSuggestCategory(desc, spaceCats.filter(c => type === 'ingreso' ? c.type === 'ingreso' : c.type !== 'ingreso'))
      setCatSuggestion(s); if (s && !selectedCat) setSelectedCat(s)
      setSugLoading(false)
    }, 800)
    return () => clearTimeout(t)
  }, [desc, type])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setAudioFb('🤖 Analizando con IA...')
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = async () => {
          // Use Web Speech API result or fallback
          setAudioFb('✅ Procesando texto...')
        }
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
      setAudioFb('🎙 Grabando... toca de nuevo para detener')
    } catch { setAudioFb('❌ No se pudo acceder al micrófono') }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { setAudioFb('❌ Tu navegador no soporta reconocimiento de voz'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-CO'
    recognition.continuous = false
    recognition.interimResults = false
    setRecording(true)
    setAudioFb('🎙 Habla ahora...')
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript
      setAudioFb(`📝 "${text}" — Analizando...`)
      setRecording(false)
      const parsed = await geminiParseAudio(text, spaceCats)
      if (parsed) {
        setDesc(parsed.description)
        setAmount(String(parsed.amount))
        setType(parsed.type)
        if (parsed.category_name) setSelectedCat(parsed.category_name)
        setAudioFb(`✅ Detectado: ${parsed.description} $${parsed.amount.toLocaleString('es-CO')}`)
        setStep('form')
      } else {
        setAudioFb('❌ No se pudo interpretar. Intenta de nuevo.')
      }
    }
    recognition.onerror = () => { setAudioFb('❌ Error al escuchar. Intenta de nuevo.'); setRecording(false) }
    recognition.onend = () => setRecording(false)
    recognition.start()
  }

  const save = async () => {
    if (!desc || !amount) return
    setSaving(true)
    await onAdd({ space, date, type, description: desc, amount: Number(amount), payment_method: pm, category_name: selectedCat || undefined })
    setSaving(false)
    onClose()
  }

  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(5,5,10,.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }
  const sheet: React.CSSProperties = { background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#2a2a3e', borderRadius: '99px', margin: '0 auto 20px' }} />

        {step === 'menu' && (
          <>
            <div style={{ fontWeight: 700, fontSize: '18px', color: C.text, marginBottom: '20px', textAlign: 'center' }}>¿Cómo registrar?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[{ id: 'manual', ic: '✏️', l: 'Manual', d: 'Escribe los datos' }, { id: 'audio', ic: '🎙', l: 'Audio', d: 'Habla y la IA lo registra' }].map(o => (
                <div key={o.id} onClick={() => { if (o.id === 'manual') setStep('form'); else setStep('audio') }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 16px', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{o.ic}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{o.l}</div>
                  <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px' }}>{o.d}</div>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          </>
        )}

        {step === 'audio' && (
          <>
            <div style={{ fontWeight: 700, fontSize: '18px', color: C.text, marginBottom: '8px', textAlign: 'center' }}>Registrar por voz</div>
            <div style={{ fontSize: '13px', color: C.muted, textAlign: 'center', marginBottom: '28px' }}>Di algo como: "Gasté 50 mil en comida" o "Cobré 200 mil por consultoría"</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <button onClick={recording ? stopRecording : startSpeechRecognition} style={{ width: '100px', height: '100px', borderRadius: '50%', border: 'none', background: recording ? C.red : 'linear-gradient(135deg,#8b7ff0,#6a8af0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: recording ? `0 0 30px ${C.red}66` : '0 0 30px rgba(139,127,240,.5)', transition: 'all .2s' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              {audioFb && <div style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: C.purple, textAlign: 'center', width: '100%' }}>{audioFb}</div>}
            </div>
            <button onClick={() => setStep('menu')} style={{ width: '100%', padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>← Volver</button>
          </>
        )}

        {step === 'form' && (
          <>
            <div style={{ fontWeight: 700, fontSize: '18px', color: C.text, marginBottom: '16px' }}>Nueva transacción</div>
            {audioFb && <div style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: C.purple, marginBottom: '14px' }}>{audioFb}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={lbl}>Tipo</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['egreso', 'ingreso'] as TxType[]).map(t => (
                    <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: type === t ? (t === 'ingreso' ? 'rgba(74,222,128,.2)' : 'rgba(248,113,113,.2)') : '#1a1a2e', color: type === t ? (t === 'ingreso' ? C.green : C.red) : C.muted }}>
                      {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, marginBottom: 0, padding: '10px 12px', fontSize: '13px' }} />
              </div>
            </div>

            <label style={lbl}>Descripción</label>
            <input value={desc} onChange={e => { setDesc(e.target.value); setCatSuggestion(null) }} placeholder="Ej: Comida, Arriendo, Consultoría..." style={inp} />

            {(catSuggestion || sugLoading) && (
              <div style={{ marginTop: '-8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sugLoading ? <span style={{ fontSize: '12px', color: C.muted }}>✨ Analizando categoría...</span> : catSuggestion ? <>
                  <span style={{ fontSize: '12px', color: C.muted }}>✨ Sugerida:</span>
                  <button onClick={() => setSelectedCat(catSuggestion)} style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${selectedCat === catSuggestion ? C.primary : 'rgba(139,127,240,.4)'}`, background: selectedCat === catSuggestion ? 'rgba(139,127,240,.2)' : 'transparent', color: C.purple, fontFamily: 'inherit' }}>{catSuggestion} {selectedCat === catSuggestion ? '✓' : ''}</button>
                </> : null}
              </div>
            )}

            <label style={lbl}>Categoría</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...sel, marginBottom: '14px', width: '100%', fontSize: '15px' }}>
              <option value="">Sin categoría</option>
              {spaceCats.filter(c => type === 'ingreso' ? c.type === 'ingreso' : c.type !== 'ingreso').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            <label style={lbl}>Monto</label>
            <input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ ...inp, fontSize: '24px', fontWeight: 700, textAlign: 'center' }} />

            <label style={lbl}>Forma de pago</label>
            <select value={pm} onChange={e => setPm(e.target.value)} style={{ ...sel, marginBottom: '20px', width: '100%', fontSize: '15px' }}>
              {pms.map(p => <option key={p.id}>{p.name}</option>)}
            </select>

            <button onClick={save} disabled={saving || !desc || !amount} style={{ ...btnStyle, width: '100%', padding: '16px', fontSize: '16px', borderRadius: '14px', opacity: (saving || !desc || !amount) ? 0.5 : 1, marginBottom: '10px' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
            <button onClick={() => setStep('menu')} style={{ width: '100%', padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>← Volver</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function EditModal({ tx, pms, space, cats, onSave, onDelete, onClose }: { tx: Tx; pms: PM[]; space: Space; cats: Cat[]; onSave: (data: any) => Promise<void>; onDelete: () => Promise<void>; onClose: () => void }) {
  const [type, setType] = useState<TxType>(tx.type)
  const [date, setDate] = useState(tx.date)
  const [desc, setDesc] = useState(tx.description)
  const [amount, setAmount] = useState(String(tx.amount))
  const [pm, setPm] = useState(tx.payment_method || pms[0]?.name || '')
  const [selectedCat, setSelectedCat] = useState(tx.category_name || '')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const spaceCats = cats.filter(c => c.space === space || c.space === 'ambos')
  const filteredCats = spaceCats.filter(c => type === 'ingreso' ? c.type === 'ingreso' : c.type !== 'ingreso')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,10,.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#17172a', border: '1px solid #2a2a3e', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#2a2a3e', borderRadius: '99px', margin: '0 auto 20px' }} />
        <div style={{ fontWeight: 700, fontSize: '18px', color: C.text, marginBottom: '4px' }}>Editar</div>
        <div style={{ fontSize: '12px', color: C.muted, marginBottom: '16px' }}>{tx.date} · {tx.description}</div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {(['egreso', 'ingreso'] as TxType[]).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: type === t ? (t === 'ingreso' ? 'rgba(74,222,128,.2)' : 'rgba(248,113,113,.2)') : '#1a1a2e', color: type === t ? (t === 'ingreso' ? C.green : C.red) : C.muted }}>
              {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
            </button>
          ))}
        </div>

        <label style={lbl}>Descripción</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} style={inp} />
        <label style={lbl}>Monto</label>
        <input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inp, fontSize: '20px', fontWeight: 700, textAlign: 'center' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div><label style={lbl}>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, marginBottom: 0, fontSize: '13px' }} /></div>
          <div><label style={lbl}>Forma de pago</label><select value={pm} onChange={e => setPm(e.target.value)} style={{ ...sel, fontSize: '13px', width: '100%' }}>{pms.map(p => <option key={p.id}>{p.name}</option>)}</select></div>
        </div>
        <label style={lbl}>Categoría</label>
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ ...sel, marginBottom: '20px', width: '100%', fontSize: '15px' }}>
          <option value="">Sin categoría</option>
          {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <button onClick={async () => { if (!desc || !amount) return; setSaving(true); await onSave({ type, date, description: desc, amount: Number(amount), payment_method: pm, category_name: selectedCat || undefined }); setSaving(false) }} disabled={saving} style={{ ...btnStyle, width: '100%', padding: '16px', fontSize: '16px', borderRadius: '14px', marginBottom: '10px', opacity: saving ? 0.6 : 1 }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>

        {!confirming ? (
          <button onClick={() => setConfirming(true)} style={{ width: '100%', padding: '14px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: '12px', color: C.red, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>🗑 Eliminar</button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onDelete} style={{ flex: 1, padding: '14px', background: C.red, border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Sí, eliminar</button>
            <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ADMIN PAGE ────────────────────────────────────────────────────────────────
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
      <button onClick={loadUsers} style={{ ...btnStyle, width: '100%', marginTop: '14px', padding: '12px', fontSize: '13px' }}>↻ Actualizar</button>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function MainApp() {
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
    const { data } = await supabase.from('budgets').upsert({ user_id: user!.id, space, category_name, limit_amount }, { onConflict: 'user_id,space,category_name' }).select().single()
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

  const pageStyle: React.CSSProperties = { padding: '16px', paddingBottom: '90px', minHeight: '100vh', background: C.bg }

  // ── BOTTOM NAV ──
  const navItems = [
    { id: 'inicio', l: 'Inicio', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: 'movimientos', l: 'Movimientos', d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { id: '__add__', l: '', d: '' },
    { id: 'reportes', l: 'Reportes', d: 'M18 20V10M12 20V4M6 20v-6' },
    { id: 'ajustes', l: 'Ajustes', d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.sbg, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: C.text, letterSpacing: '-.02em' }}>Clarix</div>
            <div style={{ fontSize: '10px', color: C.sub }}>
              {isAdmin ? <span style={{ color: '#fbbf24' }}>👑 Admin</span> : isPro ? <span style={{ color: C.green }}>⚡ Pro</span> : <span>Free</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#18182a', borderRadius: '8px', padding: '2px', border: '1px solid #2a2a3e' }}>
            {(['personal', 'empresa'] as Space[]).map(s => (
              <button key={s} onClick={() => setSpace(s)} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: space === s ? 'linear-gradient(135deg,#8b7ff0,#6a8af0)' : 'transparent', color: space === s ? '#fff' : '#7070b0' }}>
                {s === 'personal' ? 'Personal' : 'Empresa'}
              </button>
            ))}
          </div>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '5px 8px', color: C.text, fontSize: '11px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m.slice(0, 3)}</option>)}
          </select>
        </div>
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
                  <div><div style={{ fontWeight: 700, fontSize: '13px', color: '#b0a8ff' }}>⚡ Activa Clarix Pro — $5 USD/mes</div><div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>Registra, usa audio e IA</div></div>
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
                    { id: 'categorias', l: 'Categorías', d: `${spaceCats.length} categorías`, ic: '🏷' },
                    { id: 'pagos', l: 'Métodos de pago', d: `${pms.length} métodos`, ic: '💳' },
                    ...(isAdmin ? [{ id: 'admin', l: 'Panel Admin', d: 'Gestión de usuarios', ic: '👑' }] : []),
                  ].map(item => (
                    <div key={item.id} onClick={() => item.id === 'admin' ? setPage('admin') : setAdjSub(item.id)} style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
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
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '500px', background: C.sbg, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', zIndex: 50 }}>
        {navItems.map((item, i) => {
          if (item.id === '__add__') return (
            <button key="add" onClick={() => isPro ? setShowRegister(true) : setShowUpgrade(true)} style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(139,127,240,.5)', marginTop: '-16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          )
          const active = page === item.id
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 14px', fontFamily: 'inherit' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.primary : '#6060a0'} strokeWidth="2">
                {item.id === 'inicio' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                {item.id === 'movimientos' && <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>}
                {item.id === 'reportes' && <path d="M18 20V10M12 20V4M6 20v-6"/>}
                {item.id === 'ajustes' && <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>}
              </svg>
              <span style={{ fontSize: '10px', color: active ? C.primary : '#6060a0', fontWeight: active ? 600 : 400 }}>{item.l}</span>
            </button>
          )
        })}
      </div>

      {showRegister && <RegisterModal pms={pms} space={space} cats={cats} onAdd={addTx} onClose={() => setShowRegister(false)} />}
      {editTx && <EditModal tx={editTx} pms={pms} space={space} cats={cats} onSave={async (data) => { await updateTx(editTx.id, data); setEditTx(null) }} onDelete={async () => { await delTx(editTx.id); setEditTx(null) }} onClose={() => setEditTx(null)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppRoot /></AuthProvider>
}

function AppRoot() {
  const { user, loading } = useAuth()
  const [view, setView] = useState<'login' | 'register'>('login')
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#8b7ff0,#6a8af0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 28px rgba(139,127,240,.5)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>
        <div style={{ color: '#6060a0', fontSize: '14px' }}>Cargando Clarix...</div>
      </div>
    </div>
  )
  if (!user) return view === 'register' ? <RegisterPage onLogin={() => setView('login')} /> : <LoginPage onReg={() => setView('register')} />
  return <MainApp />
}
