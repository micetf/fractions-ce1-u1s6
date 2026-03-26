/**
 * @file StudentSelectScreen.jsx — écran de sélection de l'élève actif.
 *
 * @description
 * Overlay plein écran affiché obligatoirement :
 * - au premier chargement de l'atelier
 * - après un refresh de page
 * - après qu'un élève a terminé sa session ("Changer d'élève")
 *
 * Cet écran est **bloquant** : aucun accès à l'atelier sans sélection.
 * Le contexte de l'atelier ouvert (icon + label) est affiché pour que
 * l'élève sache sur quelle tablette il se trouve.
 *
 * Si le registre est vide, un message d'attente est affiché à la place
 * de la liste — l'atelier reste inaccessible.
 *
 * @module StudentSelectScreen
 */

import PropTypes from "prop-types";
import StudentCard from "./StudentCard.jsx";

// ─── Sous-composant : état registre vide ────────────────────────────────────────

/**
 * Message affiché quand aucun élève n'est encore dans le registre.
 *
 * @param {Object} props
 * @param {string} props.color - Couleur thématique de l'atelier
 * @returns {JSX.Element}
 */
function EmptyRoster({ color }) {
    return (
        <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            <span className="text-5xl">🙋</span>
            <p
                className="text-slate-700 font-bold text-lg"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
                Aucun élève dans la liste
            </p>
            <p className="text-slate-500 text-sm font-semibold">
                Demande à ton enseignant·e d&apos;ajouter les élèves dans le
                tableau de bord.
            </p>
            {/* Indicateur visuel de l'atelier — repère pour l'élève */}
            <div
                className="mt-2 text-xs font-bold px-3 py-1 rounded-lg"
                style={{ color, background: `${color}18` }}
            >
                Cette tablette est en attente de configuration
            </div>
        </div>
    );
}

EmptyRoster.propTypes = {
    color: PropTypes.string.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Overlay de sélection d'élève — bloquant, plein écran.
 *
 * @param {Object}        props
 * @param {import('../../hooks/useRoster.js').Student[]} props.students
 *   Liste des élèves du registre (depuis useRoster)
 * @param {import('../../data/ateliers.js').AtelierConfig} props.atelierMeta
 *   Métadonnées de l'atelier actif (icon, label, color, light, border)
 * @param {Function}      props.onSelect - Callback(student: Student) → void
 *
 * @returns {JSX.Element}
 */
export default function StudentSelectScreen({
    students,
    atelierMeta,
    onSelect,
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
                    <EmptyRoster color={color} />
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
    /** Liste des élèves issue de useRoster */
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            pseudo: PropTypes.string.isRequired,
        })
    ).isRequired,
    /** Métadonnées de l'atelier actif */
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
    }).isRequired,
    /** Déclenché quand l'élève clique sur sa carte */
    onSelect: PropTypes.func.isRequired,
};
