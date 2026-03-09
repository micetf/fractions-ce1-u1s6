/**
 * @file FullModal — modale d'information « tout rempli ».
 *
 * @description
 * Affichée quand l'élève tente d'ajouter une pièce alors que le tout est
 * déjà entièrement couvert. Sert de feedback pédagogique positif et invite
 * à valider plutôt qu'à continuer d'ajouter.
 *
 * Le fond semi-transparent est cliquable pour fermer (équivalent de
 * "J'ai compris"), ce qui facilite la manipulation sur tablette.
 *
 * Accessibilité : `role="alertdialog"` + `aria-modal="true"`.
 */

import PropTypes from "prop-types";

/**
 * Modale plein-écran signalant que le tout est rempli.
 *
 * @param {Object}   props
 * @param {string}   props.message - Message contextuel à afficher
 * @param {string}   props.color   - Couleur thématique du bouton (hex)
 * @param {Function} props.onClose - Ferme la modale
 *
 * @returns {JSX.Element}
 */
export default function FullModal({ message, color, onClose }) {
    return (
        <div
            className="fixed inset-0 z-30 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,.45)" }}
            onClick={onClose}
            role="alertdialog"
            aria-modal="true"
            aria-label="Le tout est rempli"
        >
            <div
                className="bg-white rounded-3xl shadow-2xl p-6 max-w-xs w-full text-center kf-up"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-4xl mb-3" role="img" aria-hidden="true">
                    ✅
                </p>
                <p className="font-bold text-slate-800 text-base leading-snug mb-4">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="py-2.5 px-6 rounded-2xl text-white font-bold text-sm
                     hover:brightness-110 active:scale-95 transition-all touch-manipulation"
                    style={{ background: color }}
                >
                    J'ai compris !
                </button>
            </div>
        </div>
    );
}

FullModal.propTypes = {
    /** Message affiché dans la modale */
    message: PropTypes.string.isRequired,
    /** Couleur thématique du bouton de confirmation */
    color: PropTypes.string.isRequired,
    /** Ferme la modale */
    onClose: PropTypes.func.isRequired,
};
