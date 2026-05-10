/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Svg, Rect, Path, Line, Circle, Ellipse, Polygon, G, Link } from '@react-pdf/renderer'
import type { Protocolo } from './data'

const COLORS = {
  primary: '#003223',
  text: '#211b0c',
  muted: '#58413c',
  light: '#fff8f1',
  cream: '#fff2da',
  border: '#e5d9c1',
  accent: '#c8ee4f',
  beige: '#f9edd4',
  gray: '#707974',
}

const styles = StyleSheet.create({
  page: { backgroundColor: 'white', padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: COLORS.text },
  header: { borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 12, marginBottom: 20 },
  brand: { fontSize: 8, color: COLORS.primary, fontFamily: 'Helvetica-Bold', letterSpacing: 1.5 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.primary, marginTop: 6, marginBottom: 4 },
  subtitle: { fontSize: 9, color: COLORS.muted, fontFamily: 'Helvetica-Oblique' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { fontSize: 8, color: COLORS.gray },
  diagramBox: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 10, marginBottom: 16, alignItems: 'center', backgroundColor: COLORS.light },
  diagramCaption: { fontSize: 7, color: COLORS.gray, marginTop: 6, fontStyle: 'italic' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  paragraph: { fontSize: 10, color: COLORS.muted, lineHeight: 1.5 },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  bulletDot: { color: COLORS.primary, marginRight: 6 },
  bulletText: { flex: 1, fontSize: 10, color: COLORS.muted, lineHeight: 1.5 },
  formulaBox: { backgroundColor: COLORS.light, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 8, marginBottom: 8 },
  formulaLabel: { fontSize: 7, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  formulaExpr: { fontSize: 11, fontFamily: 'Courier-Bold', color: COLORS.primary },
  refItem: { fontSize: 9, color: COLORS.muted, lineHeight: 1.4, marginBottom: 6 },
  refTitle: { fontStyle: 'italic' },
  doi: { color: COLORS.primary, textDecoration: 'underline' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, fontSize: 7, color: COLORS.gray, borderTopWidth: 0.5, borderTopColor: COLORS.border, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
})

// ─── DIAGRAMAS PDF (recriações em @react-pdf/renderer Svg) ──────────

function PdfDiagramaColapso() {
  const pilares = [0, 1, 2, 3, 4, 5].map(i => 30 + i * (i + 1) * 4 + i * 30)
  return (
    <Svg viewBox="0 0 320 130" style={{ width: 360, height: 145 }}>
      <Rect x="0" y="105" width="320" height="20" fill={COLORS.cream} />
      {pilares.map((x, i) => <Rect key={i} x={x} y="50" width="14" height="55" fill={COLORS.primary} />)}
      <Path
        d="M 30 50 Q 60 56 90 50 Q 130 64 168 50 Q 215 78 250 50 Q 290 95 320 50"
        stroke={COLORS.accent} strokeWidth={3.5} fill="none"
      />
      {['1', '2', '3', '4', '5', '6'].map((mm, i) => (
        <Text key={i} x={pilares[i] + 7} y={125} style={{ fontSize: 8, fill: COLORS.muted, textAnchor: 'middle' }}>
          {mm}mm
        </Text>
      ))}
    </Svg>
  )
}

function PdfDiagramaTPA() {
  return (
    <Svg viewBox="0 0 240 140" style={{ width: 280, height: 165 }}>
      <Rect x="100" y="10" width="40" height="35" fill={COLORS.primary} rx={2} />
      <Line x1="120" y1="45" x2="120" y2="58" stroke={COLORS.primary} strokeWidth={2} strokeDasharray="3 3" />
      <Ellipse cx="120" cy="80" rx="60" ry="8" fill={COLORS.cream} stroke={COLORS.muted} strokeWidth={1} />
      <Rect x="60" y="80" width="120" height="35" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={1} />
      <Ellipse cx="120" cy="115" rx="60" ry="8" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={1} />
      <Path d="M 120 56 L 120 75 M 116 70 L 120 75 L 124 70" stroke={COLORS.accent} strokeWidth={2} fill="none" />
      <Text x={155} y={32} style={{ fontSize: 8, fill: COLORS.muted }}>Sonda P/35R ∅ 45 mm</Text>
      <Text x={10} y={100} style={{ fontSize: 8, fill: COLORS.muted }}>Deformação</Text>
      <Text x={10} y={112} style={{ fontSize: 8, fill: COLORS.muted }}>80%</Text>
    </Svg>
  )
}

function PdfDiagramaSinerese() {
  return (
    <Svg viewBox="0 0 240 140" style={{ width: 280, height: 165 }}>
      <Ellipse cx="80" cy="40" rx="35" ry="6" fill={COLORS.cream} stroke={COLORS.muted} strokeWidth={1} />
      <Rect x="45" y="40" width="70" height="60" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={1} />
      <Ellipse cx="80" cy="100" rx="35" ry="6" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={1} />
      <Path d="M 130 70 L 165 70 M 160 66 L 165 70 L 160 74" stroke={COLORS.primary} strokeWidth={1.5} fill="none" />
      <Ellipse cx="200" cy="42" rx="30" ry="5" fill={COLORS.cream} stroke={COLORS.muted} strokeWidth={1} />
      <Rect x="170" y="42" width="60" height="55" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={1} />
      <Ellipse cx="200" cy="97" rx="30" ry="5" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={1} />
      <Circle cx="216" cy="108" r="4" fill="#516600" opacity={0.6} />
      <Circle cx="206" cy="113" r="3" fill="#516600" opacity={0.5} />
      <Text x={50} y={125} style={{ fontSize: 8, fill: COLORS.muted }}>∅ 20 × 10 mm</Text>
      <Text x={135} y={65} style={{ fontSize: 7, fill: COLORS.primary }}>-18°C / 24h</Text>
      <Text x={135} y={80} style={{ fontSize: 7, fill: COLORS.primary }}>25°C / 8h</Text>
    </Svg>
  )
}

function PdfDiagramaFidelidade() {
  return (
    <Svg viewBox="0 0 200 200" style={{ width: 240, height: 240 }}>
      <Rect x="20" y="20" width="160" height="160" fill="white" stroke={COLORS.primary} strokeWidth={2} />
      {[0, 1, 2].map(r => [0, 1, 2].map(c => (
        <Rect
          key={`${r}-${c}`}
          x={30 + c * 50} y={30 + r * 50} width="40" height="40"
          fill={COLORS.cream} stroke={COLORS.muted} strokeWidth={0.7}
        />
      )))}
      <Text x={75} y={195} style={{ fontSize: 9, fill: COLORS.muted }}>22 × 22 mm</Text>
      <Text x={50} y={14} style={{ fontSize: 8, fill: COLORS.gray }}>unidade interna ≈ 22,56 mm²</Text>
    </Svg>
  )
}

function PdfDiagramaPrecisao() {
  return (
    <Svg viewBox="0 0 320 160" style={{ width: 380, height: 190 }}>
      <G>
        <Polygon points="30,30 100,30 100,100 30,100" fill={COLORS.light} stroke={COLORS.primary} strokeWidth={1.5} />
        <Polygon points="30,30 50,15 120,15 100,30" fill={COLORS.cream} stroke={COLORS.primary} strokeWidth={1.5} />
        <Polygon points="100,30 120,15 120,85 100,100" fill={COLORS.beige} stroke={COLORS.primary} strokeWidth={1.5} />
        <Text x={35} y={120} style={{ fontSize: 8, fill: COLORS.muted }}>Cubo 15×15×15 mm</Text>
        <Text x={45} y={132} style={{ fontSize: 7, fill: COLORS.gray }}>precisão (PA)</Text>
      </G>
      <G>
        <Ellipse cx="240" cy="30" rx="40" ry="7" fill={COLORS.cream} stroke={COLORS.primary} strokeWidth={1.5} />
        <Line x1="200" y1="30" x2="200" y2="100" stroke={COLORS.primary} strokeWidth={1.5} />
        <Line x1="280" y1="30" x2="280" y2="100" stroke={COLORS.primary} strokeWidth={1.5} />
        <Ellipse cx="240" cy="100" rx="40" ry="7" fill={COLORS.light} stroke={COLORS.primary} strokeWidth={1.5} />
        <Ellipse cx="240" cy="30" rx="30" ry="5" fill={COLORS.light} stroke={COLORS.muted} strokeWidth={0.7} />
        <Text x={205} y={120} style={{ fontSize: 8, fill: COLORS.muted }}>Cilindro oco ∅ 28 mm</Text>
        <Text x={210} y={132} style={{ fontSize: 7, fill: COLORS.gray }}>altura máxima</Text>
      </G>
    </Svg>
  )
}

const DIAGRAMAS_PDF: Record<string, React.ReactNode> = {
  colapso_filamento: <PdfDiagramaColapso />,
  tpa_cooking_loss: <PdfDiagramaTPA />,
  sinerese: <PdfDiagramaSinerese />,
  fidelidade_dimensional: <PdfDiagramaFidelidade />,
  precisao_impressao: <PdfDiagramaPrecisao />,
}

// ─── DOCUMENTO ──────────────────────────────────────────────────────

export function ProtocoloPDF({ p }: { p: Protocolo }) {
  const diagrama = DIAGRAMAS_PDF[p.id]
  const dataGeracao = new Date().toLocaleDateString('pt-BR')

  return (
    <Document title={p.titulo} author="MIA — Morphê Foods" subject="Protocolo de caracterização">
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.brand}>MIA  ·  MORPHÊ FOODS</Text>
          <Text style={styles.title}>{p.titulo}</Text>
          <Text style={styles.subtitle}>{p.descricao}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaItem}>Versão {p.versao}</Text>
            <Text style={styles.metaItem}>·</Text>
            <Text style={styles.metaItem}>Emissão: {p.emissao}</Text>
          </View>
        </View>

        {/* Diagrama */}
        {diagrama && (
          <View style={styles.diagramBox} wrap={false}>
            {diagrama}
            <Text style={styles.diagramCaption}>Figura: representação esquemática</Text>
          </View>
        )}

        {/* Seções */}
        {p.secoes.map((sec, i) => (
          <View key={i} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{sec.titulo}</Text>
            {Array.isArray(sec.conteudo) ? (
              sec.conteudo.map((item, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.paragraph}>{sec.conteudo}</Text>
            )}
          </View>
        ))}

        {/* Fórmulas */}
        {p.formulas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fórmulas</Text>
            {p.formulas.map((f, i) => (
              <View key={i} style={styles.formulaBox} wrap={false}>
                <Text style={styles.formulaLabel}>{f.label}</Text>
                <Text style={styles.formulaExpr}>{f.expr}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Referências */}
        {p.referencias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referências</Text>
            {p.referencias.map((r, i) => (
              <View key={i} style={styles.refItem}>
                <Text>
                  {r.autores} ({r.ano}). <Text style={styles.refTitle}>{r.titulo}</Text>. {r.revista}.
                  {r.doi && (
                    <Text>
                      {' '}<Link src={`https://doi.org/${r.doi}`} style={styles.doi}>DOI: {r.doi}</Link>
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>MIA · Morphê Foods · Protocolo {p.titulo}</Text>
          <Text>Gerado em {dataGeracao}</Text>
        </View>
      </Page>
    </Document>
  )
}
