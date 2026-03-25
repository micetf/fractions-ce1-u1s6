/**
 * @file MetricCard — carte de métrique synthèse du tableau de bord.
 *
 * @description
 * Composant de présentation pur : aucun état, aucun handler.
 * Affiche une métrique avec son icône, sa valeur principale,
 * son libellé et un sous-texte optionnel.
 *
 * La prop `value` accepte un ReactNode pour permettre l'intégration
 * de composants dynamiques comme `LiveTimer`.
 *
 * @module MetricCard
 */

import PropTypes from "prop-types";

/**
 * Carte de métrique synthèse.
 *
 * @param {Object}           props
 * @param {string}           props.icon  - Emoji représentatif
 * @param {string}           props.label - Libellé de la métrique
 * @param {React.ReactNode}  props.value - Valeur principale (texte ou composant)
 * @param {string|null}      props.sub   - Sous-texte optionnel
 * @param {string}           props.bg    - Couleur de fond (hex)
 * @param {string}           props.color - Couleur du texte (hex)
 *
 * @returns {JSX.Element}
 */
export default function MetricCard({ icon, label, value, sub, bg, color }) {
    return (
        <div
            className="rounded-2xl p-3 text-center flex flex-col items-center gap-0.5"
            style={{ background: bg }}
        >
            <span className="text-lg">{icon}</span>
            <p
                className="text-2xl font-bold"
                style={{ color, fontFamily: "'Fredoka', sans-serif" }}
            >
                {value}
            </p>
            <p className="text-xs font-bold" style={{ color, opacity: 0.6 }}>
                {label}
            </p>
            {sub && (
                <p className="text-xs" style={{ color, opacity: 0.4 }}>
                    {sub}
                </p>
            )}
        </div>
    );
}

MetricCard.propTypes = {
    /** Emoji représentatif de la métrique */
    icon: PropTypes.string.isRequired,
    /** Libellé affiché sous la valeur */
    label: PropTypes.string.isRequired,
    /** Valeur principale — texte ou composant (ex : LiveTimer) */
    value: PropTypes.node.isRequired,
    /** Sous-texte optionnel (ex : "~2s/sit") */
    sub: PropTypes.string,
    /** Couleur de fond de la carte (hex) */
    bg: PropTypes.string.isRequired,
    /** Couleur du texte (hex) */
    color: PropTypes.string.isRequired,
};

MetricCard.defaultProps = {
    sub: null,
};
