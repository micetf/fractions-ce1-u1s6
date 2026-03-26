/**
 * @file TeacherAtelierView.jsx — vue détaillée d'un atelier côté enseignant.
 *
 * @description
 * Affiche pour un atelier donné :
 * - Suivi de tous les élèves (ClassTracker)
 * - Actions de réinitialisation (par élève / atelier / tous)
 * - Bouton ▶ Lancer une session (si pas de session active)
 * - Badge + bouton ■ Arrêter (si session active sur CET atelier)
 *
 * @module teacher/TeacherAtelierView
 */

import PropTypes from "prop-types";
import { ATELIERS } from "../../data/ateliers.js";
import ClassTracker from "../dashboard/ClassTracker.jsx";

// ─── Sous-composant : bandeau session ──────────────────────────────────────────

/**
 * Bandeau affiché quand une session est active sur cet atelier.
 *
 * @param {{ atelierMeta: Object, onStop: Function }} props
 */
function SessionBanner({ atelierMeta, onStop }) {
    return (
        <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{
                background: atelierMeta.light,
                border: `2px solid ${atelierMeta.border}`,
            }}
        >
            <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span
                        className="animate-ping absolute inline-flex h-full w-full
                                   rounded-full opacity-75"
                        style={{ background: atelierMeta.color }}
                    />
                    <span
                        className="relative inline-flex rounded-full h-2.5 w-2.5"
                        style={{ background: atelierMeta.color }}
                    />
                </span>
                <p
                    className="font-bold text-sm"
                    style={{ color: atelierMeta.color }}
                >
                    Session en cours — les élèves peuvent rejoindre
                </p>
            </div>
            <button
                type="button"
                onClick={onStop}
                className="px-3 py-1.5 rounded-xl text-xs font-bold
                           text-white transition-colors touch-manipulation"
                style={{ background: atelierMeta.color }}
            >
                ■ Arrêter
            </button>
        </div>
    );
}

SessionBanner.propTypes = {
    atelierMeta: PropTypes.object.isRequired,
    onStop: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Vue détaillée d'un atelier pour l'enseignant·e.
 *
 * @param {Object}      props
 * @param {string}      props.atelierID        - ID de l'atelier ('tg' | 'dq' | 'cu')
 * @param {Array}       props.students         - Liste des élèves
 * @param {Object}      props.traces           - Store de traces complet
 * @param {string|null} props.launchedAtelier  - Atelier en session (null = aucun)
 * @param {Function}    props.resetStudent     - (atelierID, studentId) → void
 * @param {Function}    props.resetStudentAll  - (studentId) → void
 * @param {Function}    props.resetAll         - () → void
 * @param {Function}    props.onLaunchSession  - Lance une session sur cet atelier
 * @param {Function}    props.onStopSession    - Arrête la session en cours
 * @param {Function}    props.onBack           - Retour à TeacherHome
 * @returns {JSX.Element}
 */
export default function TeacherAtelierView({
    atelierID,
    students,
    traces,
    launchedAtelier,
    resetStudent,
    resetStudentAll,
    resetAll,
    onLaunchSession,
    onStopSession,
    onBack,
}) {
    const atelierMeta = ATELIERS[atelierID];
    const isThisActive = launchedAtelier === atelierID;
    const otherActive = launchedAtelier !== null && !isThisActive;

    return (
        <div className="min-h-screen pb-10" style={{ background: "#F1EDE4" }}>
            <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
                {/* ── En-tête ── */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800
                                   bg-white border border-slate-200 hover:bg-slate-50
                                   transition-colors touch-manipulation shrink-0"
                        aria-label="Retour"
                    >
                        ←
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl shrink-0" aria-hidden="true">
                            {atelierMeta.icon}
                        </span>
                        <h1
                            className="text-xl font-bold text-slate-800 truncate"
                            style={{ fontFamily: "'Fredoka', sans-serif" }}
                        >
                            {atelierMeta.label}
                        </h1>
                        <span className="text-xs font-semibold text-slate-400 shrink-0">
                            {atelierMeta.total} situations
                        </span>
                    </div>
                </div>

                {/* ── Bandeau session (si active sur CET atelier) ── */}
                {isThisActive && (
                    <SessionBanner
                        atelierMeta={atelierMeta}
                        onStop={onStopSession}
                    />
                )}

                {/* ── Bouton Lancer / état bloqué ── */}
                {!isThisActive && (
                    <div>
                        {otherActive ? (
                            /* Une autre session est déjà active */
                            <div
                                className="w-full py-4 rounded-2xl text-center
                                           border-2 border-dashed border-slate-300"
                            >
                                <p className="text-slate-400 font-bold text-sm">
                                    Une session est déjà active sur un autre
                                    atelier
                                </p>
                                <p className="text-slate-400 text-xs font-semibold mt-1">
                                    Arrête d&apos;abord cette session pour en
                                    lancer une nouvelle
                                </p>
                            </div>
                        ) : (
                            /* Aucune session active — peut lancer */
                            <button
                                type="button"
                                onClick={() => onLaunchSession(atelierID)}
                                className="w-full py-4 rounded-2xl text-white font-bold
                                           text-base shadow-md active:scale-[.99]
                                           transition-all touch-manipulation"
                                style={{ background: atelierMeta.color }}
                            >
                                ▶ Lancer une session
                            </button>
                        )}
                    </div>
                )}

                {/* ── Résultats élèves ── */}
                <section>
                    <h2
                        className="text-xs font-bold uppercase tracking-widest
                                   text-slate-400 mb-3"
                    >
                        📊 Résultats de la classe
                    </h2>
                    <ClassTracker
                        students={students}
                        traces={traces}
                        atelierID={atelierID}
                        atelierMeta={{
                            ...atelierMeta,
                            total: atelierMeta.total,
                        }}
                        resetStudent={resetStudent}
                        resetStudentAll={resetStudentAll}
                        resetAll={resetAll}
                    />
                </section>
            </div>
        </div>
    );
}

TeacherAtelierView.propTypes = {
    atelierID: PropTypes.string.isRequired,
    students: PropTypes.array.isRequired,
    traces: PropTypes.object.isRequired,
    launchedAtelier: PropTypes.string,
    resetStudent: PropTypes.func.isRequired,
    resetStudentAll: PropTypes.func.isRequired,
    resetAll: PropTypes.func.isRequired,
    onLaunchSession: PropTypes.func.isRequired,
    onStopSession: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};

TeacherAtelierView.defaultProps = {
    launchedAtelier: null,
};
