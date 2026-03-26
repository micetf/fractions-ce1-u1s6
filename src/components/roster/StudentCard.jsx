/**
 * @file StudentCard.jsx — carte élève pour l'écran de sélection.
 *
 * @description
 * Composant de présentation pur : aucun état interne.
 * Affiche le pseudo de l'élève et un bouton "C'est moi !" coloré
 * selon la thématique de l'atelier actif.
 *
 * @module StudentCard
 */

import PropTypes from "prop-types";

/**
 * Carte cliquable représentant un élève sélectionnable.
 *
 * @param {Object}   props
 * @param {string}   props.pseudo       - Pseudo affiché (ex : "Fred M")
 * @param {string}   props.color        - Couleur thématique de l'atelier (hex)
 * @param {string}   props.light        - Couleur de fond claire de l'atelier (hex)
 * @param {string}   props.border       - Couleur de bordure de l'atelier (hex)
 * @param {Function} props.onSelect     - Callback déclenché au clic
 *
 * @returns {JSX.Element}
 */
export default function StudentCard({
    pseudo,
    color,
    light,
    border,
    onSelect,
}) {
    return (
        <button
            onClick={onSelect}
            className="w-full flex items-center justify-between gap-3
                       rounded-2xl px-4 py-3 text-left
                       shadow-sm hover:shadow-md hover:-translate-y-0.5
                       active:scale-[.98] transition-all duration-150
                       touch-manipulation"
            style={{ background: light, border: `2px solid ${border}` }}
        >
            {/* Pseudo */}
            <span
                className="text-lg font-bold text-slate-800 truncate"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
                {pseudo}
            </span>

            {/* Badge "C'est moi !" */}
            <span
                className="flex-shrink-0 text-sm font-bold px-3 py-1.5
                           rounded-xl text-white"
                style={{ background: color }}
            >
                C&apos;est moi !
            </span>
        </button>
    );
}

StudentCard.propTypes = {
    /** Pseudo de l'élève */
    pseudo: PropTypes.string.isRequired,
    /** Couleur thématique de l'atelier (hex) */
    color: PropTypes.string.isRequired,
    /** Couleur de fond claire (hex) */
    light: PropTypes.string.isRequired,
    /** Couleur de bordure (hex) */
    border: PropTypes.string.isRequired,
    /** Appelé au clic */
    onSelect: PropTypes.func.isRequired,
};
