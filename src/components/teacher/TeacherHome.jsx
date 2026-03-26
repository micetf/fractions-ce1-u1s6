/**
 * @file TeacherHome.jsx — accueil espace enseignant.
 *
 * @description
 * Vue principale de l'espace enseignant. Deux sections :
 *
 * 1. **Gestion de la classe** — RosterManager (ajout/suppression élèves)
 * 2. **Ateliers** — carte par atelier avec résumé de progression
 *    et accès à la vue détaillée (TeacherAtelierView).
 *
 * @module teacher/TeacherHome
 */

import PropTypes from "prop-types";
import { ATELIERS_LIST } from "../../data/ateliers.js";
import RosterManager from "../dashboard/RosterManager.jsx";

// ─── Sous-composant : carte atelier ────────────────────────────────────────────

/**
 * Carte d'un atelier affichant la progression de la classe
 * et un bouton d'accès à la vue détaillée.
 *
 * @param {Object}   props
 * @param {Object}   props.atelier  - Métadonnées de l'atelier
 * @param {Array}    props.students - Liste des élèves
 * @param {Object}   props.traces   - Store de traces complet
 * @param {boolean}  props.isActive - Vrai si cet atelier a une session en cours
 * @param {Function} props.onOpen   - Ouvre la vue détaillée
 */
function AtelierCard({ atelier: a, students, traces, isActive, onOpen }) {
    const atelierTraces = traces[a.id] ?? {};
    const done = students.filter((s) => atelierTraces[s.id]?.completed).length;
    const started = students.filter(
        (s) => atelierTraces[s.id]?.situations?.length > 0
    ).length;

    return (
        <button
            type="button"
            onClick={onOpen}
            className="w-full rounded-2xl p-4 text-left transition-all
                       hover:shadow-md active:scale-[.98] touch-manipulation"
            style={{
                background: a.light,
                border: `2px solid ${isActive ? a.color : a.color + "33"}`,
            }}
        >
            <div className="flex items-center gap-3">
                <span className="text-3xl shrink-0" aria-hidden="true">
                    {a.icon}
                </span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p
                            className="font-bold text-slate-800"
                            style={{ fontFamily: "'Fredoka', sans-serif" }}
                        >
                            {a.label}
                        </p>
                        {isActive && (
                            <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ background: a.color }}
                            >
                                ● Session active
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {students.length === 0
                            ? "Aucun élève"
                            : `${done}/${students.length} terminé${done !== 1 ? "s" : ""} · ${started} commencé${started !== 1 ? "s" : ""}`}
                    </p>
                </div>

                <span className="text-slate-400 font-bold text-lg shrink-0">
                    ›
                </span>
            </div>
        </button>
    );
}

AtelierCard.propTypes = {
    atelier: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired,
    traces: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    onOpen: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Accueil espace enseignant — gestion classe + navigation ateliers.
 *
 * @param {Object}   props
 * @param {Array}    props.students        - Liste des élèves
 * @param {Function} props.addStudent      - Ajoute un élève
 * @param {Function} props.removeStudent   - Supprime un élève
 * @param {Object}   props.traces          - Store de traces
 * @param {string|null} props.launchedAtelier - Atelier en session (null = aucun)
 * @param {Function} props.onOpenAtelier   - Ouvre la vue TeacherAtelierView(id)
 * @param {Function} props.onExit          - Quitte l'espace enseignant
 * @returns {JSX.Element}
 */
export default function TeacherHome({
    students,
    addStudent,
    removeStudent,
    traces,
    launchedAtelier,
    onOpenAtelier,
    onExit,
}) {
    return (
        <div className="min-h-screen pb-10" style={{ background: "#F1EDE4" }}>
            <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">
                {/* ── En-tête ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="text-2xl font-bold text-slate-800"
                            style={{ fontFamily: "'Fredoka', sans-serif" }}
                        >
                            🎓 Espace enseignant·e
                        </h1>
                        <p className="text-slate-500 text-sm font-semibold mt-0.5">
                            Fractions CE1 · CAREC Grenoble
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onExit}
                        className="px-3 py-2 rounded-xl text-sm font-bold
                                   text-slate-500 hover:text-slate-800
                                   border border-slate-200 bg-white hover:bg-slate-50
                                   transition-colors touch-manipulation"
                    >
                        Quitter
                    </button>
                </div>

                {/* ── Section 1 : Gestion de la classe ── */}
                <section>
                    <h2
                        className="text-xs font-bold uppercase tracking-widest
                                   text-slate-400 mb-3"
                    >
                        👥 Ma classe
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm">
                        <RosterManager
                            students={students}
                            addStudent={addStudent}
                            removeStudent={removeStudent}
                            traces={traces}
                        />
                    </div>
                </section>

                {/* ── Section 2 : Ateliers ── */}
                <section>
                    <h2
                        className="text-xs font-bold uppercase tracking-widest
                                   text-slate-400 mb-3"
                    >
                        📚 Ateliers
                    </h2>
                    <div className="flex flex-col gap-3">
                        {ATELIERS_LIST.map((a) => (
                            <AtelierCard
                                key={a.id}
                                atelier={a}
                                students={students}
                                traces={traces}
                                isActive={launchedAtelier === a.id}
                                onOpen={() => onOpenAtelier(a.id)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

TeacherHome.propTypes = {
    students: PropTypes.array.isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
    launchedAtelier: PropTypes.string,
    onOpenAtelier: PropTypes.func.isRequired,
    onExit: PropTypes.func.isRequired,
};

TeacherHome.defaultProps = {
    launchedAtelier: null,
};
