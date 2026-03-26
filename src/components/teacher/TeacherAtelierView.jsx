/**
 * @file TeacherAtelierView.jsx — vue détaillée d'un atelier côté enseignant.
 *
 * @description
 * Rend la Navbar en mode 'teacher' avec flèche retour vers TeacherHome.
 * Affiche résultats de la classe, resets, et bouton Lancer/Arrêter session.
 *
 * ClassTracker et ses sous-composants (StudentRow, StudentDetail) utilisent
 * des couleurs calibrées pour un fond sombre (héritage du Dashboard overlay).
 * Ils sont donc enveloppés dans un panneau `bg-slate-800` pour conserver
 * leur lisibilité sans modifier leurs styles internes.
 *
 * @module teacher/TeacherAtelierView
 */

import PropTypes from "prop-types";
import { ATELIERS } from "../../data/ateliers.js";
import ClassTracker from "../dashboard/ClassTracker.jsx";
import Navbar from "../Navbar.jsx";

// ─── Sous-composant : bandeau session active ────────────────────────────────────

/**
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white
                           transition-colors touch-manipulation"
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
 * @param {Object}      props
 * @param {string}      props.atelierID       - ID de l'atelier
 * @param {Array}       props.students        - Liste des élèves
 * @param {Object}      props.traces          - Store de traces
 * @param {string|null} props.launchedAtelier - Atelier en session
 * @param {Function}    props.resetStudent    - Reset élève/atelier
 * @param {Function}    props.resetStudentAll - Reset élève/tous ateliers
 * @param {Function}    props.resetAll        - Reset tout
 * @param {Function}    props.onLaunchSession - Lance la session
 * @param {Function}    props.onStopSession   - Arrête la session
 * @param {Function}    props.onBack          - Retour à TeacherHome
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
        <>
            <Navbar mode="teacher" atelierMeta={atelierMeta} onBack={onBack} />

            <div
                className="min-h-screen pt-14 pb-10"
                style={{ background: "#F1EDE4" }}
            >
                <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
                    {/* ── Bandeau session active ── */}
                    {isThisActive && (
                        <SessionBanner
                            atelierMeta={atelierMeta}
                            onStop={onStopSession}
                        />
                    )}

                    {/* ── Bouton Lancer / état bloqué ── */}
                    {!isThisActive &&
                        (otherActive ? (
                            <div
                                className="w-full py-4 rounded-2xl text-center
                                            border-2 border-dashed border-slate-300"
                            >
                                <p className="text-slate-500 font-bold text-sm">
                                    Une session est déjà active sur un autre
                                    atelier
                                </p>
                                <p className="text-slate-400 text-xs font-semibold mt-1">
                                    Arrête d&apos;abord cette session pour en
                                    lancer une nouvelle
                                </p>
                            </div>
                        ) : (
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
                        ))}

                    {/* ── Résultats de la classe ────────────────────────────────
                        ClassTracker et ses enfants (StudentRow, StudentDetail)
                        utilisent des couleurs pour fond sombre — héritage du
                        Dashboard. On leur fournit ce fond via bg-slate-800.
                    ── */}
                    <section>
                        <h2
                            className="text-xs font-bold uppercase tracking-widest
                                       text-slate-400 mb-3"
                        >
                            📊 Résultats de la classe
                        </h2>

                        <div className="rounded-2xl overflow-hidden bg-slate-800 p-2">
                            <ClassTracker
                                students={students}
                                traces={traces}
                                atelierID={atelierID}
                                atelierMeta={atelierMeta}
                                resetStudent={resetStudent}
                                resetStudentAll={resetStudentAll}
                                resetAll={resetAll}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </>
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
