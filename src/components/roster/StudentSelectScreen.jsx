/**
 * @file StudentSelectScreen.jsx — écran de sélection de l'élève actif.
 *
 * @description
 * Overlay plein écran affiché obligatoirement :
 * - au premier chargement de l'atelier
 * - après un refresh de page
 * - quand un élève termine et passe la tablette (DoneScreen → onDone)
 * - quand l'enseignant·e choisit "Changer d'élève" dans TeacherMenu
 *
 * ────────────────────────────────────────────────────────────────
 * Amélioration Piste B
 * ────────────────────────────────────────────────────────────────
 * Quand le registre est vide, `EmptyRoster` affiche désormais un bouton
 * d'action direct qui ouvre `RosterManager` inline — sans nécessiter
 * la connaissance du long press sur la Navbar.
 *
 * Quand le premier élève est ajouté, le composant re-render automatiquement
 * (réactivité via `useRoster` → `useState` dans App.jsx) et affiche la
 * liste des élèves sans action supplémentaire.
 *
 * @module StudentSelectScreen
 */

import { useState } from "react";
import PropTypes from "prop-types";
import StudentCard from "./StudentCard.jsx";
import RosterManager from "../dashboard/RosterManager.jsx";

// ─── Sous-composant : registre vide ────────────────────────────────────────────

/**
 * Panneau affiché quand aucun élève n'est encore dans le registre.
 *
 * Deux états :
 * - **Fermé** : message d'invitation + bouton « Ajouter des élèves »
 * - **Ouvert** : RosterManager inline — l'enseignant·e saisit les prénoms
 *
 * Dès qu'un élève est ajouté, `students` (prop du parent) se met à jour
 * et `StudentSelectScreen` bascule automatiquement sur la liste.
 *
 * @param {Object}   props
 * @param {string}   props.color          - Couleur thématique de l'atelier
 * @param {Function} props.addStudent     - Ajoute un élève → err|null
 * @param {Function} props.removeStudent  - Supprime un élève par id
 * @param {Object}   props.traces         - Store de traces (pour RosterManager)
 * @returns {JSX.Element}
 */
function EmptyRoster({ color, addStudent, removeStudent, traces }) {
    const [rosterOpen, setRosterOpen] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4 py-4">
            {/* Icône + message */}
            <div className="text-center">
                <span className="text-5xl block mb-3" aria-hidden="true">
                    🙋
                </span>
                <p
                    className="text-slate-700 font-bold text-lg"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    Aucun élève dans la liste
                </p>
                <p className="text-slate-400 text-sm font-semibold mt-1">
                    Ajoute les prénoms avant de démarrer l&apos;activité.
                </p>
            </div>

            {/* Panneau RosterManager ou bouton d'ouverture */}
            {rosterOpen ? (
                <div className="w-full">
                    <RosterManager
                        students={[]}
                        addStudent={addStudent}
                        removeStudent={removeStudent}
                        traces={traces}
                    />
                    <button
                        type="button"
                        onClick={() => setRosterOpen(false)}
                        className="w-full mt-2 py-2 rounded-xl text-sm font-bold
                                   text-slate-400 hover:text-slate-600
                                   transition-colors touch-manipulation"
                    >
                        Fermer
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setRosterOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl
                               text-white font-bold text-base shadow-md
                               hover:opacity-90 active:scale-95
                               transition-all touch-manipulation"
                    style={{ background: color }}
                >
                    <span>＋</span>
                    <span>Ajouter des élèves</span>
                </button>
            )}
        </div>
    );
}

EmptyRoster.propTypes = {
    color: PropTypes.string.isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Overlay de sélection d'élève — bloquant, plein écran.
 *
 * @param {Object}   props
 * @param {Array}    props.students      - Liste des élèves (useRoster)
 * @param {Object}   props.atelierMeta  - Métadonnées de l'atelier actif
 * @param {Function} props.onSelect     - Callback(student: Student) → void
 * @param {Function} props.addStudent   - Ajoute un élève → err|null
 * @param {Function} props.removeStudent - Supprime un élève par id
 * @param {Object}   props.traces       - Store de traces
 * @returns {JSX.Element}
 */
export default function StudentSelectScreen({
    students,
    atelierMeta,
    onSelect,
    addStudent,
    removeStudent,
    traces,
}) {
    const { icon, label, color, light, border } = atelierMeta;

    return (
        <div
            className="fixed inset-0 z-40 flex flex-col items-center
                       justify-center p-5 kf-up"
            style={{ background: "#F1EDE4" }}
        >
            <div className="w-full" style={{ maxWidth: "400px" }}>
                {/* ── En-tête ── */}
                <div className="text-center mb-6">
                    {/* Badge atelier */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5
                                   rounded-full text-sm font-bold mb-4"
                        style={{
                            background: light,
                            border: `2px solid ${border}`,
                            color,
                        }}
                    >
                        <span>{icon}</span>
                        <span>{label}</span>
                    </div>

                    <h1
                        className="text-3xl font-bold text-slate-800 leading-tight"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        Qui es-tu ?
                    </h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1">
                        Choisis ton prénom dans la liste
                    </p>
                </div>

                {/* ── Liste élèves ou état vide ── */}
                {students.length === 0 ? (
                    <EmptyRoster
                        color={color}
                        addStudent={addStudent}
                        removeStudent={removeStudent}
                        traces={traces}
                    />
                ) : (
                    <div className="flex flex-col gap-3">
                        {students.map((student) => (
                            <StudentCard
                                key={student.id}
                                pseudo={student.pseudo}
                                color={color}
                                light={light}
                                border={border}
                                onSelect={() => onSelect(student)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

StudentSelectScreen.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            pseudo: PropTypes.string.isRequired,
        })
    ).isRequired,
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    addStudent: PropTypes.func.isRequired,
    removeStudent: PropTypes.func.isRequired,
    traces: PropTypes.object.isRequired,
};
