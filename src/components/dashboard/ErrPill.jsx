/**
 * @file ErrPill — badge affichant une erreur de nommage repérée.
 *
 * @description
 * Représente visuellement un distracteur choisi lors d'une erreur de nommage :
 * la réponse incorrecte de l'élève (rouge) mise en contraste avec la
 * réponse attendue (vert).
 *
 * Un compteur ×N est affiché si l'erreur est répétée plusieurs fois,
 * permettant à l'enseignant·e d'identifier les conceptions erronées
 * les plus fréquentes dans le groupe.
 *
 * Utilisé dans la section "Erreurs repérées" du Dashboard.
 */

import PropTypes from "prop-types";

/**
 * Badge d'erreur de nommage avec distracteur et réponse attendue.
 *
 * @param {Object} props
 * @param {string} props.chosen - Fraction choisie incorrectement par l'élève
 * @param {string} props.answer - Fraction attendue (correcte)
 * @param {number} props.count  - Nombre d'occurrences de cette erreur
 *
 * @returns {JSX.Element}
 *
 * @example
 * <ErrPill chosen="un tiers" answer="un quart" count={2} />
 */
export default function ErrPill({ chosen, answer, count }) {
    return (
        <div
            className="flex items-center gap-2 bg-red-50 border border-red-100
                 rounded-xl px-3 py-1.5"
            role="listitem"
        >
            <span className="text-sm font-bold text-red-600">«{chosen}»</span>
            <span className="text-xs text-slate-400">au lieu de</span>
            <span className="text-sm font-bold text-emerald-700">
                «{answer}»
            </span>
            {count > 1 && (
                <span className="text-xs font-bold text-red-500 ml-1">
                    ×{count}
                </span>
            )}
        </div>
    );
}

ErrPill.propTypes = {
    /** Fraction incorrecte choisie par l'élève */
    chosen: PropTypes.string.isRequired,
    /** Fraction correcte attendue */
    answer: PropTypes.string.isRequired,
    /** Nombre de fois où cette erreur s'est produite */
    count: PropTypes.number.isRequired,
};
