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
import { TG } from "../data/tangram.js";
import { DQ } from "../data/disques.js";
import { CUI } from "../data/cuisenaire.js";

/**
 * @typedef {Object} AtelierChoice
 * @property {string} id    - Identifiant court ('tg' | 'dq' | 'cu')
 * @property {string} icon  - Emoji représentatif
 * @property {string} label - Titre court (ex : "Atelier 1")
 * @property {string} sub   - Sous-titre (nom du matériel)
 * @property {string} color - Couleur thématique (hex)
 * @property {string} light - Couleur de fond de la carte (hex)
 * @property {string} desc  - Description pédagogique courte
 * @property {number} total - Nombre de situations
 */

/** @type {AtelierChoice[]} */
const CHOICES = [
    {
        id: "tg",
        icon: "🔷",
        label: "Atelier 1",
        sub: "Tangram",
        color: "#2563EB",
        light: "#EFF6FF",
        desc: "Fractions du carré avec les pièces du Tangram",
        total: TG.length,
    },
    {
        id: "dq",
        icon: "⭕",
        label: "Atelier 2",
        sub: "Disques",
        color: "#7C3AED",
        light: "#F5F3FF",
        desc: "Fractions du disque avec les secteurs angulaires",
        total: DQ.length,
    },
    {
        id: "cu",
        icon: "📏",
        label: "Atelier 3",
        sub: "Cuisenaire",
        color: "#B45309",
        light: "#FFFBEB",
        desc: "Fractions des réglettes colorées",
        total: CUI.length,
    },
];

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
                        {c.label} · {c.total} situation{c.total > 1 ? "s" : ""}
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
                {CHOICES.map((c) => (
                    <AtelierCard key={c.id} choice={c} onSelect={onSelect} />
                ))}
            </div>

            {/* Pied de page institutionnel */}
            <p className="text-xs text-slate-300 text-center font-semibold">
                CAREC Grenoble · Enseignement explicite · Séance 6/6
            </p>
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
