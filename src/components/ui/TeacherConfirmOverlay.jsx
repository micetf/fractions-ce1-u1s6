/**
 * @file TeacherConfirmOverlay.jsx — overlay de confirmation avant d'entrer
 * dans l'espace enseignant.
 *
 * @description
 * Utilisé dans deux contextes :
 *
 * 1. **VisitorScreen** — clic sur "Espace enseignant·e"
 * 2. **StudentSpace**  — long press (≥ 2 s) sur la zone centrale de la Navbar
 *
 * La friction volontaire (deux boutons explicites, libellés clairs) suffit
 * à décourager un élève de CE1 d'entrer par accident dans l'espace enseignant,
 * sans nécessiter de code PIN ni de mécanisme d'authentification.
 *
 * @module ui/TeacherConfirmOverlay
 */

import PropTypes from "prop-types";

/**
 * Overlay modal de confirmation "Es-tu bien l'enseignant·e ?".
 *
 * @param {Object}   props
 * @param {Function} props.onConfirm - Bascule en mode enseignant
 * @param {Function} props.onCancel  - Ferme l'overlay sans action
 * @returns {JSX.Element}
 */
export default function TeacherConfirmOverlay({ onConfirm, onCancel }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
                background: "rgba(15,23,42,.85)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full
                            text-center kf-up"
            >
                <span className="text-5xl block mb-4" aria-hidden="true">
                    🎓
                </span>

                <h2
                    className="text-2xl font-bold text-slate-800 mb-2"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    Espace enseignant·e
                </h2>

                <p className="text-slate-500 font-semibold text-sm mb-8">
                    Es-tu bien l&apos;enseignant·e de cette classe ?
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full py-4 rounded-2xl bg-slate-800 text-white
                                   font-bold text-base hover:bg-slate-700
                                   transition-colors touch-manipulation"
                    >
                        Oui, continuer →
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-3 rounded-2xl text-slate-400
                                   font-bold text-sm hover:text-slate-600
                                   transition-colors touch-manipulation"
                    >
                        Non, revenir
                    </button>
                </div>
            </div>
        </div>
    );
}

TeacherConfirmOverlay.propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
