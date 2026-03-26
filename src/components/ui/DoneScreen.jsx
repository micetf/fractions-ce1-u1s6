/**
 * @file DoneScreen — écran de fin d'atelier.
 *
 * @description
 * Affiché quand toutes les situations d'un atelier sont terminées.
 * Propose deux actions :
 *
 * - **↺ Recommencer** : relance l'atelier (même élève)
 * - **→ Passer la tablette** : appelle `onDone` pour revenir à
 *   `StudentSelectScreen` et permettre à un autre élève de jouer.
 *
 * L'emoji et le message varient selon le taux de réussite :
 * - 100%    → 🏆 "Parfait !"
 * - 70–99%  → ⭐ "Très bien !"
 * - < 70%   → 💪 "Continue !"
 *
 * @module DoneScreen
 */

import PropTypes from "prop-types";

/**
 * Retourne l'emoji et le message selon le pourcentage de réussite.
 *
 * @param {number} pct - Pourcentage 0–100
 * @returns {{ emoji: string, msg: string }}
 */
function getOutcome(pct) {
    if (pct === 100) return { emoji: "🏆", msg: "Parfait !" };
    if (pct >= 70) return { emoji: "⭐", msg: "Très bien !" };
    return { emoji: "💪", msg: "Continue !" };
}

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Écran de résultat final affiché à l'issue de l'atelier.
 *
 * @param {Object}   props
 * @param {number}   props.score   - Score obtenu
 * @param {number}   props.max     - Score maximal possible
 * @param {string}   props.label   - Nom de l'atelier (ex : "Tangram")
 * @param {Function} props.onReset - Relance l'atelier (même élève)
 * @param {Function} props.onDone  - Revient à StudentSelectScreen (élève suivant)
 * @param {string}   props.color   - Couleur thématique de l'atelier (hex)
 *
 * @returns {JSX.Element}
 */
export default function DoneScreen({
    score,
    max,
    label,
    onReset,
    onDone,
    color,
}) {
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    const { emoji, msg } = getOutcome(pct);

    return (
        <div className="flex flex-col items-center gap-5 py-8 kf-in">
            {/* Emoji résultat */}
            <div className="text-6xl" role="img" aria-label={msg}>
                {emoji}
            </div>

            {/* Message résultat */}
            <p
                className="text-3xl font-bold"
                style={{ fontFamily: "'Fredoka', sans-serif", color }}
            >
                {msg}
            </p>

            {/* Score */}
            <p className="text-base text-slate-500 text-center">
                {label} · {score}/{max} points
            </p>

            {/* Barre de progression animée */}
            <div className="w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {/* Action principale : passer la tablette à l'élève suivant */}
                <button
                    onClick={onDone}
                    className="text-white font-bold py-3 px-8 rounded-2xl text-lg
                               shadow-md hover:brightness-110 active:scale-95
                               transition-all touch-manipulation"
                    style={{ background: color }}
                >
                    Passer la tablette →
                </button>

                {/* Action secondaire : recommencer (même élève) */}
                <button
                    onClick={onReset}
                    className="font-bold py-2.5 px-8 rounded-2xl text-base
                               border-2 hover:brightness-95 active:scale-95
                               transition-all touch-manipulation bg-white"
                    style={{ color, borderColor: color }}
                >
                    ↺ Recommencer
                </button>
            </div>
        </div>
    );
}

DoneScreen.propTypes = {
    score: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    onReset: PropTypes.func.isRequired,
    /** Appelé pour passer la tablette à l'élève suivant */
    onDone: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
};
