"use client"

import React, { useState } from "react"

/**
 * EUSKARA: prestakuntza beharrak identifikatzeko inkesta · Lanbide
 * --------------------------------------------------------------------------
 * Portado de Framer a Next.js (App Router, Vercel).
 *
 * Cambios respecto a la versión Framer:
 * - Se eliminan `addPropertyControls` / `ControlType` (no existen fuera de Framer).
 *   En su lugar, la configuración vive en DEFAULT_CONFIG y se puede sobreescribir
 *   pasando props parciales al componente, o editando el objeto directamente.
 * - Se añade "use client" (usa useState, fetch en el navegador).
 * - supabaseUrl / supabaseAnonKey se leen de variables de entorno NEXT_PUBLIC_*
 *   con fallback a los mismos valores que tenías en Framer, para que funcione
 *   igual "out of the box" mientras migras.
 * - logoImage pasa de ser un ControlType.Image (objeto) a una simple ruta string
 *   (p.ej. "/lanbide-logo.png" dentro de /public).
 * - Resto del componente (Section, Field, Face, estilos, handleSubmit) intacto.
 */

// ─────────────────────────────────────────────────────────────────────────
// 0. CONFIG (sustituye a los property controls de Framer)
// ─────────────────────────────────────────────────────────────────────────
type SurveyConfig = {
    supabaseUrl: string
    supabaseAnonKey: string
    tableName: string
    cursosUrl: string
    primaryColor: string
    bgColor: string
    textColor: string
    logoImage: string | null
    logoSize: number
    typography: {
        fontFamily: string
        fontWeight: number
        letterSpacing: number
        lineHeight: number
    }
}

const DEFAULT_CONFIG: SurveyConfig = {
    supabaseUrl:
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://upbipqeapjsqsnoryfjz.supabase.co",
    supabaseAnonKey:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "sb_publishable_G-Vs3ZPruXXbsBAop6jmXg_ypKloINN",
    tableName: "inkesta_beharrak",
    cursosUrl:
        "https://www.ivap.euskadi.eus/contenidos/informacion/erabilera_plana_prestakuntza/es_info_oro/2026ko-eskaintza-orokorra_katalogoa.pdf",
    primaryColor: "#a81d2a",
    bgColor: "#f4f2e4",
    textColor: "#000000",
    logoImage: "/lanbide-logo.png",
    logoSize: 80,
    typography: {
        fontFamily: "Futura, sans-serif",
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 1.5,
    },
}

// ─────────────────────────────────────────────────────────────────────────
// 1. DATOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────────────────
const SMILEYS = [
    {
        value: "siempre",
        type: "happy",
        eu: "Beti egiten dut",
        es: "Lo hago siempre",
        shortEu: "Beti",
        shortEs: "Beti / Siempre",
    },
    {
        value: "dificultad",
        type: "neutral",
        eu: "Ez dut egin ohi, zailtasun arinak ditudalako",
        es: "No suelo hacerlo, con leves dificultades",
        shortEu: "Zailtasunekin",
        shortEs: "Zailtasunekin / Con dificultad",
    },
    {
        value: "sinCapacidad",
        type: "sad",
        eu: "Ez dut egin ohi, gaitasun eskasa dudalako",
        es: "No suelo hacerlo, capacidad escasa",
        shortEu: "Eskasa",
        shortEs: "Eskasa / Capacidad escasa",
    },
] as const

const oralQuestions = [
    {
        id: "o1",
        eu: "Telefonoz eta aurrez aurre, lehen hitza euskaraz egiten dut (herritarrekin, beste erakundeetako solaskideekin…).",
        es: "Por teléfono y presencialmente, la primera palabra es en euskera (con la ciudadanía, interlocutores de otras instituciones…).",
    },
    {
        id: "o2",
        eu: "Herritarrak euskara aukeratzen badu, euskarazko zerbitzua bermatzen dut.",
        es: "Si la ciudadanía elige el euskera, garantizo el servicio en euskera.",
    },
    {
        id: "o3",
        eu: "Euskaraz ez badakit, euskaraz dakien lankideari esan ohi diot herritarra artatzeko.",
        es: "Si no sé euskera, le digo a mi compañera o compañero que sepa euskera para atender a la ciudadano/a.",
    },
    {
        id: "o4",
        eu: "Lankideekin euskaraz hitz egin ohi dut.",
        es: "Hablo con mis compañeras y compañeros en euskera.",
    },
    {
        id: "o5",
        eu: "Beste erakundeekiko ahozko harremanak euskaraz izaten ditut.",
        es: "Las relaciones orales con otras administraciones son en euskera.",
    },
    {
        id: "o6",
        eu: "Bileretan euskaraz egiten dut, solaskide guztiek ulertzen dutenean.",
        es: "Hablo en euskera en las reuniones, si todas las personas interlocutoras lo entienden.",
    },
    {
        id: "o7",
        eu: "Gaitasun nahikoa ez badut ere, ez dut oztoporik jartzen lan-bilerak euskaraz izan daitezen.",
        es: "Aunque no tenga la suficiente capacidad lingüística, no obstaculizo que las reuniones sean en euskera.",
    },
    {
        id: "o8",
        eu: "Euskararen ahozko erabilera hobetzeko eskaintzen zaizkidan ikastaroetan parte hartu ohi dut.",
        es: "Para mejorar mi euskera oral suelo participar en los cursos que se me ofrecen.",
    },
    {
        id: "o9",
        eu: "Proposatzen diren euskararen inguruko egitasmoetan parte hartu ohi dut (mintzasaioak, mintzakafeak…).",
        es: "Suelo participar en actividades que se propongan en torno al euskera (mintzasaioak, mintzakafeak…).",
    },
]

const writtenQuestions = [
    {
        id: "w1",
        eu: "Euskaraz jasotako idatzizko komunikazioei euskaraz erantzun ohi diet.",
        es: "Suelo responder a las comunicaciones recibidas en euskera en el mismo idioma.",
    },
    {
        id: "w2",
        eu: "Nire idatziaren hartzaileari euskaraz komunikatzeko aukera eskaini ohi diot (herritarra, beste erakunde bat…).",
        es: "Suelo ofrecer a la persona destinataria de mi escrito la posibilidad de comunicarse en euskera (ciudadano/a, otra institución…).",
    },
    {
        id: "w3",
        eu: "Gaztelaniaz jasotako idatziak ele bietan erantzun ohi ditut.",
        es: "Suelo responder en ambas lenguas a los escritos recibidos en castellano.",
    },
    {
        id: "w4",
        eu: "E-mailak eta idatzi laburrak euskaraz idatzi ohi ditut nire solaskideak euskaraz jakin edo ulertzen duenean.",
        es: "Suelo escribir emails y escritos breves en euskera cuando mi interlocutor sabe o entiende euskera.",
    },
    {
        id: "w5",
        eu: "Nire euskara mailak ahalbidetzen didan neurrian, idazkiak euskaraz sortu eta, ondoren, zuzenketa-zerbitzura bidali ohi ditut (3. HE / 4. HE dutenek).",
        es: "En la medida que mi nivel de euskera me lo permite, suelo crear los escritos en euskera y los envío al servicio de corrección (para quienes tienen el PL3 o PL4).",
    },
    {
        id: "w6",
        eu: "Lanarekin lotutako prestakuntza euskaraz jaso ohi dut horrela eskaintzen didaten guztietan.",
        es: "Suelo recibir formación relacionada con el trabajo en euskera siempre que me lo ofrecen.",
    },
    {
        id: "w7",
        eu: "Aplikazioen euskarazko bertsioa erabili ohi dut lanerako.",
        es: "Utilizo la versión en euskera de las aplicaciones para trabajar.",
    },
    {
        id: "w8",
        eu: "Nire lanpostuko errotuluak euskaraz jartzen ditut: artxiboak, karpetak, e.a.",
        es: "Los rótulos de mi puesto de trabajo los pongo en euskera: archivos, carpetas, etc.",
    },
    {
        id: "w9",
        eu: "Euskararen erabilera idatzia hobetzeko eskaintzen zaizkidan ikastaroetan parte hartu ohi dut.",
        es: "Participo en los cursos que se me ofrecen para mejorar el uso escrito del euskera.",
    },
]

// ─────────────────────────────────────────────────────────────────────────
// 2. ESTILOS
// ─────────────────────────────────────────────────────────────────────────
const formStyle: React.CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 26,
}

const eyebrowStyle: React.CSSProperties = {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: ".72rem",
    fontWeight: 700,
    opacity: 0.5,
    margin: "0 0 10px",
}

const introStyle: React.CSSProperties = {
    fontSize: ".95rem",
    lineHeight: 1.6,
    maxWidth: 620,
    margin: "20px auto 0",
}

const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: 22,
    borderRadius: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,.04)",
    border: "1px solid rgba(0,0,0,.04)",
}

const cardHeadingStyle: React.CSSProperties = {
    margin: "0 0 16px",
    paddingBottom: 10,
    borderBottom: "2px solid var(--lbk-primary)",
    color: "var(--lbk-primary)",
    fontSize: "1.05rem",
    fontWeight: 700,
}

const legendTitleStyle: React.CSSProperties = {
    margin: "0 0 14px",
    fontWeight: 700,
    fontSize: ".9rem",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.6,
}

const legendGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
}

const legendItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
}

const hintStyle: React.CSSProperties = {
    fontSize: ".82rem",
    opacity: 0.6,
    margin: "14px 0 0",
}

const progressWrapStyle: React.CSSProperties = {
    display: "grid",
    gap: 8,
    padding: "2px 4px",
}

const progressRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: ".82rem",
    opacity: 0.75,
}

const progressTrackStyle: React.CSSProperties = {
    height: 8,
    borderRadius: 999,
    background: "rgba(0,0,0,.08)",
    overflow: "hidden",
}

const progressBarStyle: React.CSSProperties = {
    height: "100%",
    borderRadius: 999,
    transition: "width .35s ease",
}

const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    color: "#fff",
    padding: "14px 20px",
    borderRadius: 12,
}

const sectionIndexStyle: React.CSSProperties = {
    fontSize: ".85rem",
    fontWeight: 700,
    letterSpacing: 1,
    opacity: 0.55,
    border: "1.5px solid rgba(255,255,255,.5)",
    borderRadius: 8,
    padding: "2px 8px",
}

const microLabelStyle: React.CSSProperties = {
    fontSize: ".75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    opacity: 0.55,
    margin: "0 0 8px",
}

const smileyGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 16,
}

const smileyBtnStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 7,
    padding: "13px 6px",
    borderRadius: 12,
    border: "2px solid #ece8db",
    cursor: "pointer",
    textAlign: "center",
    background: "#fff",
}

const wantStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    padding: "9px 15px",
    borderRadius: 999,
    border: "1.5px solid #ddd8c9",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: ".85rem",
    marginBottom: 16,
}

const checkBoxStyle: React.CSSProperties = {
    width: 17,
    height: 17,
    borderRadius: 5,
    border: "1.5px solid #c9c3b2",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
}

const twoColStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
}

const textFieldStyle: React.CSSProperties = {
    display: "grid",
    gap: 6,
}

const inputStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d8d3c4",
    fontSize: "1rem",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
}

const smallInputStyle: React.CSSProperties = {
    ...inputStyle,
    padding: "10px 12px",
    fontSize: ".92rem",
}

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: "vertical",
    fontFamily: "inherit",
    width: "100%",
}

const priorityRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
}

const priorityBadgeStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 9,
    color: "#fff",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
}

const catalogLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 13,
    textDecoration: "none",
    color: "var(--lbk-text)",
    background: "color-mix(in srgb, var(--lbk-primary) 6%, #fff)",
    border: "1.5px solid color-mix(in srgb, var(--lbk-primary) 30%, #e3ddcc)",
    borderRadius: 12,
    padding: "14px 16px",
    fontWeight: 600,
    fontSize: ".92rem",
    marginBottom: 18,
}

const suggestionNoteStyle: React.CSSProperties = {
    fontSize: ".85rem",
    textAlign: "center",
    opacity: 0.8,
    margin: 0,
    lineHeight: 1.6,
}

const errorStyle: React.CSSProperties = {
    color: "#a81d2a",
    padding: 16,
    background: "#fde8e8",
    borderRadius: 12,
    fontSize: ".9rem",
    wordBreak: "break-word",
}

const submitStyle: React.CSSProperties = {
    color: "#fff",
    padding: "16px 32px",
    fontSize: "1.05rem",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: 0.3,
}

// ─────────────────────────────────────────────────────────────────────────
// 3. COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────
function Face({ type, size = 30 }: { type: string; size?: number }) {
    const s = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    }
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9.2" {...s} />
            <circle cx="9" cy="10" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="15" cy="10" r="1.15" fill="currentColor" stroke="none" />
            {type === "happy" && <path d="M8 14 Q12 17.6 16 14" {...s} />}
            {type === "neutral" && <path d="M8.4 14.9 H15.6" {...s} />}
            {type === "sad" && <path d="M8 15.7 Q12 12.4 16 15.7" {...s} />}
        </svg>
    )
}

type QA = { id: string; eu: string; es: string }
type ResponseValue = {
    loHago?: string
    loQuieroHacer?: boolean
    queNecesito?: string
}

function Section({
    index,
    title,
    questions,
    responses,
    onSmiley,
    onWant,
    onText,
    primaryColor,
    otrosValue,
    onOtros,
}: {
    index: string
    title: string
    questions: QA[]
    responses: Record<string, ResponseValue>
    onSmiley: (id: string, value: string) => void
    onWant: (id: string) => void
    onText: (id: string, field: string, value: string) => void
    primaryColor: string
    otrosValue: string
    onOtros: (value: string) => void
}) {
    return (
        <section style={{ display: "grid", gap: 14 }}>
            <div style={{ ...sectionHeaderStyle, background: primaryColor }}>
                <span style={sectionIndexStyle}>{index}</span>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                    {title}
                </h3>
            </div>

            {questions.map((q, idx) => {
                const r = responses[q.id] || {}
                return (
                    <div key={q.id} style={cardStyle} className="lbk-card">
                        <p style={{ margin: "0 0 14px", lineHeight: 1.4 }}>
                            <span
                                style={{
                                    color: primaryColor,
                                    fontWeight: 700,
                                    marginRight: 8,
                                }}
                            >
                                {idx + 1}.
                            </span>
                            <strong>{q.eu}</strong>
                            <br />
                            <span
                                style={{
                                    fontWeight: 400,
                                    opacity: 0.7,
                                    fontSize: ".92rem",
                                }}
                            >
                                {q.es}
                            </span>
                        </p>

                        {/* LO HAGO — escala de 3 caras */}
                        <p style={microLabelStyle}>Egiten dut · Lo hago</p>
                        <div style={smileyGridStyle}>
                            {SMILEYS.map((s) => {
                                const active = r.loHago === s.value
                                return (
                                    <button
                                        type="button"
                                        key={s.value}
                                        title={`${s.eu} / ${s.es}`}
                                        aria-pressed={active}
                                        onClick={() => onSmiley(q.id, s.value)}
                                        className="lbk-smiley"
                                        style={{
                                            ...smileyBtnStyle,
                                            borderColor: active
                                                ? primaryColor
                                                : "#ece8db",
                                            background: active
                                                ? "color-mix(in srgb, var(--lbk-primary) 8%, #fff)"
                                                : "#fff",
                                            color: active
                                                ? primaryColor
                                                : "#b3ad9e",
                                        }}
                                    >
                                        <Face type={s.type} size={28} />
                                        <span
                                            style={{
                                                fontSize: ".72rem",
                                                fontWeight: 600,
                                                lineHeight: 1.15,
                                                color: active
                                                    ? primaryColor
                                                    : "#6f6a5e",
                                            }}
                                        >
                                            {s.shortEs}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* LO QUIERO HACER */}
                        <button
                            type="button"
                            aria-pressed={!!r.loQuieroHacer}
                            onClick={() => onWant(q.id)}
                            className="lbk-toggle"
                            style={{
                                ...wantStyle,
                                borderColor: r.loQuieroHacer
                                    ? primaryColor
                                    : "#ddd8c9",
                                background: r.loQuieroHacer
                                    ? primaryColor
                                    : "#fff",
                                color: r.loQuieroHacer ? "#fff" : "#6f6a5e",
                            }}
                        >
                            <span
                                style={{
                                    ...checkBoxStyle,
                                    borderColor: r.loQuieroHacer
                                        ? "rgba(255,255,255,.85)"
                                        : "#c9c3b2",
                                }}
                            >
                                {r.loQuieroHacer && (
                                    <svg
                                        width="11"
                                        height="11"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="3.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                )}
                            </span>
                            Egin nahi dut · Lo quiero hacer
                        </button>

                        {/* Texto: qué necesito */}
                        <div style={twoColStyle}>
                            <label style={textFieldStyle}>
                                <span style={microLabelStyle}>
                                    Zer behar dut? · ¿Qué necesito?
                                </span>
                                <input
                                    className="lbk-input"
                                    type="text"
                                    value={r.queNecesito || ""}
                                    onChange={(e) =>
                                        onText(q.id, "queNecesito", e.target.value)
                                    }
                                    placeholder="Trebakuntza, mintzasaioak, birziklatze-ikastaroak…"
                                    style={smallInputStyle}
                                />
                            </label>
                        </div>
                    </div>
                )
            })}

            {/* Besterik? / ¿Otros? */}
            <div style={cardStyle} className="lbk-card">
                <p style={microLabelStyle}>
                    Beste zerbait gehitu nahi duzu? · ¿Algún otro comentario?
                </p>
                <textarea
                    className="lbk-input"
                    value={otrosValue}
                    onChange={(e) => onOtros(e.target.value)}
                    rows={2}
                    style={textareaStyle}
                    placeholder="Aipatu nahi duzun beste egoeraren bat… · Otra situación que quieras añadir…"
                />
            </div>
        </section>
    )
}

function Field({
    label,
    name,
    value,
    onChange,
    required,
}: {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
}) {
    return (
        <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                {required && <span style={{ color: "var(--lbk-primary)" }}>* </span>}
                {label}
            </span>
            <input
                className="lbk-input"
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                style={inputStyle}
            />
        </label>
    )
}

function ScopedStyles() {
    return (
        <style>{`
      .lbk-root, .lbk-root * { box-sizing: border-box; }
      .lbk-root .lbk-smiley { transition: transform .16s ease, box-shadow .2s ease, border-color .16s ease, background .16s ease; }
      .lbk-root .lbk-smiley:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.08); }
      .lbk-root .lbk-smiley:focus-visible { outline: 2px solid var(--lbk-primary); outline-offset: 2px; }
      .lbk-root .lbk-toggle { transition: transform .14s ease, border-color .16s ease, background .16s ease, color .16s ease; }
      .lbk-root .lbk-toggle:hover { transform: translateY(-1px); }
      .lbk-root .lbk-toggle:focus-visible { outline: 2px solid var(--lbk-primary); outline-offset: 2px; }
      .lbk-root .lbk-card { transition: box-shadow .2s ease; }
      .lbk-root .lbk-card:hover { box-shadow: 0 8px 26px rgba(0,0,0,.06); }
      .lbk-root .lbk-input { transition: border-color .16s ease, box-shadow .16s ease; }
      .lbk-root .lbk-input:focus { border-color: var(--lbk-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lbk-primary) 16%, transparent); outline: none; }
      .lbk-root .lbk-submit { transition: transform .15s ease, box-shadow .22s ease, opacity .2s ease; }
      .lbk-root .lbk-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px color-mix(in srgb, var(--lbk-primary) 38%, transparent); }
      .lbk-root .lbk-link { transition: transform .15s ease, box-shadow .2s ease, border-color .16s ease, background .16s ease; }
      .lbk-root .lbk-link:hover { transform: translateY(-1px); border-color: var(--lbk-primary); box-shadow: 0 8px 22px color-mix(in srgb, var(--lbk-primary) 16%, transparent); }
      .lbk-root .lbk-link:focus-visible { outline: 2px solid var(--lbk-primary); outline-offset: 2px; }
      @media (prefers-reduced-motion: reduce) {
        .lbk-root * { transition: none !important; }
      }
    `}</style>
    )
}

// ─────────────────────────────────────────────────────────────────────────
// 4. COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────
export default function LanbideEuskaraSurvey(props: Partial<SurveyConfig> = {}) {
    const config: SurveyConfig = { ...DEFAULT_CONFIG, ...props }
    const {
        supabaseUrl,
        supabaseAnonKey,
        tableName,
        cursosUrl,
        typography,
        primaryColor,
        bgColor,
        textColor,
        logoImage,
        logoSize,
    } = config

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [personalInfo, setPersonalInfo] = useState({
        nombre: "",
        puesto: "",
        lugar: "",
    })

    const [responses, setResponses] = useState<Record<string, ResponseValue>>({})
    const [otrosOral, setOtrosOral] = useState("")
    const [otrosEscrito, setOtrosEscrito] = useState("")
    const [comentario, setComentario] = useState("")
    const [cursosPrioridad, setCursosPrioridad] = useState(["", "", ""])

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value })

    const handleSmiley = (id: string, value: string) =>
        setResponses((prev) => ({
            ...prev,
            [id]: { ...prev[id], loHago: value },
        }))

    const handleWant = (id: string) =>
        setResponses((prev) => ({
            ...prev,
            [id]: { ...prev[id], loQuieroHacer: !prev[id]?.loQuieroHacer },
        }))

    const handleText = (id: string, field: string, value: string) =>
        setResponses((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }))

    const handlePrioridad = (i: number, value: string) =>
        setCursosPrioridad((prev) => {
            const next = [...prev]
            next[i] = value
            return next
        })

    const allQuestions = [...oralQuestions, ...writtenQuestions]
    const answered = allQuestions.filter((q) => responses[q.id]?.loHago).length
    const progress = Math.round((answered / allQuestions.length) * 100)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!supabaseUrl || !supabaseAnonKey) {
            setError(
                "Faltan las credenciales de Supabase. Revisa las variables de entorno NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY."
            )
            return
        }

        setLoading(true)
        setError(null)

        const respuestas_matriz = {
            ...responses,
            __extra: {
                besterik_ahozkoa: otrosOral,
                besterik_idatzizkoa: otrosEscrito,
                iradokizunak: comentario,
                ikastaro_lehentasunak: cursosPrioridad,
            },
        }

        const payload = {
            nombre_apellidos: personalInfo.nombre,
            servicio_puesto: personalInfo.puesto,
            lugar_trabajo: personalInfo.lugar,
            respuestas_matriz,
            fecha_envio: new Date().toISOString(),
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`,
                    Prefer: "return=minimal",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(
                    `Error ${res.status}: ${errorText || "Errorea datuak bidaltzean / Error al enviar los datos."}`
                )
            }

            setSuccess(true)
        } catch (err: any) {
            if (err.name === "AbortError") {
                setError(
                    "Zerbitzariak denbora gehiegi behar du erantzuteko. Orria berriro kargatzen... / El servidor está tardando demasiado en responder. Recargando la página..."
                )
                setTimeout(() => {
                    window.location.reload()
                }, 5000)
            } else {
                setError(err.message)
            }
        } finally {
            clearTimeout(timeoutId)
            setLoading(false)
        }
    }

    const fontStyles: React.CSSProperties = {
        fontFamily: typography.fontFamily,
        fontWeight: typography.fontWeight,
        letterSpacing: typography.letterSpacing,
        lineHeight: typography.lineHeight,
        color: textColor,
    }

    const cssVars = {
        ["--lbk-primary" as any]: primaryColor,
        ["--lbk-bg" as any]: bgColor,
        ["--lbk-text" as any]: textColor,
    } as React.CSSProperties

    // ── Pantalla de éxito ──────────────────────────────────────────────
    if (success) {
        return (
            <div
                className="lbk-root"
                style={{ ...fontStyles, ...cssVars, backgroundColor: bgColor }}
            >
                <ScopedStyles />
                <div
                    style={{
                        maxWidth: 560,
                        margin: "0 auto",
                        padding: "64px 28px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: 88,
                            height: 88,
                            margin: "0 auto 24px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: primaryColor,
                            color: "#fff",
                        }}
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </div>
                    <h2
                        style={{
                            color: primaryColor,
                            fontSize: "1.6rem",
                            marginBottom: 10,
                            fontWeight: 700,
                        }}
                    >
                        Eskerrik asko zure laguntzagatik!
                    </h2>
                    <p style={{ margin: 0, opacity: 0.85 }}>
                        Inkesta behar bezala bidali da. <br />
                        La encuesta se ha enviado correctamente.
                    </p>
                </div>
            </div>
        )
    }

    // ── Formulario ─────────────────────────────────────────────────────
    return (
        <div
            className="lbk-root"
            style={{
                ...fontStyles,
                ...cssVars,
                backgroundColor: bgColor,
                padding: "44px 18px 64px",
                width: "100%",
            }}
        >
            <ScopedStyles />

            <form onSubmit={handleSubmit} style={formStyle}>
                {/* Cabecera */}
                <header style={{ textAlign: "center" }}>
                    {logoImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoImage}
                            alt="Lanbide"
                            style={{
                                height: logoSize,
                                objectFit: "contain",
                                marginBottom: 22,
                            }}
                        />
                    )}
                    <p style={eyebrowStyle}>Euskara plana · Lanbide</p>
                    <h1
                        style={{
                            color: primaryColor,
                            fontSize: "clamp(1.35rem, 4vw, 1.8rem)",
                            margin: "0 0 6px",
                            fontWeight: 700,
                            lineHeight: 1.2,
                        }}
                    >
                        Prestakuntza beharrak identifikatzeko inkesta
                    </h1>
                    <h2
                        style={{
                            fontSize: "clamp(1rem, 3vw, 1.15rem)",
                            fontWeight: 400,
                            opacity: 0.7,
                            margin: 0,
                        }}
                    >
                        Encuesta para identificar necesidades formativas
                    </h2>
                    <p style={introStyle}></p>
                    <p style={{ ...introStyle, opacity: 0.7, marginTop: 8 }}></p>
                </header>

                {/* Leyenda de smileys */}
                <div style={cardStyle} className="lbk-card">
                    <p style={legendTitleStyle}>
                        Emojien esanahia · Significado de los emojis
                    </p>
                    <div style={legendGridStyle}>
                        {SMILEYS.map((s) => (
                            <div key={s.value} style={legendItemStyle}>
                                <span style={{ color: primaryColor, flexShrink: 0 }}>
                                    <Face type={s.type} size={34} />
                                </span>
                                <span style={{ fontSize: ".82rem" }}>
                                    <strong style={{ color: primaryColor }}>
                                        {s.eu}
                                    </strong>
                                    <br />
                                    <span style={{ opacity: 0.75 }}>{s.es}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Datos personales */}
                <div style={cardStyle} className="lbk-card">
                    <h3 style={cardHeadingStyle}>
                        Datu pertsonalak · Datos personales
                    </h3>
                    <div style={{ display: "grid", gap: 16 }}>
                        <Field
                            label="Izen-abizenak / Nombre y apellidos"
                            name="nombre"
                            value={personalInfo.nombre}
                            onChange={handleInfoChange}
                        />
                        <Field
                            required
                            label="Zerbitzua, lanpostua / Servicio, puesto"
                            name="puesto"
                            value={personalInfo.puesto}
                            onChange={handleInfoChange}
                        />
                        <Field
                            required
                            label="Lantokia / Lugar de trabajo"
                            name="lugar"
                            value={personalInfo.lugar}
                            onChange={handleInfoChange}
                        />
                    </div>
                    <p style={hintStyle}>
                        (*) Nahitaez bete beharreko eremuak · Campos obligatorios
                    </p>
                </div>

                {/* Progreso */}
                <div style={progressWrapStyle}>
                    <div style={progressRowStyle}>
                        <span>Ahozko + idatzizko egoerak · Situaciones</span>
                        <span style={{ fontWeight: 700, color: primaryColor }}>
                            {answered}/{allQuestions.length}
                        </span>
                    </div>
                    <div style={progressTrackStyle}>
                        <div
                            style={{
                                ...progressBarStyle,
                                width: `${progress}%`,
                                background: primaryColor,
                            }}
                        />
                    </div>
                </div>

                {/* Bloque 1: ahozkoa */}
                <Section
                    index="01"
                    title="Ahozko komunikazioa · Comunicación oral"
                    questions={oralQuestions}
                    responses={responses}
                    onSmiley={handleSmiley}
                    onWant={handleWant}
                    onText={handleText}
                    primaryColor={primaryColor}
                    otrosValue={otrosOral}
                    onOtros={setOtrosOral}
                />

                {/* Bloque 2: idatzizkoa */}
                <Section
                    index="02"
                    title="Idatzizko komunikazioa · Comunicación escrita"
                    questions={writtenQuestions}
                    responses={responses}
                    onSmiley={handleSmiley}
                    onWant={handleWant}
                    onText={handleText}
                    primaryColor={primaryColor}
                    otrosValue={otrosEscrito}
                    onOtros={setOtrosEscrito}
                />

                {/* Pregunta abierta */}
                <div style={cardStyle} className="lbk-card">
                    <h3 style={cardHeadingStyle}>Beste zerbait? · ¿Algo más?</h3>
                    <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>
                        Zerbait komentatu nahi badiguzu edo erantzunen bat garatu
                        nahi baduzu, hemen egin dezakezu. · Si quieres comentarnos
                        algo o desarrollar alguna respuesta, este es el sitio.
                    </p>
                    <textarea
                        className="lbk-input"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows={4}
                        style={textareaStyle}
                    />
                </div>

                {/* Cursos IVAP */}
                <div style={cardStyle} className="lbk-card">
                    <h3 style={cardHeadingStyle}>
                        IVAPeko ikastaroak · Cursos del IVAP
                    </h3>
                    <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>
                        Lanerako gehien behar dituzun IVAPeko 3 ikastaroak
                        aukeratu, eta ordenatu 1etik 3ra (1 = beharrezkoena). /
                        ¿Qué 3 cursos del IVAP necesitas más para tu trabajo?
                        Elígelos y ordénalos del 1 (el más importante) al 3.
                    </p>

                    {cursosUrl && (
                        <a
                            href={cursosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lbk-link"
                            style={catalogLinkStyle}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    flexShrink: 0,
                                    color: primaryColor,
                                }}
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <path d="M14 2v6h6" />
                                    <path d="M9 13h6M9 17h4" />
                                </svg>
                            </span>
                            <span style={{ flex: 1, lineHeight: 1.35 }}>
                                Ikus itzazu IVAPeko ikastaro guztiak
                                <br />
                                <span style={{ opacity: 0.7, fontWeight: 400 }}>
                                    Consulta aquí todos los cursos del IVAP
                                </span>
                            </span>
                            <span
                                style={{
                                    display: "inline-flex",
                                    flexShrink: 0,
                                    color: primaryColor,
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M7 17 17 7M9 7h8v8" />
                                </svg>
                            </span>
                        </a>
                    )}

                    <div style={{ display: "grid", gap: 12 }}>
                        {[0, 1, 2].map((i) => (
                            <div key={i} style={priorityRowStyle}>
                                <span
                                    style={{
                                        ...priorityBadgeStyle,
                                        background: primaryColor,
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <input
                                    className="lbk-input"
                                    type="text"
                                    value={cursosPrioridad[i]}
                                    onChange={(e) => handlePrioridad(i, e.target.value)}
                                    placeholder={`Lehentasuna ${i + 1} · Prioridad ${i + 1}`}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nota sugerencias */}
                <p style={suggestionNoteStyle}>
                    Iradokizunik baduzu, Euskara Zerbitzura bidal dezakezu ·
                    ¿Tienes alguna sugerencia? Escríbenos a{" "}
                    <a
                        href="mailto:l-sueskun@lanbide.eus"
                        style={{ color: primaryColor, fontWeight: 600 }}
                    >
                        l-sueskun@lanbide.eus
                    </a>
                </p>

                {error && (
                    <div style={errorStyle}>
                        <strong>Errorea · Error:</strong> {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="lbk-submit"
                    style={{
                        ...submitStyle,
                        background: primaryColor,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.75 : 1,
                    }}
                >
                    {loading ? "Bidaltzen… · Enviando…" : "Bidali inkesta · Enviar encuesta"}
                </button>
            </form>
        </div>
    )
}
