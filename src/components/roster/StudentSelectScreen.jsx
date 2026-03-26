/**
 * @file StudentSelectScreen.jsx — écran de sélection du prénom élève.
 *
 * @description
 * Affiché quand une session est active mais qu'aucun élève n'a encore
 * choisi son prénom. Présente la liste des élèves sous forme de cartes.
 *
 * Quand le registre est vide : message d'attente simple.
 * La gestion des élèves appartient exclusivement à l'espace enseignant —
 * aucun accès à RosterManager depuis cet écran.
 *
 * @module roster/StudentSelectScreen
 */

import PropTypes from "prop-types";
import StudentCard from "./StudentCard.jsx";

// ─── Sous-composant : registre vide ────────────────────────────────────────────

/**
 * Message affiché quand aucun élève n'est encore dans le registre.
 * Invite l'enseignant·e à configurer la classe (sans bouton d'action —
 * la gestion des élèves est dans l'espace enseignant uniquement).
 *
 * @param {{ color: string }} props
 */
function EmptyRoster({ color }) {
    return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="text-5xl" aria-hidden="true">
                🙋
            </span>
            <div>
                <p
                    className="text-slate-700 font-bold text-lg"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    Aucun élève dans la liste
                </p>
                <p className="text-slate-400 text-sm font-semibold mt-1 leading-relaxed">
                    Demande à ton enseignant·e d&apos;ajouter les élèves.
                </p>
            </div>
            <div
                className="text-xs font-bold px-4 py-2 rounded-xl"
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
 * Écran de sélection d'élève — affiché en mode élève, session active.
 *
 * @param {Object}   props
 * @param {Array}    props.students    - Liste des élèves (useRoster)
 * @param {Object}   props.atelierMeta - Métadonnées de l'atelier actif
 * @param {Function} props.onSelect   - Callback(student) → démarre la session
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
            className="min-h-screen flex flex-col items-center
                       justify-center p-5"
            style={{ background: "#F1EDE4" }}
        >
            <div className="w-full" style={{ maxWidth: "400px" }}>
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
                        className="text-3xl font-bold text-slate-800"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        Qui es-tu ?
                    </h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1">
                        Choisis ton prénom dans la liste
                    </p>
                </div>

                {/* ── Liste ou message vide ── */}
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
};
