/**
 * @file Composant DoneScreen — écran de fin d'atelier.
 *
 * @description
 * Affiché quand toutes les situations d'un atelier sont terminées.
 * L'emoji et le message varient selon le taux de réussite :
 * - 100%       → 🏆 "Parfait !"
 * - 70–99%     → ⭐ "Très bien !"
 * - < 70%      → 💪 "Continue !"
 *
 * Inclut une barre de progression animée et un bouton de relance.
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

/**
 * Écran de résultat final affiché à l'issue de l'atelier.
 *
 * @param {Object}   props
 * @param {number}   props.score   - Score obtenu
 * @param {number}   props.max     - Score maximal possible
 * @param {string}   props.label   - Nom de l'atelier (ex : "Tangram")
 * @param {Function} props.onReset - Callback de relance de l'atelier
 * @param {string}   props.color   - Couleur thématique de l'atelier (hex)
 *
 * @returns {JSX.Element}
 */
export default function DoneScreen({ score, max, label, onReset, color }) {
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    const { emoji, msg } = getOutcome(pct);

    return (
        <div className="flex flex-col items-center gap-5 py-8 kf-in">
            <div className="text-6xl" role="img" aria-label={msg}>
                {emoji}
            </div>

            <p
                className="text-3xl font-bold"
                style={{ fontFamily: "'Fredoka', sans-serif", color }}
            >
                {msg}
            </p>

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

            <button
                onClick={onReset}
                className="text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-md
                   hover:brightness-110 active:scale-95 transition-all"
                style={{ background: color }}
            >
                ↺ Recommencer
            </button>
        </div>
    );
}

DoneScreen.propTypes = {
    /** Score obtenu par l'élève */
    score: PropTypes.number.isRequired,
    /** Score maximal possible */
    max: PropTypes.number.isRequired,
    /** Nom affiché de l'atelier */
    label: PropTypes.string.isRequired,
    /** Callback déclenché au clic sur "Recommencer" */
    onReset: PropTypes.func.isRequired,
    /** Couleur thématique de l'atelier */
    color: PropTypes.string.isRequired,
};
