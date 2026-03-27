'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Sparkles, Plus, Trash2, CheckCircle, Save, ArrowRight } from 'lucide-react'

type Modo = 'escolha' | 'input' | 'criar' | 'validar'

interface Ingrediente {
  nome: string
  percentual: string
  funcao: string
}

const FUNCOES = ['Estruturante', 'Hidrocolóide', 'Plastificante', 'Emulsificante', 'Aromatizante', 'Corante', 'Conservante', 'Proteína', 'Lipídio', 'Outro']

export default function FormularPage() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>('escolha')
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nome: '', percentual: '', funcao: 'Estruturante' },
  ])
  const [nomeFormulacao, setNomeFormulacao] = useState('')
  const [validando, setValidando] = useState(false)
  const [validacao, setValidacao] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function addIngrediente() {
    setIngredientes(prev => [...prev, { nome: '', percentual: '', funcao: 'Outro' }])
  }

  function removeIngrediente(i: number) {
    setIngredientes(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateIngrediente(i: number, field: keyof Ingrediente, value: string) {
    setIngredientes(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  async function validarFormulacao() {
    setValidando(true)
    setValidacao(null)
    const lista = ingredientes
      .filter(i => i.nome.trim())
      .map(i => `${i.nome} (${i.percentual}%, ${i.funcao})`)
      .join('; ')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Valide esta formulação para impressão 3D de alimentos: ${lista}. Analise: total de sólidos, balanço hidrocolóides, viabilidade de extrusão, pontos críticos e sugestões de ajuste. Seja direto e técnico.`,
          }],
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let texto = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try { texto += JSON.parse(line.slice(2)) } catch { /* skip */ }
            }
          }
        }
      }
      setValidacao(texto || 'Formulação analisada.')
    } catch {
      setValidacao('Erro ao validar. Verifique sua conexão.')
    }
    setValidando(false)
    setModo('validar')
  }

  async function salvarFormulacao() {
    if (!nomeFormulacao.trim()) return
    setSalvando(true)
    const payload = {
      nome: nomeFormulacao,
      ingredientes: ingredientes.filter(i => i.nome.trim()).map(i => ({
        nome: i.nome,
        percentual: parseFloat(i.percentual) || 0,
        funcao: i.funcao,
      })),
      observacoes: validacao || '',
      resultado: null,
      parametros: {},
    }
    await fetch('/api/formulacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSalvando(false)
    router.push('/formulacoes')
  }

  if (modo === 'escolha') {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-xl font-semibold">Formular</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ponto de partida do fluxo MIA. Insira ou crie sua formulação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setModo('input')}
              className="bg-morphe-dark-2 border border-border rounded-xl p-6 text-left hover:border-morphe-orange/40 hover:bg-morphe-dark-3 transition-colors group"
            >
              <FlaskConical size={28} className="text-morphe-orange mb-4" />
              <h2 className="font-semibold text-base mb-1">Tenho uma formulação</h2>
              <p className="text-sm text-muted-foreground">
                Insira os ingredientes e percentuais da sua formulação para validar e salvar.
              </p>
              <div className="flex items-center gap-1 text-morphe-orange text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                Inserir <ArrowRight size={12} />
              </div>
            </button>

            <button
              onClick={() => router.push('/chat')}
              className="bg-morphe-dark-2 border border-border rounded-xl p-6 text-left hover:border-morphe-orange/40 hover:bg-morphe-dark-3 transition-colors group"
            >
              <Sparkles size={28} className="text-morphe-orange mb-4" />
              <h2 className="font-semibold text-base mb-1">Criar com a MIA</h2>
              <p className="text-sm text-muted-foreground">
                Descreva o produto que quer criar e a MIA vai sugerir uma formulação otimizada.
              </p>
              <div className="flex items-center gap-1 text-morphe-orange text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir chat <ArrowRight size={12} />
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (modo === 'input' || modo === 'validar') {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setModo('escolha')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-semibold">Inserir formulação</h1>
          </div>

          {/* Ingredientes */}
          <div className="bg-morphe-dark-2 border border-border rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium">Ingredientes</h2>
              <span className="text-xs text-muted-foreground">
                Total: {ingredientes.reduce((acc, i) => acc + (parseFloat(i.percentual) || 0), 0).toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              {ingredientes.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_140px_32px] gap-2 items-center">
                  <input
                    value={ing.nome}
                    onChange={e => updateIngrediente(i, 'nome', e.target.value)}
                    placeholder="Ingrediente"
                    className="bg-morphe-dark border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
                  />
                  <div className="relative">
                    <input
                      value={ing.percentual}
                      onChange={e => updateIngrediente(i, 'percentual', e.target.value)}
                      placeholder="0"
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                  <select
                    value={ing.funcao}
                    onChange={e => updateIngrediente(i, 'funcao', e.target.value)}
                    className="bg-morphe-dark border border-border rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
                  >
                    {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button
                    onClick={() => removeIngrediente(i)}
                    disabled={ingredientes.length === 1}
                    className="text-muted-foreground hover:text-red-400 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addIngrediente}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-morphe-orange transition-colors"
            >
              <Plus size={13} /> Adicionar ingrediente
            </button>
          </div>

          {/* Resultado da validação */}
          {validacao && (
            <div className="bg-morphe-dark-2 border border-morphe-orange/20 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} className="text-morphe-orange" />
                <span className="text-sm font-medium">Análise da MIA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{validacao}</p>
            </div>
          )}

          {/* Nome e salvar */}
          {modo === 'validar' && (
            <div className="bg-morphe-dark-2 border border-border rounded-xl p-5 mb-4">
              <h2 className="text-sm font-medium mb-3">Salvar formulação</h2>
              <div className="flex gap-3">
                <input
                  value={nomeFormulacao}
                  onChange={e => setNomeFormulacao(e.target.value)}
                  placeholder="Nome da formulação (ex: Pasta de batata-doce v1)"
                  className="flex-1 bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
                />
                <button
                  onClick={salvarFormulacao}
                  disabled={!nomeFormulacao.trim() || salvando}
                  className="flex items-center gap-2 bg-morphe-orange hover:bg-morphe-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
                >
                  <Save size={14} />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            {modo === 'input' && (
              <button
                onClick={validarFormulacao}
                disabled={validando || !ingredientes.some(i => i.nome.trim())}
                className="flex items-center gap-2 bg-morphe-orange hover:bg-morphe-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                <Sparkles size={14} />
                {validando ? 'Validando...' : 'Validar com MIA'}
              </button>
            )}
            {modo === 'validar' && !validacao && (
              <button
                onClick={validarFormulacao}
                disabled={validando}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2.5 border border-border rounded-md transition-colors"
              >
                <Sparkles size={14} />
                {validando ? 'Revalidando...' : 'Revalidar'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
