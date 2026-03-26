/**
 * @file DoneScreen — écran de fin d'atelier.
 *
 * @description
 * Affiché quand toutes les situations d'un atelier sont terminées.
 * Propose trois actions :
 *
 * - **🖨 Imprimer mes résultats** : ouvre le Dashboard élève (events encore
 *   en mémoire) via `onPrint()` — l'impression se fait depuis le Dashboard
 *   qui affiche le détail complet de la session.
 * - **↺ Recommencer** : relance l'atelier (même élève, même session)
 * - **→ Passer la tablette** : appelle `onDone` → StudentSelectScreen
 *
 * ⚠️ La fenêtre d'impression est ouverte tant que "Passer la tablette"
 * n'a pas été cliqué. Après ce clic, `resetLog()` est appelé dans App.jsx
 * et les données en mémoire sont perdues.
 *
 * @module DoneScreen
 */

import PropTypes from "prop-types";

function getOutcome(pct) {
    if (pct === 100) return { emoji: "🏆", msg: "Parfait !" };
    if (pct >= 70) return { emoji: "⭐", msg: "Très bien !" };
    return { emoji: "💪", msg: "Continue !" };
}

/**
 * @param {Object}   props
 * @param {number}   props.score    - Score obtenu
 * @param {number}   props.max      - Score maximal possible
 * @param {string}   props.label    - Nom de l'atelier (ex : "Tangram")
 * @param {Function} props.onReset  - Relance l'atelier (même élève)
 * @param {Function} props.onDone   - Passe la tablette à l'élève suivant
 * @param {Function} props.onPrint  - Ouvre le Dashboard élève pour impression
 * @param {string}   props.color    - Couleur thématique de l'atelier (hex)
 */
export default function DoneScreen({
    score,
    max,
    label,
    onReset,
    onDone,
    onPrint,
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

            {/* Message */}
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

            {/* Barre de progression */}
            <div className="w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {/* Passer la tablette */}
                <button
                    onClick={onDone}
                    className="text-white font-bold py-3 px-8 rounded-2xl text-lg
                               shadow-md hover:brightness-110 active:scale-95
                               transition-all touch-manipulation"
                    style={{ background: color }}
                >
                    Passer la tablette →
                </button>

                {/* Recommencer */}
                <button
                    onClick={onReset}
                    className="font-bold py-2.5 px-8 rounded-2xl text-base
                               border-2 hover:brightness-95 active:scale-95
                               transition-all touch-manipulation bg-white"
                    style={{ color, borderColor: color }}
                >
                    ↺ Recommencer
                </button>

                {/* Imprimer — ouvre le Dashboard élève (events encore en mémoire) */}
                <button
                    onClick={onPrint}
                    className="font-bold py-2 px-8 rounded-2xl text-sm
                               border border-slate-200 text-slate-500
                               hover:bg-slate-50 active:scale-95
                               transition-all touch-manipulation bg-white"
                >
                    🖨 Imprimer mes résultats
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
    onDone: PropTypes.func.isRequired,
    onPrint: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
};
