/**
 * @file ConfirmModal.jsx — modale de confirmation pour actions destructives.
 *
 * @description
 * Overlay de confirmation générique, réutilisé par RosterManager
 * (suppression d'élève) et ClassTracker (réinitialisation de traces).
 *
 * Le bouton de confirmation est stylistiquement distinct selon la
 * criticité via la prop `danger` : rouge si true, bleu sinon.
 *
 * @module ConfirmModal
 */

import PropTypes from "prop-types";

/**
 * Modale de confirmation avec fond semi-transparent.
 *
 * @param {Object}   props
 * @param {string}   props.title        - Titre de la modale
 * @param {string}   props.message      - Corps du message
 * @param {string}   [props.confirmLabel="Confirmer"] - Libellé du bouton de confirmation
 * @param {boolean}  [props.danger=true] - Bouton rouge si true, bleu sinon
 * @param {Function} props.onConfirm    - Callback de confirmation
 * @param {Function} props.onCancel     - Callback d'annulation
 *
 * @returns {JSX.Element}
 */
export default function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirmer",
    danger = true,
    onConfirm,
    onCancel,
}) {
    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,.6)", zIndex: 60 }}
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 kf-up"
                onClick={(e) => e.stopPropagation()}
            >
                <h3
                    className="font-bold text-slate-800 text-lg mb-2"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    {title}
                </h3>
                <p className="text-slate-600 text-sm font-semibold mb-5">
                    {message}
                </p>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm
                                   hover:bg-slate-100 transition-colors touch-manipulation"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl text-white font-bold text-sm
                                   transition-colors touch-manipulation"
                        style={{ background: danger ? "#DC2626" : "#2563EB" }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    danger: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
