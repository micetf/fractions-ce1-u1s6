/**
 * @file Composant Bubble — bulle de feedback pédagogique contextuelle.
 *
 * @description
 * Affiche un message de feedback animé, coloré selon le type.
 * Retourne null si aucun message n'est fourni (montage conditionnel propre).
 *
 * Types de feedback et leur codage couleur :
 * - `ok`   : vert émeraude — validation positive
 * - `err`  : rouge pâle   — erreur de manipulation à corriger
 * - `warn` : ambre        — manipulation réussie, anticipation inexacte
 *                           (prédiction fausse en phase predict → count)
 * - `hint` : bleu ardoise — indice de guidance (Cuisenaire)
 *
 * ────────────────────────────────────────────────────────────────
 * Distinction err / warn
 * ────────────────────────────────────────────────────────────────
 * `err`  signale une erreur dans la tâche en cours — les contrôles
 * restent actifs, l'élève doit corriger avant de continuer.
 *
 * `warn` signale un écart entre prédiction et résultat de manipulation,
 * mais la manipulation elle-même était correcte. Le bouton "Continuer →"
 * est affiché : l'élève peut avancer immédiatement. Ce type ne doit
 * jamais bloquer la progression.
 *
 * ────────────────────────────────────────────────────────────────
 * Agentivité
 * ────────────────────────────────────────────────────────────────
 * Quand `type === 'ok'` ou `type === 'warn'` et que `onContinue` est
 * fourni, un bouton "Continuer →" est intégré dans la bulle. L'élève
 * choisit lui-même le moment de passer à la suite, ce qui respecte
 * son rythme de lecture et de traitement du feedback.
 *
 * Pour les erreurs (`type === 'err'`), aucun délai automatique n'est
 * imposé : les contrôles interactifs restent actifs immédiatement,
 * le message disparaît à la prochaine action de l'élève.
 */

import PropTypes from "prop-types";

// ─── Styles par type ───────────────────────────────────────────────────────────

/** @type {Object.<string, string>} Classes Tailwind par type */
const TYPE_CLASSES = {
    ok: "bg-emerald-50 text-emerald-900 border border-emerald-200",
    err: "bg-red-50 text-red-800 border border-red-200",
    warn: "bg-amber-50 text-amber-900 border border-amber-200",
    hint: "bg-slate-100 text-slate-700 border border-slate-200",
};

/** @type {Object.<string, string>} Classes du bouton Continuer par type */
const BTN_CLASSES = {
    ok: "bg-emerald-600 hover:bg-emerald-700",
    warn: "bg-amber-600 hover:bg-amber-700",
};

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Bulle de message de feedback avec animation d'entrée.
 *
 * @param {Object}                    props
 * @param {'ok'|'err'|'warn'|'hint'}  props.type       - Type de feedback
 * @param {string|null}               props.msg        - Message à afficher (null = non rendu)
 * @param {Function|null}             props.onContinue - Si fourni avec type 'ok' ou 'warn',
 *                                                       affiche un bouton "Continuer →"
 *
 * @returns {JSX.Element|null}
 */
export default function Bubble({ type, msg, onContinue }) {
    if (!msg) return null;

    const showContinue = (type === "ok" || type === "warn") && onContinue;

    return (
        <div
            role="status"
            aria-live="polite"
            className={[
                "rounded-2xl py-3 px-4",
                "text-sm font-semibold leading-snug",
                "kf-in",
                TYPE_CLASSES[type] ?? TYPE_CLASSES.hint,
            ].join(" ")}
        >
            <span>{msg}</span>

            {showContinue && (
                <button
                    onClick={onContinue}
                    className={[
                        "mt-2.5 w-full py-2.5 rounded-xl text-sm font-bold",
                        "text-white active:scale-95 transition-all",
                        "touch-manipulation block",
                        BTN_CLASSES[type],
                    ].join(" ")}
                >
                    Continuer →
                </button>
            )}
        </div>
    );
}

Bubble.propTypes = {
    /** Type de feedback — détermine le style de la bulle */
    type: PropTypes.oneOf(["ok", "err", "warn", "hint"]).isRequired,
    /** Message affiché ; null ou undefined supprime le rendu */
    msg: PropTypes.string,
    /**
     * Callback déclenché par le bouton "Continuer →".
     * N'est rendu que si type === 'ok' ou 'warn' et onContinue est fourni.
     */
    onContinue: PropTypes.func,
};

Bubble.defaultProps = {
    msg: null,
    onContinue: null,
};
