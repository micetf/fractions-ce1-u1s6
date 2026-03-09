/**
 * @file Composant ProgDots — indicateur de progression par points colorés.
 *
 * @description
 * Affiche une rangée de points dont la couleur encode la progression.
 * Points remplis = score accumulé ; points vides = restant.
 *
 * Utilisé dans le header de chaque atelier pour donner
 * une lecture immédiate de l'avancement (affordance spatiale).
 */

import PropTypes from "prop-types";

/**
 * Rangée de points de progression.
 *
 * @param {Object} props
 * @param {number} props.done  - Nombre de points remplis (score actuel)
 * @param {number} props.total - Nombre total de points
 * @param {string} props.color - Couleur CSS des points remplis (hex ou valeur CSS)
 *
 * @returns {JSX.Element}
 *
 * @example
 * <ProgDots done={3} total={10} color="#2563EB" />
 */
export default function ProgDots({ done, total, color }) {
    return (
        <div
            className="flex gap-1.5 flex-wrap"
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${done} sur ${total} points`}
        >
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className="inline-block w-2.5 h-2.5 rounded-full transition-colors duration-300"
                    style={{ background: i < done ? color : "#CBD5E1" }}
                />
            ))}
        </div>
    );
}

ProgDots.propTypes = {
    /** Nombre de points remplis */
    done: PropTypes.number.isRequired,
    /** Nombre total de points */
    total: PropTypes.number.isRequired,
    /** Couleur CSS des points actifs */
    color: PropTypes.string.isRequired,
};
