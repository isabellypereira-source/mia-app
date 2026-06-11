'use client'
import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  { src: '/landing/01.png', caption: 'Da formulação ao prato finalizado.' },
  { src: '/landing/02.png', caption: 'A impressora 3D na bancada da Morphê.' },
  { src: '/landing/03.png', caption: 'Estrutura imprimível com integridade pós-deposição.' },
  { src: '/landing/04.png', caption: 'O produto final, pronto para caracterização.' },
]

const PILLARS = [
  {
    n: '01',
    h: 'Especialista, não generalista',
    p: 'Treinada exclusivamente em impressão 3D de alimentos. Conhece hidrocolóides, reologia, parâmetros de extrusão e adequação nutricional como uma pesquisadora da área.',
  },
  {
    n: '02',
    h: 'Fundamentada em evidência',
    p: 'Toda recomendação tem origem rastreável. A base de conhecimento reúne artigos indexados e protocolos validados, reduzindo o risco de respostas inventadas.',
  },
  {
    n: '03',
    h: 'Conectada à impressora',
    p: 'Integra com o PrusaSlicer e leva sua formulação direto para a impressão. Os resultados voltam para a plataforma e alimentam o seu próximo desenvolvimento.',
  },
  {
    n: '04',
    h: 'Pensada para o seu fluxo',
    p: 'Da hipótese ao POP, a MIA acompanha cada etapa do desenvolvimento e organiza o que você produziu em fichas, gráficos e documentos prontos para usar.',
  },
]

const PAINS = [
  {
    label: 'Problema 01',
    h: 'Desenvolvimento empírico de formulações',
    p: 'O desenvolvimento de pastas imprimíveis ocorre majoritariamente por tentativa e erro, com baixa reprodutibilidade e alto consumo de insumos. A MIA estrutura a composição a partir de princípios de ciência de polímeros alimentares, orientando concentrações, substituições e estratégias de hidratação compatíveis com a imprimibilidade desejada.',
  },
  {
    label: 'Problema 02',
    h: 'Interpretação das propriedades viscoelásticas',
    p: 'A imprimibilidade depende de variáveis reológicas interdependentes, como viscosidade aparente, tensão de escoamento, comportamento tixotrópico e módulo elástico. A MIA apoia a leitura desses dados e correlaciona o perfil viscoelástico com o desempenho esperado durante a extrusão.',
  },
  {
    label: 'Problema 03',
    h: 'Tensão entre imprimibilidade e adequação nutricional',
    p: 'A incorporação de fibras, proteínas e ingredientes funcionais frequentemente altera o comportamento de fluxo da formulação. A MIA conduz a otimização multiobjetivo entre os requisitos reológicos da impressão e os critérios nutricionais do produto final.',
  },
  {
    label: 'Problema 04',
    h: 'Definição empírica de parâmetros de processo',
    p: 'A definição manual de velocidade de extrusão, temperatura do bico, altura de camada e pressão resulta em desperdício de material e inconsistência de qualidade. A MIA correlaciona a composição da formulação com faixas operacionais recomendadas pela literatura e por protocolos validados internamente.',
  },
  {
    label: 'Problema 05',
    h: 'Ausência de protocolos padronizados de caracterização',
    p: 'A manufatura aditiva alimentar ainda carece de métodos consensuais para precisão dimensional, integridade estrutural, ângulo de sobreposição e propriedades texturais. A MIA disponibiliza protocolos curados, orienta cálculos analíticos e interpreta os resultados à luz da literatura técnica disponível.',
  },
  {
    label: 'Problema 06',
    h: 'Fragmentação do conhecimento científico',
    p: 'O conhecimento relevante encontra-se disperso em periódicos especializados, teses e relatórios técnicos, em múltiplos idiomas. A MIA atua como interface de acesso, recuperando e sintetizando informações pertinentes a partir de sua base de dados em linguagem tecnicamente embasada.',
  },
]

const STEPS = [
  { n: 1, h: 'Planeje a formulação', p: 'Descreva o objetivo do produto, o público e as restrições nutricionais. A MIA orienta a escolha de ingredientes, concentrações e estratégia de hidratação.' },
  { n: 2, h: 'Desenvolva com suporte ativo', p: 'Durante a bancada, interpreta o comportamento reológico observado, sugere ajustes e propõe parâmetros de impressão em tempo real.' },
  { n: 3, h: 'Imprima e capture os resultados', p: 'Envie a formulação direto para o PrusaSlicer. O G-code retorna automaticamente para a plataforma e alimenta o histórico de experimentos.' },
  { n: 4, h: 'Caracterize e documente', p: 'Aplica protocolos de caracterização, calcula indicadores de qualidade e gera ficha técnica e procedimento operacional consolidados.' },
]

export default function Landing() {
  const [slide, setSlide] = useState(0)
  const [demoOpen, setDemoOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDemoOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const advance = () => {
    setSlide(s => (s + 1) % SLIDES.length)
    startTimer()
  }

  const openDemo = () => {
    setSubmitted(false)
    setError(null)
    setDemoOpen(true)
  }

  const submitDemo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), phone: form.get('phone') }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'erro')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'erro ao enviar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <main className="landing-root">
        <nav>
          <a className="brand" href="#">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mia-logo.png" alt="MIA" />
            MIA
          </a>
          <ul>
            <li><a href="#por-que">Por que MIA</a></li>
            <li><a href="#o-que-resolve">O que resolve</a></li>
            <li><a href="#como-funciona">Como funciona</a></li>
            <li><a href="#">Morphê Foods</a></li>
          </ul>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/login" className="btn btn-outline">Entrar</a>
            <a href="/login" className="btn btn-lime">Acessar plataforma →</a>
          </div>
        </nav>

        <section className="hero">
          <div>
            <span className="badge"><span className="dot" /> Morphê Intelligence Assistant</span>
            <h1 className="headline">
              Conheça a MIA.<br />
              A primeira <em>inteligência</em> criada para alimentos impressos em 3D.
            </h1>
            <p className="lead">
              Tudo o que você precisa saber para desenvolver um alimento impresso em 3D, em um só lugar. A MIA conversa com você do começo ao fim: ajuda a montar a formulação, entender o que está acontecendo na impressora, corrigir o que não saiu como esperado e organizar tudo em uma ficha técnica pronta.
            </p>
            <div className="cta-row">
              <a href="/login" className="btn btn-lime">Acessar plataforma →</a>
              <button type="button" className="btn btn-outline" onClick={openDemo}>Solicitar demonstração</button>
            </div>
            <div className="meta">
              <span><span className="pulse" /> Base de conhecimento ativa</span>
              <span>Integração com PrusaSlicer</span>
              <span>Desenvolvida pela Morphê Foods</span>
            </div>
          </div>

          <div className="carousel" onMouseEnter={advance}>
            {SLIDES.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s.src} src={s.src} alt={s.caption} className={i === slide ? 'active' : ''} />
            ))}
            <div className="dots">
              {SLIDES.map((_, i) => <span key={i} className={i === slide ? 'active' : ''} />)}
            </div>
            <div className="caption">{SLIDES[slide].caption}</div>
            <div className="floating-card">
              <div className="title">Formulação em análise</div>
              <div className="sub"><span className="live" /> Caracterização reológica · F-074</div>
              <div className="row"><span>Imprimibilidade estimada</span><b>82%</b></div>
              <div className="bar"><i style={{ width: '82%' }} /></div>
              <div className="row"><span>Integridade estrutural</span><b>94%</b></div>
              <div className="bar b2"><i style={{ width: '94%' }} /></div>
              <div className="row"><span>Tensão de escoamento</span><b>312 Pa</b></div>
              <div className="bar b3"><i style={{ width: '88%' }} /></div>
            </div>
          </div>
        </section>

        <section className="block" id="por-que">
          <span className="eyebrow">Por que escolher</span>
          <h2 className="section-title">Não é uma IA genérica. É uma <em>inteligência treinada</em> em ciência de alimentos.</h2>
          <p className="section-lead">A MIA foi construída com a Morphê Foods sobre uma base de conhecimento curada por pesquisadores da área. Cada resposta nasce da intersecção entre literatura científica indexada, protocolos validados e dados reais de formulações já caracterizadas.</p>
          <div className="why-grid">
            {PILLARS.map(p => (
              <div className="pillar" key={p.n}>
                <span className="num">{p.n}</span>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="block resolve" id="o-que-resolve">
          <div className="resolve-inner">
            <span className="eyebrow">O que ela resolve</span>
            <h2 className="section-title">Os gargalos do desenvolvimento de alimentos impressos em 3D, <em>endereçados</em>.</h2>
            <p className="section-lead">A literatura aponta uma série de barreiras técnicas que tornam o desenvolvimento desses alimentos lento, caro e dependente de tentativa e erro. A MIA foi desenhada para atacar cada uma delas.</p>
            <div className="resolve-grid">
              {PAINS.map(p => (
                <div className="pain" key={p.label}>
                  <span className="label">{p.label}</span>
                  <h3>{p.h}</h3>
                  <p>{p.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="block" id="como-funciona">
          <span className="eyebrow">Como funciona</span>
          <h2 className="section-title">Quatro etapas, <em>um único ambiente.</em></h2>
          <p className="section-lead">O fluxo de trabalho da MIA acompanha o ciclo natural de desenvolvimento de uma formulação imprimível, da hipótese inicial ao documento final.</p>
          <div className="workflow">
            {STEPS.map(s => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-final">
          <h2>Pronta para conversar com a <em>MIA?</em></h2>
          <p>Acesse a plataforma e comece sua primeira formulação assistida. Ou solicite uma demonstração com nossa equipe.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <a href="/login" className="btn btn-lime">Acessar plataforma →</a>
            <button type="button" className="btn btn-outline" onClick={openDemo}>Solicitar demonstração</button>
          </div>
        </section>

        <footer>
          <div>© Morphê Foods · Todos os direitos reservados</div>
          <div>contato@morphefoods.com</div>
        </footer>

        {demoOpen && (
          <div className="modal-backdrop open" onClick={e => { if (e.target === e.currentTarget) setDemoOpen(false) }}>
            <div className="modal" role="dialog" aria-labelledby="demoTitle">
              <button className="close" onClick={() => setDemoOpen(false)} aria-label="Fechar">×</button>
              {!submitted ? (
                <>
                  <h3 id="demoTitle">Solicitar demonstração</h3>
                  <p className="modal-lead">Conte um pouco sobre você. Nossa equipe entra em contato para apresentar a MIA na prática.</p>
                  <form onSubmit={submitDemo}>
                    <label htmlFor="email">Email profissional</label>
                    <input id="email" name="email" type="email" required placeholder="seu@email.com" autoComplete="email" autoFocus />
                    <label htmlFor="phone">Celular com DDD</label>
                    <input id="phone" name="phone" type="tel" required placeholder="(11) 90000-0000" autoComplete="tel" />
                    {error && <p className="form-error">Não foi possível enviar. Tente novamente.</p>}
                    <button type="submit" disabled={submitting} className="btn btn-lime submit">
                      {submitting ? 'Enviando…' : 'Quero conhecer a MIA'}
                    </button>
                    <p className="privacy">Seus dados ficam protegidos e são usados apenas para esse contato.</p>
                  </form>
                </>
              ) : (
                <div className="success">
                  <div className="check">✓</div>
                  <h3 style={{ fontStyle: 'normal', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 22 }}>Recebemos seu pedido</h3>
                  <p className="modal-lead" style={{ marginTop: 8 }}>A equipe da Morphê Foods entrará em contato em até um dia útil.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

const CSS = `
  .landing-root{
    --cream:#fff1d9;
    --cream-2:#f8e8c9;
    --green-deep:#054a37;
    --green:#006e51;
    --green-mid:#196454;
    --orange:#fa5528;
    --orange-soft:#db853d;
    --lime:#abd032;
    font-family:var(--font-sans),system-ui,sans-serif;
    background:var(--cream);
    color:var(--green-deep);
    -webkit-font-smoothing:antialiased;
  }
  .landing-root *{box-sizing:border-box}
  .landing-root nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:22px 48px;position:sticky;top:0;z-index:50;
    background:rgba(255,241,217,.85);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(5,74,55,.06);
  }
  .landing-root .brand{display:flex;align-items:center;gap:12px;font-weight:600;color:var(--green-deep);font-size:18px;text-decoration:none}
  .landing-root .brand img{width:38px;height:38px;object-fit:contain}
  .landing-root nav ul{display:flex;list-style:none;gap:34px;margin:0;padding:0;font-size:14.5px;color:var(--green-mid)}
  .landing-root nav ul a{color:inherit;text-decoration:none;font-weight:500}
  .landing-root nav ul a:hover{color:var(--orange)}
  .landing-root .btn{
    display:inline-flex;align-items:center;gap:8px;
    padding:11px 22px;border-radius:999px;
    font-family:inherit;font-size:14.5px;font-weight:600;
    border:1.5px solid transparent;cursor:pointer;
    transition:transform .15s ease,box-shadow .2s ease,background .2s ease;
    text-decoration:none;
  }
  .landing-root .btn-lime{background:var(--lime);color:var(--green-deep);box-shadow:0 4px 18px rgba(171,208,50,.35)}
  .landing-root .btn-lime:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(171,208,50,.45)}
  .landing-root .btn-outline{background:transparent;color:var(--green-deep);border-color:var(--green-deep)}
  .landing-root .btn-outline:hover{background:var(--green-deep);color:var(--cream)}
  .landing-root .hero{
    display:grid;grid-template-columns:1.05fr 1fr;gap:60px;
    align-items:center;padding:60px 64px 100px;max-width:1480px;margin:0 auto;
    min-height:calc(100vh - 80px);
  }
  .landing-root .badge{
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(6,110,81,.08);color:var(--green);
    padding:7px 14px;border-radius:999px;
    font-size:13px;font-weight:500;
    border:1px solid rgba(6,110,81,.15);
  }
  .landing-root .badge .dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(6,110,81,.18)}
  .landing-root h1.headline{
    margin:24px 0 22px;
    font-size:clamp(48px,6.2vw,84px);
    line-height:.98;font-weight:700;letter-spacing:-.035em;
    color:var(--green-deep);
  }
  .landing-root h1.headline em{
    font-style:italic;font-family:var(--font-serif),Georgia,serif;font-weight:400;
    background:linear-gradient(90deg,var(--green) 0%,var(--orange) 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent;
  }
  .landing-root .lead{font-size:17.5px;line-height:1.55;color:var(--green-mid);max-width:560px;margin-bottom:34px}
  .landing-root .cta-row{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .landing-root .meta{display:flex;align-items:center;gap:24px;margin-top:42px;font-size:13px;color:var(--green-mid);flex-wrap:wrap}
  .landing-root .meta span{display:inline-flex;align-items:center;gap:8px}
  .landing-root .meta .pulse{width:8px;height:8px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 4px rgba(171,208,50,.25);animation:miapulse 2s infinite}
  @keyframes miapulse{50%{box-shadow:0 0 0 9px rgba(171,208,50,0)}}
  .landing-root .carousel{
    position:relative;aspect-ratio:4/5;width:100%;max-width:520px;margin-left:auto;
    border-radius:32px;overflow:hidden;background:var(--green-deep);
    box-shadow:0 40px 80px -30px rgba(5,30,23,.4), 0 0 0 1px rgba(5,74,55,.08);
    cursor:pointer;
  }
  .landing-root .carousel::before{
    content:"";position:absolute;inset:0;
    background:linear-gradient(180deg,transparent 55%,rgba(5,30,23,.55) 100%);
    z-index:2;pointer-events:none;
  }
  .landing-root .carousel img{
    position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
    opacity:0;transition:opacity .9s ease;
  }
  .landing-root .carousel img.active{opacity:1}
  .landing-root .carousel .caption{
    position:absolute;left:24px;right:24px;bottom:24px;color:#fff;z-index:3;
    font-family:var(--font-serif),serif;font-style:italic;font-size:22px;line-height:1.2;
    text-shadow:0 2px 12px rgba(0,0,0,.35);
  }
  .landing-root .carousel .dots{position:absolute;top:20px;left:24px;display:flex;gap:6px;z-index:3}
  .landing-root .carousel .dots span{width:24px;height:3px;border-radius:2px;background:rgba(255,255,255,.4);transition:background .3s}
  .landing-root .carousel .dots span.active{background:var(--lime)}
  .landing-root .floating-card{
    position:absolute;
    right:-60px;bottom:40%;
    background:#fff;border-radius:22px;padding:26px 28px;
    box-shadow:0 30px 70px -20px rgba(5,30,23,.45), 0 0 0 1px rgba(5,74,55,.05);
    z-index:10;width:340px;
    animation:floatCard 6s ease-in-out infinite;
  }
  @keyframes floatCard{50%{transform:translateY(-8px)}}
  .landing-root .floating-card .title{font-size:17px;font-weight:600;color:var(--green-deep);margin-bottom:4px}
  .landing-root .floating-card .sub{font-size:13px;color:#8a9990;margin-bottom:20px;display:flex;align-items:center;gap:8px}
  .landing-root .floating-card .sub .live{width:7px;height:7px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 4px rgba(171,208,50,.25)}
  .landing-root .floating-card .row{display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:8px;color:var(--green-mid)}
  .landing-root .floating-card .row b{color:var(--green-deep);font-weight:600}
  .landing-root .floating-card .bar{height:6px;border-radius:999px;background:rgba(6,110,81,.1);overflow:hidden;margin-bottom:16px}
  .landing-root .floating-card .bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--green),var(--lime))}
  .landing-root .floating-card .bar.b3 i{background:linear-gradient(90deg,var(--orange-soft),var(--orange))}
  @media (max-width:1200px){
    .landing-root .floating-card{right:-20px;width:300px}
  }
  .landing-root section.block{padding:110px 64px;max-width:1480px;margin:0 auto}
  .landing-root section.block.resolve{max-width:none;background:var(--green-deep);color:var(--cream);padding:110px 0}
  .landing-root .resolve-inner{max-width:1480px;margin:0 auto;padding:0 64px}
  .landing-root .eyebrow{
    display:inline-block;font-size:12.5px;font-weight:600;letter-spacing:.18em;
    text-transform:uppercase;color:var(--orange);margin-bottom:18px;
  }
  .landing-root .resolve .eyebrow{color:var(--lime)}
  .landing-root h2.section-title{
    font-size:clamp(36px,4.2vw,58px);line-height:1.02;letter-spacing:-.03em;
    font-weight:700;color:var(--green-deep);margin:0 0 22px;max-width:820px;
  }
  .landing-root .resolve h2.section-title{color:var(--cream)}
  .landing-root h2.section-title em{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    background:linear-gradient(90deg,var(--green),var(--orange));-webkit-background-clip:text;background-clip:text;color:transparent;
  }
  .landing-root .resolve h2.section-title em{background:linear-gradient(90deg,var(--lime),var(--orange));-webkit-background-clip:text;background-clip:text;color:transparent}
  .landing-root p.section-lead{font-size:17px;line-height:1.55;color:var(--green-mid);max-width:680px;margin:0 0 60px}
  .landing-root .resolve p.section-lead{color:rgba(255,241,217,.7)}
  .landing-root .why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
  .landing-root .pillar{
    background:#fff;border:1px solid rgba(5,74,55,.08);
    border-radius:22px;padding:30px 26px;
    transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  }
  .landing-root .pillar:hover{transform:translateY(-4px);box-shadow:0 24px 50px -24px rgba(5,30,23,.25);border-color:rgba(250,85,40,.25)}
  .landing-root .pillar .num{
    font-family:var(--font-serif),serif;font-style:italic;font-size:32px;color:var(--orange);
    line-height:1;display:block;margin-bottom:18px;
  }
  .landing-root .pillar h3{margin:0 0 8px;font-size:18.5px;font-weight:600;color:var(--green-deep)}
  .landing-root .pillar p{margin:0;font-size:14.5px;line-height:1.55;color:var(--green-mid)}
  .landing-root .resolve-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  .landing-root .pain{
    background:rgba(255,241,217,.04);border:1px solid rgba(255,241,217,.1);
    border-radius:20px;padding:28px;
    transition:transform .25s ease,border-color .25s ease,background .25s ease;
  }
  .landing-root .pain:hover{transform:translateY(-4px);border-color:rgba(250,85,40,.4);background:rgba(255,241,217,.06)}
  .landing-root .pain .label{
    font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:var(--orange);margin-bottom:14px;display:block;
  }
  .landing-root .pain h3{margin:0 0 10px;font-size:18.5px;font-weight:600;color:var(--cream)}
  .landing-root .pain p{margin:0;font-size:14.5px;line-height:1.55;color:rgba(255,241,217,.72)}
  .landing-root .workflow{display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative}
  .landing-root .step{position:relative;padding:0 24px 0 0}
  .landing-root .step .step-num{
    width:42px;height:42px;border-radius:50%;
    background:var(--green-deep);color:var(--cream);
    display:grid;place-items:center;font-weight:600;font-size:15px;
    margin-bottom:20px;position:relative;z-index:2;
  }
  .landing-root .step h3{margin:0 0 10px;font-size:19px;font-weight:600;color:var(--green-deep)}
  .landing-root .step p{margin:0;font-size:14.5px;line-height:1.55;color:var(--green-mid)}
  .landing-root .step::before{
    content:"";position:absolute;top:20px;left:42px;right:0;height:1px;
    background:repeating-linear-gradient(90deg,rgba(5,74,55,.2) 0 6px,transparent 6px 12px);
    z-index:1;
  }
  .landing-root .step:last-child::before{display:none}
  .landing-root .cta-final{
    text-align:center;padding:120px 32px;
    background:linear-gradient(180deg,var(--cream),var(--cream-2));
  }
  .landing-root .cta-final h2{
    font-size:clamp(40px,5vw,72px);line-height:1.02;letter-spacing:-.035em;
    margin:0 0 22px;color:var(--green-deep);font-weight:700;
  }
  .landing-root .cta-final h2 em{font-family:var(--font-serif),serif;font-style:italic;font-weight:400;color:var(--orange)}
  .landing-root .cta-final p{font-size:17px;color:var(--green-mid);max-width:560px;margin:0 auto 36px}
  .landing-root footer{padding:40px 64px;font-size:13px;color:var(--green-mid);display:flex;justify-content:space-between;border-top:1px solid rgba(5,74,55,.08)}
  .landing-root .modal-backdrop{
    position:fixed;inset:0;background:rgba(5,30,23,.55);
    display:none;align-items:center;justify-content:center;z-index:200;
    backdrop-filter:blur(6px);animation:miafade .25s ease;
  }
  .landing-root .modal-backdrop.open{display:flex}
  @keyframes miafade{from{opacity:0}}
  .landing-root .modal{
    background:var(--cream);border-radius:24px;padding:40px 38px;
    width:min(440px,92vw);box-shadow:0 30px 80px -20px rgba(0,0,0,.4);
    position:relative;animation:miarise .35s cubic-bezier(.2,.8,.2,1);
  }
  @keyframes miarise{from{transform:translateY(20px);opacity:0}}
  .landing-root .modal h3{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:32px;line-height:1.05;color:var(--green-deep);margin:0 0 8px;
  }
  .landing-root .modal p.modal-lead{font-size:14.5px;color:var(--green-mid);margin:0 0 22px;line-height:1.5}
  .landing-root .modal label{display:block;font-size:12.5px;font-weight:600;color:var(--green-deep);margin:14px 0 6px;letter-spacing:.02em;text-transform:uppercase}
  .landing-root .modal input{
    width:100%;padding:13px 16px;border-radius:12px;
    background:#fff;border:1.5px solid rgba(5,74,55,.15);
    font-family:inherit;font-size:15px;color:var(--green-deep);
    transition:border-color .2s ease,box-shadow .2s ease;
  }
  .landing-root .modal input:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 4px rgba(6,110,81,.12)}
  .landing-root .modal .submit{margin-top:22px;width:100%;justify-content:center;padding:14px}
  .landing-root .modal .close{
    position:absolute;top:18px;right:18px;width:30px;height:30px;border-radius:50%;
    background:rgba(5,74,55,.08);border:none;cursor:pointer;color:var(--green-deep);
    font-size:18px;line-height:1;display:grid;place-items:center;
  }
  .landing-root .modal .close:hover{background:rgba(5,74,55,.15)}
  .landing-root .modal .success{text-align:center;padding:20px 0}
  .landing-root .modal .success .check{
    width:64px;height:64px;border-radius:50%;background:var(--lime);
    display:grid;place-items:center;margin:0 auto 16px;font-size:30px;color:var(--green-deep);
  }
  .landing-root .modal .privacy{font-size:11.5px;color:#8a9990;margin-top:12px;text-align:center}
  .landing-root .form-error{font-size:13px;color:var(--orange);margin:12px 0 0}
  @media (max-width:980px){
    .landing-root .hero{grid-template-columns:1fr;padding:30px 24px 60px;gap:40px}
    .landing-root nav{padding:18px 24px}
    .landing-root nav ul{display:none}
    .landing-root section.block{padding:70px 24px}
    .landing-root section.block.resolve{padding:70px 0}
    .landing-root .resolve-inner{padding:0 24px}
    .landing-root .why-grid{grid-template-columns:1fr 1fr;gap:14px}
    .landing-root .resolve-grid{grid-template-columns:1fr;gap:14px}
    .landing-root .workflow{grid-template-columns:1fr;gap:30px}
    .landing-root .step::before{display:none}
    .landing-root .floating-card{right:0}
    .landing-root .cta-final{padding:80px 24px}
    .landing-root footer{flex-direction:column;gap:10px;padding:30px 24px}
  }
`
