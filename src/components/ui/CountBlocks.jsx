/**
 * @file Composant CountBlocks — grille de blocs pour le dénombrement.
 *
 * @description
 * Représentation spatiale du nombre de pièces placées par l'élève.
 * Le dernier bloc ajouté est mis en valeur (scale + ring) pour
 * renforcer la perception de l'action en cours.
 *
 * Le composant s'adapte à la taille de max :
 * - ≤ 8 pièces → blocs 32×32 px
 * - > 8 pièces → blocs 24×24 px (Cuisenaire n=10)
 */

import PropTypes from "prop-types";

/**
 * Grille de blocs colorés encodant le nombre de pièces placées.
 *
 * @param {Object} props
 * @param {number} props.placed - Nombre de blocs colorés (pièces posées)
 * @param {number} props.max    - Nombre total de blocs affichés
 * @param {string} props.color  - Couleur CSS des blocs actifs
 *
 * @returns {JSX.Element}
 */
export default function CountBlocks({ placed, max, color }) {
    const size = max <= 8 ? "32px" : "24px";

    return (
        <div className="flex flex-wrap gap-1 justify-center my-1">
            {Array.from({ length: max }).map((_, i) => {
                const isActive = i < placed;
                const isLast = i === placed - 1 && placed > 0;

                return (
                    <div
                        key={i}
                        className="rounded transition-all duration-200"
                        style={{
                            width: size,
                            height: size,
                            background: isActive ? color : "#E2E8F0",
                            transform: isLast ? "scale(1.15)" : "scale(1)",
                            boxShadow: isLast
                                ? `0 0 0 2px ${color}44`
                                : undefined,
                        }}
                    />
                );
            })}
        </div>
    );
}

CountBlocks.propTypes = {
    /** Nombre de blocs colorés */
    placed: PropTypes.number.isRequired,
    /** Nombre total de blocs dans la grille */
    max: PropTypes.number.isRequired,
    /** Couleur CSS des blocs actifs */
    color: PropTypes.string.isRequired,
};
