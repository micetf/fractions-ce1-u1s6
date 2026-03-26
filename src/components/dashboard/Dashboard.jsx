/**
 * @file Dashboard — tableau de bord enseignant en temps réel.
 *
 * @description
 * Orchestrateur : dérive les statistiques via `useSituationStats` et
 * assemble les sections. Aucune logique de calcul inline.
 *
 * Sous-composants délégués :
 * - useSituationStats  : dérivation complète depuis le journal d'événements
 * - MetricCard         : carte de métrique synthèse
 * - ProgressionFrise   : frise colorée + légende
 * - SituationsTable    : tableau détaillé avec colonne Prédiction
 * - ErrPill            : badge distracteur (existant)
 * - SituationDot       : point coloré (existant, utilisé par ProgressionFrise)
 * - LiveTimer          : timer mis à jour chaque seconde (existant)
 *
 * ────────────────────────────────────────────────────────────────
 * Sections affichées
 * ────────────────────────────────────────────────────────────────
 * 1. En-tête (titre atelier, boutons Imprimer / Fermer)
 * 2. Métriques synthèse (temps, avancement, taux 1er essai)
 * 3. Frise de progression (ProgressionFrise)
 * 4. Tableau détaillé (SituationsTable)
 * 5. Erreurs repérées — distracteurs fréquents (ErrPill)
 * 6. Situation en cours
 * 7. Pied de page institutionnel
 *
 * ────────────────────────────────────────────────────────────────
 * Impression
 * ────────────────────────────────────────────────────────────────
 * Le bouton 🖨 déclenche window.print().
 * Les éléments `.no-print` sont masqués via @media print (index.css).
 *
 * @see useSituationStats
 */

import PropTypes from "prop-types";
import { fmtMs } from "../../utils/time.js";

import LiveTimer from "./LiveTimer.jsx";
import ErrPill from "./ErrPill.jsx";
import MetricCard from "./MetricCard.jsx";
import ProgressionFrise from "./ProgressionFrise.jsx";
import SituationsTable from "./SituationsTable.jsx";
import { useSituationStats } from "../../hooks/useSituationStats";

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Tableau de bord enseignant — overlay fullscreen.
 *
 * @param {Object}      props
 * @param {LogEvent[]}  props.events      - Journal complet des événements
 * @param {AtelierMeta} props.atelierMeta - Métadonnées de l'atelier en cours
 * @param {number}      props.startTs     - Timestamp de début de séance
 * @param {Function}    props.onClose     - Ferme le Dashboard
 *
 * @returns {JSX.Element}
 */
export default function Dashboard({ events, atelierMeta, startTs, onClose }) {
    // ── Statistiques dérivées ────────────────────────────────────────────────────

    const { sits, done, current, allDistractors, firstTryPct, avgDur } =
        useSituationStats(events);

    // ── Rendu ────────────────────────────────────────────────────────────────────

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
                                           py-2 px-3 rounded-xl border border-white/20
                                           no-print transition-colors"
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
                            sub="predict + nommage"
                            bg="#321530"
                            color="#F9A8D4"
                        />
                    </div>

                    {/* ── Frise de progression ── */}
                    <ProgressionFrise sits={sits} total={atelierMeta.total} />

                    {/* ── Tableau détaillé ── */}
                    <SituationsTable done={done} />

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
                            {current.nameErrors > 0 && (
                                <p className="text-xs text-orange-300 mt-1">
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
