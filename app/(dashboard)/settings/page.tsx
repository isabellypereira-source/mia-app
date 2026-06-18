'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, Lock, CheckCircle, AlertCircle } from 'lucide-react'

const CARGOS = [
  'Pesquisador(a)',
  'Professor(a)',
  'Aluno(a) de graduação',
  'Aluno(a) de pós-graduação',
  'Nutricionista',
  'Chef de cozinha',
  'Técnico(a) de laboratório',
  'Profissional da indústria',
  'Empreendedor(a)',
  'Outro',
]

type Toast = { type: 'ok' | 'err'; msg: string }

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  // Perfil
  const [nome,    setNome]    = useState('')
  const [tel,     setTel]     = useState('')
  const [cargo,   setCargo]   = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email,   setEmail]   = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Senha
  const [novaSenha,    setNovaSenha]    = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [savingPwd,    setSavingPwd]    = useState(false)

  const [toast, setToast] = useState<Toast | null>(null)

  function showToast(t: Toast) {
    setToast(t)
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = (data.user?.user_metadata || {}) as {
        nome?: string; tel?: string; cargo?: string; empresa?: string
      }
      setNome(meta.nome   || '')
      setTel(meta.tel     || '')
      setCargo(meta.cargo || '')
      setEmpresa(meta.empresa || '')
      setEmail(data.user?.email || '')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({ data: { nome, tel, cargo, empresa } })
    setSavingProfile(false)
    showToast(error
      ? { type: 'err', msg: 'Erro ao salvar. Tente novamente.' }
      : { type: 'ok', msg: 'Perfil atualizado com sucesso.' }
    )
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmSenha) {
      showToast({ type: 'err', msg: 'As senhas não coincidem.' })
      return
    }
    if (novaSenha.length < 8) {
      showToast({ type: 'err', msg: 'A senha precisa ter pelo menos 8 caracteres.' })
      return
    }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSavingPwd(false)
    if (error) {
      showToast({ type: 'err', msg: 'Erro ao alterar senha. Tente novamente.' })
    } else {
      showToast({ type: 'ok', msg: 'Senha alterada com sucesso.' })
      setNovaSenha('')
      setConfirmSenha('')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="h-full overflow-y-auto prof-page">
      <style>{PROF_CSS}</style>

      {/* Toast */}
      {toast && (
        <div className={`prof-toast ${toast.type}`}>
          {toast.type === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="prof-header">
        <h1>Meu <em>perfil</em></h1>
        <p>Atualize seus dados de cadastro a qualquer momento.</p>
      </div>

      <div className="prof-root">

        {/* ── Dados pessoais ── */}
        <section className="prof-card">
          <div className="prof-card-head">
            <div className="prof-icon"><User size={16} /></div>
            <div>
              <h2>Dados pessoais</h2>
              <p>Nome, contato, cargo e instituição</p>
            </div>
          </div>

          <form onSubmit={salvarPerfil}>
            <div className="prof-row2">
              <div className="prof-field">
                <label>Nome completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                  required placeholder="Seu nome" />
              </div>
              <div className="prof-field">
                <label>Telefone</label>
                <input type="tel" value={tel} onChange={e => setTel(e.target.value)}
                  placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div className="prof-field">
              <label>Email</label>
              <input type="email" value={email} disabled
                className="prof-disabled" title="O email não pode ser alterado aqui" />
            </div>

            <div className="prof-row2">
              <div className="prof-field">
                <label>Cargo</label>
                <select value={cargo} onChange={e => setCargo(e.target.value)} required>
                  <option value="" disabled>Selecione</option>
                  {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="prof-field">
                <label>Instituição / Empresa</label>
                <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)}
                  required placeholder="Morphê Foods, UNICAMP..." />
              </div>
            </div>

            <div className="prof-actions">
              <button type="submit" disabled={savingProfile} className="prof-save">
                {savingProfile ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Alterar senha ── */}
        <section className="prof-card">
          <div className="prof-card-head">
            <div className="prof-icon accent-warn"><Lock size={16} /></div>
            <div>
              <h2>Alterar senha</h2>
              <p>Mínimo de 8 caracteres</p>
            </div>
          </div>

          <form onSubmit={salvarSenha}>
            <div className="prof-row2">
              <div className="prof-field">
                <label>Nova senha</label>
                <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                  required minLength={8} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <div className="prof-field">
                <label>Confirmar nova senha</label>
                <input type="password" value={confirmSenha} onChange={e => setConfirmSenha(e.target.value)}
                  required minLength={8} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>

            <div className="prof-actions">
              <button type="submit" disabled={savingPwd} className="prof-save">
                {savingPwd ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Sair ── */}
        <section className="prof-card prof-danger">
          <div className="prof-card-head">
            <div className="prof-icon accent-danger"><LogOut size={16} /></div>
            <div>
              <h2>Sessão</h2>
              <p>Encerrar sessão neste dispositivo</p>
            </div>
          </div>
          <button onClick={logout} className="prof-logout">
            <LogOut size={14} /> Sair da conta
          </button>
        </section>

      </div>
    </div>
  )
}

const PROF_CSS = `
  .prof-page{color:var(--text-main)}

  .prof-toast{
    position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;
    display:flex;align-items:center;gap:8px;
    padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,.25);
    animation:toastIn .2s ease-out;
    backdrop-filter:blur(12px);
  }
  .prof-toast.ok{background:var(--icon-tint);border:1px solid var(--accent-em);color:var(--accent-em)}
  .prof-toast.err{background:rgba(250,85,40,.12);border:1px solid rgba(250,85,40,.4);color:#ffb29c}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

  .prof-header{
    border-bottom:1px solid var(--border-glass);
    padding:22px 32px;
  }
  .prof-header h1{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:clamp(26px,3vw,34px);line-height:1.08;letter-spacing:-.015em;
    color:var(--text-main);margin:0 0 4px;
  }
  .prof-header h1 em{font-style:italic;color:var(--accent-em)}
  .prof-header p{font-size:13px;color:var(--text-muted);margin:0}

  .prof-root{
    max-width:760px;margin:0 auto;
    padding:28px 32px 56px;
    display:flex;flex-direction:column;gap:20px;
  }

  .prof-card{
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:20px;padding:24px;
    backdrop-filter:blur(16px);
  }
  .prof-danger{border-color:rgba(250,85,40,.2);background:rgba(250,85,40,.04)}

  .prof-card-head{
    display:flex;align-items:flex-start;gap:14px;margin-bottom:22px;
  }
  .prof-icon{
    width:38px;height:38px;border-radius:12px;flex-shrink:0;
    background:var(--icon-tint);border:1px solid var(--border-glass);
    color:var(--accent-em);display:grid;place-items:center;
  }
  .prof-icon.accent-warn{background:rgba(250,180,50,.08);border-color:rgba(250,180,50,.2);color:#e8b84b}
  .prof-icon.accent-danger{background:rgba(250,85,40,.08);border-color:rgba(250,85,40,.2);color:#fa5528}
  .prof-card-head h2{font-size:15px;font-weight:600;color:var(--text-main);margin:0 0 3px}
  .prof-card-head p{font-size:13px;color:var(--text-muted);margin:0}

  .prof-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .prof-field{display:flex;flex-direction:column;gap:7px;margin-bottom:14px}
  .prof-field label{
    font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
    color:var(--text-faint);
  }
  .prof-field input,.prof-field select{
    background:var(--surface-glass);
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-main);border-radius:12px;
    padding:11px 14px;font-size:14px;font-family:inherit;
    transition:border-color .15s, box-shadow .15s;
  }
  .prof-field input:focus,.prof-field select:focus{
    outline:none;border-color:var(--accent);box-shadow:0 0 0 4px var(--icon-tint);
  }
  .prof-field input::placeholder{color:var(--text-faint)}
  .prof-disabled{opacity:.45;cursor:not-allowed}

  .prof-actions{margin-top:6px;display:flex;justify-content:flex-end}
  .prof-save{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--accent);color:var(--accent-text-on);
    border:none;cursor:pointer;
    padding:11px 24px;border-radius:999px;
    font-family:inherit;font-size:14px;font-weight:600;
    transition:transform .15s, box-shadow .25s, opacity .15s;
  }
  .prof-save:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 28px -10px var(--accent)}
  .prof-save:disabled{opacity:.45;cursor:not-allowed}

  .prof-logout{
    display:inline-flex;align-items:center;gap:8px;
    background:transparent;border:1px solid rgba(250,85,40,.3);
    color:#fa5528;cursor:pointer;padding:10px 20px;border-radius:999px;
    font-family:inherit;font-size:14px;font-weight:500;
    transition:.15s;
  }
  .prof-logout:hover{background:rgba(250,85,40,.1)}

  @media (max-width:640px){
    .prof-root{padding:20px 16px 40px}
    .prof-row2{grid-template-columns:1fr}
  }
`
