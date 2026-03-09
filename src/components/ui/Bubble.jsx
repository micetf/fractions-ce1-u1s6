/**
 * @file Composant Bubble — bulle de feedback pédagogique contextuelle.
 *
 * @description
 * Affiche un message de feedback animé, coloré selon le type.
 * Retourne null si aucun message n'est fourni (montage conditionnel propre).
 *
 * Types de feedback et leur codage couleur :
 * - `ok`   : vert émeraude — validation positive
 * - `err`  : rouge pâle — erreur à corriger
 * - `hint` : ambre — indice de guidance (Cuisenaire)
 *
 * ────────────────────────────────────────────────────────────────
 * Agentivité
 * ────────────────────────────────────────────────────────────────
 * Quand `type === 'ok'` et que `onContinue` est fourni, un bouton
 * "Continuer →" est intégré dans la bulle. L'élève choisit lui-même
 * le moment de passer à la suite, ce qui respecte son rythme de
 * lecture et de traitement du feedback.
 *
 * Pour les erreurs (`type === 'err'`), aucun délai automatique n'est
 * imposé : les contrôles interactifs restent actifs immédiatement,
 * le message disparaît à la prochaine action de l'élève.
 */

import PropTypes from "prop-types";

/** @type {Object.<string, string>} Classes Tailwind par type */
const TYPE_CLASSES = {
    ok: "bg-emerald-50 text-emerald-900 border border-emerald-200",
    err: "bg-red-50 text-red-800 border border-red-200",
    hint: "bg-amber-50 text-amber-900 border border-amber-200",
};

/**
 * Bulle de message de feedback avec animation d'entrée.
 *
 * @param {Object}             props
 * @param {'ok'|'err'|'hint'}  props.type       - Type de feedback
 * @param {string|null}        props.msg        - Message à afficher (null = non rendu)
 * @param {Function|null}      props.onContinue - Si fourni avec type='ok', affiche
 *                                                un bouton "Continuer →" dans la bulle
 *
 * @returns {JSX.Element|null}
 */
export default function Bubble({ type, msg, onContinue }) {
    if (!msg) return null;

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

            {type === "ok" && onContinue && (
                <button
                    onClick={onContinue}
                    className="mt-2.5 w-full py-2.5 rounded-xl text-sm font-bold
                     text-white bg-emerald-600 hover:bg-emerald-700
                     active:scale-95 transition-all touch-manipulation block"
                >
                    Continuer →
                </button>
            )}
        </div>
    );
}

Bubble.propTypes = {
    /** Type de feedback — détermine le style de la bulle */
    type: PropTypes.oneOf(["ok", "err", "hint"]).isRequired,
    /** Message affiché ; null ou undefined supprime le rendu */
    msg: PropTypes.string,
    /**
     * Callback déclenché par le bouton "Continuer →".
     * N'est rendu que si type === 'ok' et onContinue est fourni.
     */
    onContinue: PropTypes.func,
};

Bubble.defaultProps = {
    msg: null,
    onContinue: null,
};
