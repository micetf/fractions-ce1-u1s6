/**
 * @file Dashboard.jsx — tableau de bord enseignant à deux onglets.
 *
 * @description
 * Orchestrateur étendu avec un système d'onglets :
 *
 * ── Onglet "📊 Session" ────────────────────────────────────────
 * Contenu existant inchangé :
 * - Métriques synthèse (temps, avancement, taux 1er essai)
 * - Frise de progression (ProgressionFrise)
 * - Tableau détaillé (SituationsTable)
 * - Erreurs repérées (ErrPill)
 * - Situation en cours
 *
 * ── Onglet "👥 Classe" ─────────────────────────────────────────
 * - RosterManager : CRUD du registre d'élèves
 * - ClassTracker  : progression élèves × atelier courant + resets
 *
 * ────────────────────────────────────────────────────────────────
 * Ouverture ciblée
 * ────────────────────────────────────────────────────────────────
 * La prop `defaultTab` permet d'ouvrir le Dashboard directement sur
 * l'onglet "Classe" (ex : depuis StudentSelectScreen avant toute session).
 * Quand `startTs` est null, l'onglet Session est masqué pour éviter
 * un LiveTimer sans timestamp de départ.
 *
 * @module Dashboard
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { fmtMs } from "../../utils/time.js";

import LiveTimer from "./LiveTimer.jsx";
import ErrPill from "./ErrPill.jsx";
import MetricCard from "./MetricCard.jsx";
import ProgressionFrise from "./ProgressionFrise.jsx";
import SituationsTable from "./SituationsTable.jsx";
import RosterManager from "./RosterManager.jsx";
import ClassTracker from "./ClassTracker.jsx";
import { useSituationStats } from "../../hooks/useSituationStats";

// ─── Sous-composant : bouton d'onglet ──────────────────────────────────────────

/**
 * @param {{ label:string, active:boolean, onClick:Function }} props
 */
function Tab({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-colors
                        touch-manipulation ${
                            active
                                ? "bg-white/15 text-white"
                                : "text-white/50 hover:text-white/80"
                        }`}
        >
            {label}
        </button>
    );
}

Tab.propTypes = {
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Tableau de bord enseignant — overlay fullscreen à deux onglets.
 *
 * @param {Object}      props
 * @param {Array}       props.events         - Journal complet des événements
 * @param {Object}      props.atelierMeta    - Métadonnées de l'atelier (icon, label, color, total)
 * @param {number|null} props.startTs        - Timestamp début de séance (null avant première session)
 * @param {string}      [props.defaultTab]   - Onglet affiché à l'ouverture ("session"|"classe")
 * @param {Function}    props.onClose        - Ferme le Dashboard
 * @param {Array}       props.students       - Registre élèves (useRoster)
 * @param {Object}      props.traces         - Store de traces (useStudentTraces)
 * @param {string}      props.atelierID      - Identifiant atelier courant
 * @param {Function}    props.addStudent     - Ajoute un élève
 * @param {Function}    props.removeStudent  - Supprime un élève
 * @param {Function}    props.resetStudent   - Reset individuel (atelierID, studentId)
 * @param {Function}    props.resetAtelier   - Reset par atelier (atelierID)
 * @param {Function}    props.resetAll       - Reset total
 *
 * @returns {JSX.Element}
 */
export default function Dashboard({
    events,
    atelierMeta,
    startTs,
    defaultTab = "session",
    onClose,
    students,
    traces,
    atelierID,
    addStudent,
    removeStudent,
    resetStudent,
    resetAtelier,
    resetAll,
}) {
    const [tab, setTab] = useState(defaultTab);
    const { sits, done, current, allDistractors, firstTryPct, avgDur } =
        useSituationStats(events);

    // Si aucune session n'a démarré, l'onglet Session n'a pas de sens
    const hasSession = startTs !== null;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{
                background: "rgba(15,23,42,.92)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="flex-1 overflow-y-auto p-3 pb-8 kf-up print-page">
                <div className="max-w-xl mx-auto">
                    {/* ── En-tête ── */}
                    <div className="flex items-center justify-between mb-3 no-print">
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
                            {tab === "session" && hasSession && (
                                <button
                                    onClick={() => window.print()}
                                    className="text-white/60 hover:text-white text-xs font-bold
                                               py-2 px-3 rounded-xl border border-white/20
                                               no-print transition-colors"
                                >
                                    🖨 Imprimer
                                </button>
                            )}
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

                    {/* ── Sélecteur d'onglets ── */}
                    <div className="flex gap-1 mb-4 no-print border-b border-white/10 pb-1">
                        {hasSession && (
                            <Tab
                                label="📊 Session en cours"
                                active={tab === "session"}
                                onClick={() => setTab("session")}
                            />
                        )}
                        <Tab
                            label="👥 Suivi classe"
                            active={tab === "classe"}
                            onClick={() => setTab("classe")}
                        />
                    </div>

                    {/* ════ ONGLET SESSION ════ */}
                    {tab === "session" && hasSession && (
                        <>
                            {/* Métriques synthèse */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <MetricCard
                                    icon="🕐"
                                    label="Temps"
                                    value={<LiveTimer startTs={startTs} />}
                                    sub={
                                        avgDur ? `~${fmtMs(avgDur)}/sit` : null
                                    }
                                    bg="#1E3A5F"
                                    color="#93C5FD"
                                />
                                <MetricCard
                                    icon="📍"
                                    label="Avancement"
                                    value={`${done.length}/${atelierMeta.total}`}
                                    sub={`${done.length ? Math.round((done.length / atelierMeta.total) * 100) : 0}% terminé`}
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

                            <ProgressionFrise
                                sits={sits}
                                total={atelierMeta.total}
                            />
                            <SituationsTable done={done} />

                            {/* Distracteurs */}
                            {allDistractors.length > 0 && (
                                <div className="bg-white rounded-2xl p-4 mb-3">
                                    <p
                                        className="text-slate-600 text-xs font-bold
                                                  uppercase tracking-widest mb-2"
                                    >
                                        Erreurs repérées — distracteurs
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {allDistractors.map((d, i) => (
                                            <ErrPill
                                                key={i}
                                                chosen={d.chosen}
                                                answer={d.answer}
                                                count={d.count}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Situation en cours */}
                            {current && (
                                <div className="bg-white/10 rounded-2xl p-4 mb-3">
                                    <p
                                        className="text-white/70 text-xs font-bold
                                                  uppercase tracking-widest mb-1"
                                    >
                                        Situation en cours
                                    </p>
                                    <p className="text-white font-bold">
                                        {current.label}
                                    </p>
                                    {current.countErrors > 0 && (
                                        <p className="text-amber-300 text-xs font-semibold mt-1">
                                            {current.countErrors} erreur
                                            {current.countErrors > 1 ? "s" : ""}{" "}
                                            de comptage
                                        </p>
                                    )}
                                    {current.nameErrors > 0 && (
                                        <p className="text-orange-300 text-xs font-semibold">
                                            {current.nameErrors} erreur
                                            {current.nameErrors > 1 ? "s" : ""}{" "}
                                            de nommage
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Pied de page */}
                            <div
                                className="rounded-2xl p-3"
                                style={{ background: "rgba(255,255,255,.06)" }}
                            >
                                <p className="text-white/40 text-xs text-center font-semibold">
                                    CAREC Grenoble · A. Tricot (modes
                                    opératoires) · Enseignement explicite · S6/6
                                </p>
                            </div>
                        </>
                    )}

                    {/* ════ ONGLET CLASSE ════ */}
                    {tab === "classe" && (
                        <>
                            <RosterManager
                                students={students}
                                addStudent={addStudent}
                                removeStudent={removeStudent}
                                traces={traces}
                            />
                            <ClassTracker
                                students={students}
                                traces={traces}
                                atelierID={atelierID}
                                atelierMeta={atelierMeta}
                                resetStudent={resetStudent}
                                resetAtelier={resetAtelier}
                                resetAll={resetAll}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

Dashboard.propTypes = {
    events: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            data: PropTypes.object.isRequired,
            t: PropTypes.number.isRequired,
        })
    ).isRequired,
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    /** Timestamp de début de séance — null avant la première session élève */
    startTs: PropTypes.number,
    /** Onglet affiché à l'ouverture ("session" | "classe") */
    defaultTab: PropTypes.oneOf(["session", "classe"]),
    onClose: PropTypes.func.isRequired,
    students: PropTypes.array.isRequired,
    traces: PropTypes.object.isRequired,
    atelierID: PropTypes.string.isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    resetStudent: PropTypes.func.isRequired,
    resetAtelier: PropTypes.func.isRequired,
    resetAll: PropTypes.func.isRequired,
};

Dashboard.defaultProps = {
    startTs: null,
    defaultTab: "session",
};
