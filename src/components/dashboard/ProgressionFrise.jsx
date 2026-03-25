/**
 * @file ProgressionFrise — frise de progression du tableau de bord.
 *
 * @description
 * Composant de présentation pur : aucun état, aucun handler.
 * Affiche un point coloré par situation (SituationDot) et une légende.
 *
 * Les situations non encore atteintes sont affichées en statut "pending"
 * (gris clair) pour donner une vision complète de la progression.
 *
 * ────────────────────────────────────────────────────────────────
 * Statuts et couleurs
 * ────────────────────────────────────────────────────────────────
 * - perfect  → vert  (#10B981) — réussi sans erreur
 * - good     → ambre (#F59E0B) — réussi avec erreurs
 * - struggled→ orange (#F97316) — difficultés
 * - active   → bleu  (#3B82F6) — en cours
 * - pending  → gris  (#E2E8F0) — à venir
 *
 * @module ProgressionFrise
 */

import PropTypes from "prop-types";
import SituationDot from "./SituationDot.jsx";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** @type {Array<{status:string, color:string, label:string}>} */
const LEGEND = [
    { status: "perfect", color: "#10B981", label: "1er coup" },
    { status: "good", color: "#F59E0B", label: "avec erreurs" },
    { status: "struggled", color: "#F97316", label: "difficultés" },
    { status: "active", color: "#3B82F6", label: "en cours" },
    { status: "pending", color: "#E2E8F0", label: "à venir" },
];

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Frise de progression situation par situation avec légende colorée.
 *
 * @param {Object}   props
 * @param {Array}    props.sits  - Toutes les situations (actives + terminées)
 * @param {number}   props.total - Nombre total de situations de l'atelier
 *
 * @returns {JSX.Element}
 */
export default function ProgressionFrise({ sits, total }) {
    return (
        <div className="bg-white/10 rounded-2xl p-4 mb-3">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
                Progression situation par situation
            </p>

            {/* Points de progression */}
            <div className="flex flex-wrap gap-3">
                {Array.from({ length: total }).map((_, i) => {
                    const s = sits.find((x) => x.idx === i);
                    const status = s ? s.status : "pending";
                    const label = s ? s.label : `S${i + 1}`;
                    return (
                        <SituationDot key={i} status={status} label={label} />
                    );
                })}
            </div>

            {/* Légende */}
            <div className="flex flex-wrap gap-4 mt-3">
                {LEGEND.map(({ status, color, label }) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ background: color }}
                        />
                        <span className="text-xs text-white/50 font-semibold">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

ProgressionFrise.propTypes = {
    /** Toutes les situations issues de useSituationStats */
    sits: PropTypes.arrayOf(
        PropTypes.shape({
            idx: PropTypes.number.isRequired,
            label: PropTypes.string.isRequired,
            status: PropTypes.oneOf(["active", "perfect", "good", "struggled"])
                .isRequired,
        })
    ).isRequired,
    /** Nombre total de situations de l'atelier */
    total: PropTypes.number.isRequired,
};
