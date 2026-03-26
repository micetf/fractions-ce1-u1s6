/**
 * @file SetupScreen — écran de sélection de l'atelier.
 *
 * @description
 * Premier écran affiché au lancement de l'application.
 * L'enseignant·e choisit l'atelier à assigner au groupe.
 *
 * Chaque carte présente :
 * - L'identifiant de l'atelier (numéro + icône)
 * - Le nombre de situations
 * - Une description courte du matériel utilisé
 *
 * Ce composant est volontairement sans état : toute la logique
 * de sélection est remontée vers App via `onSelect`.
 */

import PropTypes from "prop-types";
import { ATELIERS_LIST } from "../data/ateliers.js";

// ─── Sous-composant : carte d'un atelier ───────────────────────────────────────

/**
 * Carte cliquable représentant un atelier sélectionnable.
 *
 * @param {Object}        props
 * @param {AtelierChoice} props.choice   - Données de l'atelier
 * @param {Function}      props.onSelect - Callback(id, total)
 *
 * @returns {JSX.Element}
 */
function AtelierCard({ choice: c, onSelect }) {
    return (
        <button
            onClick={() => onSelect(c.id, c.total)}
            className="w-full rounded-3xl p-5 text-left shadow-md
                 hover:shadow-lg hover:-translate-y-0.5
                 active:scale-[.98] transition-all duration-150
                 touch-manipulation"
            style={{
                background: c.light,
                border: `2.5px solid ${c.color}22`,
            }}
        >
            <div className="flex items-center gap-4">
                <span className="text-4xl" role="img" aria-hidden="true">
                    {c.icon}
                </span>
                <div className="flex-1 min-w-0">
                    <p
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: c.color }}
                    >
                        {c.num} · {c.total} situation{c.total > 1 ? "s" : ""}
                    </p>
                    <p
                        className="text-xl font-bold text-slate-800 truncate"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        {c.sub}
                    </p>
                    <p className="text-sm text-slate-500 font-semibold mt-0.5">
                        {c.desc}
                    </p>
                </div>
                {/* Chevron indicatif */}
                <span className="text-slate-300 font-bold text-lg flex-shrink-0">
                    ›
                </span>
            </div>
        </button>
    );
}

AtelierCard.propTypes = {
    choice: PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        sub: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Écran de sélection d'atelier — affiché avant toute activité élève.
 *
 * @param {Object}   props
 * @param {Function} props.onSelect - Callback(id: string, total: number) => void
 *                                   Appelé quand l'enseignant·e choisit un atelier.
 *
 * @returns {JSX.Element}
 */
export default function SetupScreen({ onSelect }) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 gap-8"
            style={{ background: "#F1EDE4" }}
        >
            {/* En-tête */}
            <div className="text-center">
                <h1
                    className="text-4xl font-bold text-slate-800 mb-1"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    🧮 Fractions CE1
                </h1>
                <p className="text-slate-500 font-semibold text-sm">
                    L'enseignant·e sélectionne l'atelier pour ce groupe
                </p>
            </div>

            {/* Liste des ateliers */}
            <div
                className="flex flex-col gap-4 w-full"
                style={{ maxWidth: "400px" }}
            >
                {ATELIERS_LIST.map((c) => (
                    <AtelierCard key={c.id} choice={c} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
}

SetupScreen.propTypes = {
    /**
     * Déclenché quand l'enseignant·e sélectionne un atelier.
     * @param {string} id    - Identifiant de l'atelier ('tg' | 'dq' | 'cu')
     * @param {number} total - Nombre de situations de l'atelier
     */
    onSelect: PropTypes.func.isRequired,
};
