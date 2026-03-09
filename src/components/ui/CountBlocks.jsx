/**
 * @file Composant CountBlocks — rangée de coches pour le dénombrement.
 *
 * @description
 * Représentation discrète du nombre de pièces placées par l'élève.
 * Chaque pièce posée devient une coche verte (✓) ; les emplacements
 * restants sont des cercles gris neutres.
 *
 * Choix pédagogique :
 * - La coche encode "j'ai posé cette pièce" sans révéler la quantité totale
 *   attendue — c'est la représentation (SVG Tangram, disque…) qui reste
 *   la seule source de vérité sur le bon nombre.
 * - Pas de couleur thématique : le vert est un signal universel de "posé",
 *   indépendant de l'atelier en cours.
 * - La dernière coche ajoutée est légèrement agrandie (animation d'entrée)
 *   pour renforcer la perception de l'action en cours.
 *
 * Le composant s'adapte à la taille de max :
 * - ≤ 8 pièces → coches 32 px
 * - > 8 pièces → coches 24 px (Cuisenaire n=10)
 */

import PropTypes from "prop-types";

/**
 * Rangée de coches encodant le nombre de pièces placées.
 *
 * @param {Object}  props
 * @param {number}  props.placed   - Nombre de coches actives (pièces posées)
 * @param {number}  props.max      - Nombre total de cases affichées
 * @param {boolean} [props.error]  - Si vrai, la dernière coche est rouge (débordement)
 *
 * @returns {JSX.Element}
 */
export default function CountBlocks({ placed, max, error = false }) {
    const size = max <= 8 ? 32 : 24;
    const fontSize = max <= 8 ? "16px" : "12px";

    return (
        <div
            className="flex flex-wrap gap-1.5 justify-center my-1"
            role="img"
            aria-label={`${placed} sur ${max} pièces posées`}
        >
            {Array.from({ length: max }).map((_, i) => {
                const isActive = i < placed;
                const isLast = i === placed - 1 && placed > 0;
                const isError = error && isLast;

                return (
                    <div
                        key={i}
                        className="rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            background: isActive
                                ? isError
                                    ? "#FEE2E2"
                                    : "#DCFCE7"
                                : "#F1F5F9",
                            border: `2px solid ${
                                isActive
                                    ? isError
                                        ? "#FCA5A5"
                                        : "#86EFAC"
                                    : "#E2E8F0"
                            }`,
                            transform: isLast ? "scale(1.18)" : "scale(1)",
                            boxShadow: isLast
                                ? `0 0 0 3px ${isError ? "#FCA5A544" : "#86EFAC44"}`
                                : undefined,
                            fontSize,
                            lineHeight: 1,
                        }}
                        aria-hidden="true"
                    >
                        {isActive && (
                            <span
                                style={{
                                    color: isError ? "#EF4444" : "#16A34A",
                                    fontWeight: 700,
                                }}
                            >
                                {isError ? "✕" : "✓"}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

CountBlocks.propTypes = {
    /** Nombre de coches actives */
    placed: PropTypes.number.isRequired,
    /** Nombre total de cases dans la rangée */
    max: PropTypes.number.isRequired,
    /**
     * Si vrai, la dernière coche est affichée en rouge (signal de débordement).
     * La couleur thématique de l'atelier n'est plus nécessaire.
     */
    error: PropTypes.bool,
};
