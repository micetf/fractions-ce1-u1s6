/**
 * @file Dashboard — tableau de bord enseignant en temps réel.
 *
 * @description
 * Overlay fullscreen affiché à la demande de l'enseignant·e.
 * Toutes les statistiques sont **dérivées** du journal d'événements
 * (`events`) via `useMemo` — aucun état n'est dupliqué.
 *
 * ────────────────────────────────────────────────────────────────
 * Sections affichées
 * ────────────────────────────────────────────────────────────────
 * 1. Métriques synthèse (temps, avancement, taux 1er essai)
 * 2. Frise de progression situation par situation (SituationDot)
 * 3. Tableau détaillé par situation (comptage / nommage / durée)
 * 4. Erreurs repérées — distracteurs fréquents (ErrPill)
 * 5. Situation en cours (si active)
 * 6. Pied de page institutionnel
 *
 * ────────────────────────────────────────────────────────────────
 * Algorithme de dérivation des stats
 * ────────────────────────────────────────────────────────────────
 * On parcourt `events` une seule fois par `useMemo`.
 * Chaque situation est indexée par `data.idx`.
 * Les clés sont mises à jour au fil des événements reçus.
 *
 * Statut d'une situation terminée :
 * - perfect   → fullScore === true
 * - good      → countErrors + nameErrors ≤ 2
 * - struggled → countErrors + nameErrors > 2
 *
 * ────────────────────────────────────────────────────────────────
 * Impression
 * ────────────────────────────────────────────────────────────────
 * Le bouton 🖨 déclenche window.print().
 * Les éléments `.no-print` sont masqués via @media print (index.css).
 */

import { useMemo } from "react";
import PropTypes from "prop-types";
import { fmtMs } from "../../utils/time.js";
import LiveTimer from "./LiveTimer.jsx";
import SituationDot from "./SituationDot.jsx";
import ErrPill from "./ErrPill.jsx";

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AtelierMeta
 * @property {string} icon   - Emoji de l'atelier
 * @property {string} label  - Nom de l'atelier
 * @property {string} color  - Couleur thématique (hex)
 * @property {string} light  - Couleur de fond claire (hex)
 * @property {string} border - Couleur de bordure (hex)
 * @property {string} sub    - Sous-titre de l'atelier
 * @property {number} total  - Nombre total de situations
 */

/**
 * @typedef {Object} LogEvent
 * @property {string} type
 * @property {Object} data
 * @property {number} t
 */

/**
 * @typedef {Object} SituationStats
 * @property {number}      idx
 * @property {string}      id
 * @property {string}      label
 * @property {'active'|'perfect'|'good'|'struggled'} status
 * @property {number}      countErrors
 * @property {number}      nameErrors
 * @property {number|null} durationMs
 * @property {boolean}     fullScore
 * @property {Array<{chosen:string, answer:string}>} distractors
 */

// ─── Sous-composants locaux ─────────────────────────────────────────────────────

/**
 * Carte de métrique synthèse (temps, avancement, 1er essai).
 *
 * @param {Object}      props
 * @param {string}      props.icon  - Emoji
 * @param {string}      props.label - Libellé de la métrique
 * @param {JSX.Element|string} props.value - Valeur principale
 * @param {string|null} props.sub   - Sous-texte optionnel
 * @param {string}      props.bg    - Couleur de fond (hex)
 * @param {string}      props.color - Couleur du texte (hex)
 */
function MetricCard({ icon, label, value, sub, bg, color }) {
    return (
        <div
            className="rounded-2xl p-3 text-center flex flex-col items-center gap-0.5"
            style={{ background: bg }}
        >
            <span className="text-lg">{icon}</span>
            <p
                className="text-2xl font-bold"
                style={{ color, fontFamily: "'Fredoka', sans-serif" }}
            >
                {value}
            </p>
            <p className="text-xs font-bold" style={{ color, opacity: 0.6 }}>
                {label}
            </p>
            {sub && (
                <p className="text-xs" style={{ color, opacity: 0.4 }}>
                    {sub}
                </p>
            )}
        </div>
    );
}

MetricCard.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
    sub: PropTypes.string,
    bg: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

MetricCard.defaultProps = { sub: null };

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Tableau de bord enseignant — overlay fullscreen.
 *
 * @param {Object}      props
 * @param {LogEvent[]}  props.events       - Journal complet des événements
 * @param {AtelierMeta} props.atelierMeta  - Métadonnées de l'atelier en cours
 * @param {number}      props.startTs      - Timestamp de début de séance
 * @param {Function}    props.onClose      - Ferme le Dashboard
 *
 * @returns {JSX.Element}
 */
export default function Dashboard({ events, atelierMeta, startTs, onClose }) {
    // ── Dérivation des statistiques ─────────────────────────────────────────────
    /** @type {SituationStats[]} */
    const sits = useMemo(() => {
        /** @type {Object.<number, SituationStats>} */
        const map = {};

        events.forEach(({ type, data }) => {
            // Initialisation à la première rencontre d'un idx
            if (type === "SIT_START") {
                map[data.idx] = {
                    ...data,
                    status: "active",
                    countErrors: 0,
                    nameErrors: 0,
                    durationMs: null,
                    fullScore: false,
                    distractors: [],
                };
            }

            // Garde-fou : ignorer les événements sans situation initialisée
            if (!map[data.idx]) return;

            if (type === "COUNT_ERR") {
                map[data.idx].countErrors =
                    (map[data.idx].countErrors || 0) + 1;
            }

            if (type === "NAME_ERR") {
                map[data.idx].nameErrors = (map[data.idx].nameErrors || 0) + 1;
                map[data.idx].distractors.push({
                    chosen: data.chosen,
                    answer: data.answer,
                });
            }

            if (type === "SIT_DONE") {
                const totalErrors =
                    (map[data.idx].countErrors || 0) +
                    (map[data.idx].nameErrors || 0);

                Object.assign(map[data.idx], {
                    durationMs: data.durationMs,
                    fullScore: data.fullScore,
                    status: data.fullScore
                        ? "perfect"
                        : totalErrors <= 2
                          ? "good"
                          : "struggled",
                });
            }
        });

        return Object.values(map).sort((a, b) => a.idx - b.idx);
    }, [events]);

    // ── Métriques dérivées ──────────────────────────────────────────────────────
    const done = sits.filter((s) => s.status !== "active");
    const current = sits.find((s) => s.status === "active");
    const firstTryCount = done.filter(
        (s) => s.countErrors === 0 || s.countErrors === null
    ).length;
    const firstTryName = done.filter((s) => s.nameErrors === 0).length;
    const avgDur =
        done.length > 0
            ? done.reduce((sum, x) => sum + (x.durationMs || 0), 0) /
              done.length
            : null;

    const firstTryPct =
        done.length > 0
            ? Math.round(
                  ((firstTryCount + firstTryName) / (done.length * 2)) * 100
              )
            : 0;

    // ── Distracteurs agrégés (toutes situations confondues) ─────────────────────
    /** @type {Array<{chosen:string, answer:string, count:number}>} */
    const allDistractors = useMemo(() => {
        /** @type {Object.<string, {chosen:string, answer:string, count:number}>} */
        const acc = {};
        sits.forEach((s) =>
            (s.distractors || []).forEach(({ chosen, answer }) => {
                const k = `${chosen}||${answer}`;
                if (!acc[k]) acc[k] = { chosen, answer, count: 0 };
                acc[k].count++;
            })
        );
        return Object.values(acc).sort((a, b) => b.count - a.count);
    }, [sits]);

    // ── Légende de la frise ─────────────────────────────────────────────────────
    const LEGEND = [
        { status: "perfect", color: "#10B981", label: "1er coup" },
        { status: "good", color: "#F59E0B", label: "avec erreurs" },
        { status: "struggled", color: "#F97316", label: "difficultés" },
        { status: "active", color: "#3B82F6", label: "en cours" },
        { status: "pending", color: "#E2E8F0", label: "à venir" },
    ];

    // ── Rendu ───────────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{
                background: "rgba(15,23,42,.85)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="flex-1 overflow-y-auto p-3 pb-8 kf-up print-page">
                <div className="max-w-xl mx-auto">
                    {/* ── En-tête ── */}
                    <div className="flex items-center justify-between mb-4 no-print">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            <div>
                                <p
                                    className="text-white font-bold text-lg leading-tight"
                                    style={{
                                        fontFamily: "'Fredoka', sans-serif",
                                    }}
                                >
                                    Tableau de bord
                                </p>
                                <p className="text-blue-300 text-xs font-semibold">
                                    {atelierMeta.icon} {atelierMeta.label}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="text-white/60 hover:text-white text-xs font-bold
                           py-2 px-3 rounded-xl border border-white/20 no-print
                           transition-colors"
                            >
                                🖨 Imprimer
                            </button>
                            <button
                                onClick={onClose}
                                aria-label="Fermer le tableau de bord"
                                className="text-white font-bold text-lg py-1 px-4 rounded-xl
                           hover:bg-white/20 transition-colors"
                                style={{ background: "rgba(255,255,255,.15)" }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* ── Métriques synthèse ── */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <MetricCard
                            icon="🕐"
                            label="Temps"
                            value={<LiveTimer startTs={startTs} />}
                            sub={avgDur ? `~${fmtMs(avgDur)}/sit` : null}
                            bg="#1E3A5F"
                            color="#93C5FD"
                        />
                        <MetricCard
                            icon="📍"
                            label="Avancement"
                            value={`${done.length}/${atelierMeta.total}`}
                            sub={`${
                                done.length
                                    ? Math.round(
                                          (done.length / atelierMeta.total) *
                                              100
                                      )
                                    : 0
                            }% terminé`}
                            bg="#1A3327"
                            color="#6EE7B7"
                        />
                        <MetricCard
                            icon="🎯"
                            label="1er essai"
                            value={`${firstTryPct}%`}
                            sub="comptage + nommage"
                            bg="#321530"
                            color="#F9A8D4"
                        />
                    </div>

                    {/* ── Frise de progression ── */}
                    <div className="bg-white/10 rounded-2xl p-4 mb-3">
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
                            Progression situation par situation
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {Array.from({ length: atelierMeta.total }).map(
                                (_, i) => {
                                    const s = sits.find((x) => x.idx === i);
                                    const status = s ? s.status : "pending";
                                    const label = s ? s.label : `S${i + 1}`;
                                    return (
                                        <SituationDot
                                            key={i}
                                            status={status}
                                            label={label}
                                        />
                                    );
                                }
                            )}
                        </div>

                        {/* Légende */}
                        <div className="flex flex-wrap gap-4 mt-3">
                            {LEGEND.map(({ status, color, label }) => (
                                <div
                                    key={status}
                                    className="flex items-center gap-1.5"
                                >
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full"
                                        style={{ background: color }}
                                    />
                                    <span className="text-xs text-white/50 font-semibold">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Tableau détaillé par situation ── */}
                    {done.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 mb-3">
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-3">
                                Détail par situation
                            </p>
                            <div className="overflow-x-auto">
                                <table
                                    className="w-full text-sm"
                                    style={{
                                        borderCollapse: "separate",
                                        borderSpacing: "0 4px",
                                    }}
                                >
                                    <thead>
                                        <tr className="text-xs font-bold text-slate-400 uppercase">
                                            <th className="text-left pb-2 pr-2">
                                                Situation
                                            </th>
                                            <th className="text-center pb-2 px-2">
                                                Comptage
                                            </th>
                                            <th className="text-center pb-2 px-2">
                                                Nommage
                                            </th>
                                            <th className="text-center pb-2 px-2">
                                                Durée
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {done.map((s) => {
                                            const rowBg =
                                                s.status === "perfect"
                                                    ? "#F0FDF4"
                                                    : s.status === "good"
                                                      ? "#FFFBEB"
                                                      : "#FFF7ED";

                                            const ceOk =
                                                s.countErrors === 0 ||
                                                s.countErrors === null;
                                            const neOk = s.nameErrors === 0;

                                            return (
                                                <tr
                                                    key={s.idx}
                                                    style={{
                                                        background: rowBg,
                                                    }}
                                                >
                                                    <td
                                                        className="py-2 px-2 font-semibold text-slate-700
                                       rounded-l-xl text-xs"
                                                        style={{
                                                            maxWidth: "100px",
                                                        }}
                                                    >
                                                        {s.label}
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        {s.countErrors ===
                                                        null ? (
                                                            <span className="text-slate-300 text-xs">
                                                                —
                                                            </span>
                                                        ) : ceOk ? (
                                                            <span className="text-emerald-600 font-bold">
                                                                ✓
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-600 font-bold text-xs">
                                                                {s.countErrors}
                                                                ×err
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        {neOk ? (
                                                            <span className="text-emerald-600 font-bold">
                                                                ✓
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-600 font-bold text-xs">
                                                                {s.nameErrors}
                                                                ×err
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-slate-500 text-xs rounded-r-xl">
                                                        {fmtMs(s.durationMs)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Erreurs repérées ── */}
                    {allDistractors.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 mb-3">
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-1">
                                Erreurs repérées — conceptions à travailler
                            </p>
                            <p className="text-xs text-slate-400 mb-3">
                                Distracteurs choisis lors des erreurs de nommage
                                :
                            </p>
                            <div className="flex flex-wrap gap-2" role="list">
                                {allDistractors.map((d, i) => (
                                    <ErrPill
                                        key={i}
                                        chosen={d.chosen}
                                        answer={d.answer}
                                        count={d.count}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-300 mt-3">
                                💬 À exploiter lors de la mise en commun
                            </p>
                        </div>
                    )}

                    {/* ── Situation en cours ── */}
                    {current && (
                        <div
                            className="rounded-2xl p-3 mb-3 border border-blue-400/30"
                            style={{ background: "rgba(59,130,246,.15)" }}
                        >
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
                                Situation en cours
                            </p>
                            <p className="text-white font-bold">
                                {current.label}
                            </p>
                            {current.countErrors > 0 && (
                                <p className="text-xs text-amber-300 mt-1">
                                    Comptage : {current.countErrors} essai
                                    {current.countErrors > 1 ? "s" : ""}{" "}
                                    incorrect
                                    {current.countErrors > 1 ? "s" : ""}
                                </p>
                            )}
                            {current.nameErrors > 0 && (
                                <p className="text-xs text-orange-300">
                                    Nommage : {current.nameErrors} essai
                                    {current.nameErrors > 1 ? "s" : ""}{" "}
                                    incorrect
                                    {current.nameErrors > 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── Pied de page ── */}
                    <div
                        className="rounded-2xl p-3"
                        style={{ background: "rgba(255,255,255,.06)" }}
                    >
                        <p className="text-white/40 text-xs text-center font-semibold">
                            CAREC Grenoble · A. Tricot (modes opératoires) ·
                            Enseignement explicite · S6/6
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.propTypes = {
    /** Journal complet des événements pédagogiques */
    events: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            data: PropTypes.object.isRequired,
            t: PropTypes.number.isRequired,
        })
    ).isRequired,
    /** Métadonnées de l'atelier affiché */
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    /** Timestamp de début de la séance (Date.now()) */
    startTs: PropTypes.number.isRequired,
    /** Ferme l'overlay */
    onClose: PropTypes.func.isRequired,
};
