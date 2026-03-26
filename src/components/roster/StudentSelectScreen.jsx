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
 *
 * ────────────────────────────────────────────────────────────────
 * Accès à la gestion des élèves
 * ────────────────────────────────────────────────────────────────
 * Un bouton discret "⚙ Gérer les élèves" est affiché en bas de
 * l'écran. Il est intentionnellement sobre pour ne pas attirer
 * l'attention des élèves. Il est l'unique point d'entrée au premier
 * lancement quand le registre est encore vide.
 *
 * @module StudentSelectScreen
 */

import PropTypes from "prop-types";
import StudentCard from "./StudentCard.jsx";

// ─── Sous-composant : état registre vide ────────────────────────────────────────

/**
 * Message affiché quand aucun élève n'est encore dans le registre.
 *
 * @param {Object}   props
 * @param {string}   props.color    - Couleur thématique de l'atelier
 * @param {Function} props.onManage - Ouvre la gestion des élèves
 * @returns {JSX.Element}
 */
function EmptyRoster({ color, onManage }) {
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
                Utilise le bouton ci-dessous pour ajouter les élèves de ta
                classe.
            </p>
            <button
                onClick={onManage}
                className="mt-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm
                           transition-colors touch-manipulation"
                style={{ background: color }}
            >
                ⚙ Gérer les élèves
            </button>
        </div>
    );
}

EmptyRoster.propTypes = {
    color: PropTypes.string.isRequired,
    onManage: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Overlay de sélection d'élève — bloquant, plein écran.
 *
 * @param {Object}   props
 * @param {Array}    props.students    - Liste des élèves du registre (useRoster)
 * @param {Object}   props.atelierMeta - Métadonnées de l'atelier actif
 * @param {Function} props.onSelect   - Callback(student: Student) → void
 * @param {Function} props.onManage   - Ouvre le Dashboard sur l'onglet Classe
 *
 * @returns {JSX.Element}
 */
export default function StudentSelectScreen({
    students,
    atelierMeta,
    onSelect,
    onManage,
}) {
    const { icon, label, color, light, border } = atelierMeta;

    return (
        <div
            className="fixed inset-0 z-40 flex flex-col items-center
                       justify-center p-5 kf-up"
            style={{ background: "#F1EDE4" }}
        >
            <div
                className="w-full flex flex-col items-center"
                style={{ maxWidth: "400px" }}
            >
                {/* ── En-tête ── */}
                <div className="text-center mb-6">
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
                    <EmptyRoster color={color} onManage={onManage} />
                ) : (
                    <div className="flex flex-col gap-3 w-full">
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

                {/* ── Accès gestion élèves — toujours visible ── */}
                {students.length > 0 && (
                    <button
                        onClick={onManage}
                        className="mt-8 text-slate-400 text-xs font-bold
                                   hover:text-slate-600 transition-colors
                                   touch-manipulation underline underline-offset-2"
                    >
                        ⚙ Gérer les élèves (enseignant·e)
                    </button>
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
    /** Ouvre le Dashboard sur l'onglet "Suivi classe" */
    onManage: PropTypes.func.isRequired,
};
