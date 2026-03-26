/**
 * @file Dashboard.jsx — tableau de bord enseignant à deux onglets.
 *
 * @description
 * Orchestrateur étendu avec un système d'onglets et un contrôle d'accès.
 *
 * ── Onglet "📊 Session" ────────────────────────────────────────
 * Toujours visible. Accessible à tous (bouton Navbar).
 * Contenu : métriques, frise, tableau détaillé, distracteurs,
 * situation en cours.
 *
 * ── Onglet "👥 Classe" ─────────────────────────────────────────
 * Visible uniquement si `teacherMode === true`.
 * Accessible via TeacherMenu uniquement (protégé par appui long).
 * Contenu : RosterManager (CRUD élèves) + ClassTracker (suivi + resets).
 *
 * ────────────────────────────────────────────────────────────────
 * Prop teacherMode
 * ────────────────────────────────────────────────────────────────
 * false (défaut) : ouverture via bouton 📊 Navbar — Session uniquement.
 * true           : ouverture via TeacherMenu — les deux onglets visibles.
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
 * @param {Object}      props
 * @param {Array}       props.events        - Journal complet des événements
 * @param {Object}      props.atelierMeta   - Métadonnées de l'atelier
 * @param {number|null} props.startTs       - Timestamp début de séance (null avant 1ère session)
 * @param {string}      [props.defaultTab]  - Onglet affiché à l'ouverture
 * @param {boolean}     [props.teacherMode] - true = onglet Classe visible
 * @param {Function}    props.onClose
 * @param {Array}       props.students
 * @param {Object}      props.traces
 * @param {string}      props.atelierID
 * @param {Function}    props.addStudent
 * @param {Function}    props.removeStudent
 * @param {Function}    props.resetStudent
 * @param {Function}    props.resetAtelier
 * @param {Function}    props.resetAll
 */
export default function Dashboard({
    events,
    atelierMeta,
    startTs,
    defaultTab = "session",
    teacherMode = false,
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

                    {/* ── Sélecteur d'onglets — Classe visible en mode enseignant uniquement ── */}
                    {teacherMode && (
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
                    )}

                    {/* ════ ONGLET SESSION ════ */}
                    {(tab === "session" || !teacherMode) && (
                        <>
                            {hasSession ? (
                                <>
                                    {/* Métriques synthèse */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <MetricCard
                                            icon="🕐"
                                            label="Temps"
                                            value={
                                                <LiveTimer startTs={startTs} />
                                            }
                                            sub={
                                                avgDur
                                                    ? `~${fmtMs(avgDur)}/sit`
                                                    : null
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
                                                    {current.countErrors > 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    de comptage
                                                </p>
                                            )}
                                            {current.nameErrors > 0 && (
                                                <p className="text-orange-300 text-xs font-semibold">
                                                    {current.nameErrors} erreur
                                                    {current.nameErrors > 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    de nommage
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className="rounded-2xl p-3"
                                        style={{
                                            background: "rgba(255,255,255,.06)",
                                        }}
                                    >
                                        <p className="text-white/40 text-xs text-center font-semibold">
                                            CAREC Grenoble · A. Tricot ·
                                            Enseignement explicite · S6/6
                                        </p>
                                    </div>
                                </>
                            ) : (
                                /* Aucune session démarrée — message informatif */
                                <div
                                    className="rounded-2xl p-8 text-center"
                                    style={{
                                        background: "rgba(255,255,255,.06)",
                                    }}
                                >
                                    <p className="text-white/50 font-semibold">
                                        Aucune session en cours.
                                    </p>
                                    <p className="text-white/30 text-sm mt-1">
                                        Les données apparaîtront dès qu&apos;un
                                        élève aura commencé.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ════ ONGLET CLASSE — enseignant·e uniquement ════ */}
                    {teacherMode && tab === "classe" && (
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
    startTs: PropTypes.number,
    defaultTab: PropTypes.oneOf(["session", "classe"]),
    /** false = Session uniquement (élève) · true = Session + Classe (enseignant·e) */
    teacherMode: PropTypes.bool,
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
    teacherMode: false,
};
