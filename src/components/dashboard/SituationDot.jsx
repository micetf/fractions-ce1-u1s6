/**
 * @file SituationDot — point d'état pour une situation dans la frise de progression.
 *
 * @description
 * Chaque situation de l'atelier est représentée par un cercle coloré
 * dont la teinte encode immédiatement le résultat pour l'enseignant·e.
 *
 * Statuts et signification pédagogique :
 *
 * | Statut    | Couleur      | Signification                          |
 * |-----------|--------------|----------------------------------------|
 * | pending   | Gris clair   | Situation non encore atteinte          |
 * | active    | Bleu pulsant | Situation en cours (animation ping)    |
 * | perfect   | Vert         | Réussi sans erreur (comptage + nom)    |
 * | good      | Ambre        | Réussi avec 1 ou 2 erreurs             |
 * | struggled | Orange       | Réussi avec 3 erreurs ou plus          |
 */

import PropTypes from "prop-types";

/**
 * @typedef {'pending'|'active'|'perfect'|'good'|'struggled'} SituationStatus
 */

/**
 * @typedef {Object} StatusConfig
 * @property {string}      bg   - Couleur de fond (hex)
 * @property {string|null} ring - Couleur du halo animé (hex, null si absent)
 * @property {string}      icon - Icône affichée dans le cercle
 * @property {string}      tip  - Texte de l'infobulle (title)
 */

/** @type {Object.<SituationStatus, StatusConfig>} */
const STATUS_CONFIG = {
    pending: { bg: "#E2E8F0", ring: null, icon: "", tip: "À venir" },
    active: { bg: "#3B82F6", ring: "#93C5FD", icon: "", tip: "En cours" },
    perfect: {
        bg: "#10B981",
        ring: null,
        icon: "✓",
        tip: "Réussi du 1er coup",
    },
    good: { bg: "#F59E0B", ring: null, icon: "✓", tip: "Réussi avec erreurs" },
    struggled: { bg: "#F97316", ring: null, icon: "!", tip: "Difficultés" },
};

/**
 * Point circulaire représentant l'état d'une situation dans la frise.
 *
 * @param {Object}          props
 * @param {SituationStatus} props.status - État de la situation
 * @param {string}          props.label  - Étiquette courte sous le point
 *
 * @returns {JSX.Element}
 */
export default function SituationDot({ status, label }) {
    const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

    return (
        <div className="flex flex-col items-center gap-1" title={c.tip}>
            <div
                className="relative flex items-center justify-center w-9 h-9 rounded-full
                   text-white text-xs font-bold"
                style={{
                    background: c.bg,
                    boxShadow: c.ring
                        ? `0 0 0 3px ${c.ring}, 0 0 0 5px ${c.ring}55`
                        : undefined,
                }}
            >
                {/* Animation ping pour la situation active */}
                {status === "active" && (
                    <span
                        className="absolute inset-0 rounded-full kf-ping"
                        style={{ background: c.bg, opacity: 0.4 }}
                    />
                )}
                {c.icon}
            </div>

            <span
                className="text-xs font-bold text-white/60 text-center leading-none"
                style={{ maxWidth: "48px" }}
            >
                {label}
            </span>
        </div>
    );
}

SituationDot.propTypes = {
    /** État de la situation (détermine couleur et icône) */
    status: PropTypes.oneOf([
        "pending",
        "active",
        "perfect",
        "good",
        "struggled",
    ]).isRequired,
    /** Label court affiché sous le cercle */
    label: PropTypes.string.isRequired,
};
