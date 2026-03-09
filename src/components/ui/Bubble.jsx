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
 * @param {'ok'|'err'|'hint'}  props.type - Type de feedback
 * @param {string|null}        props.msg  - Message à afficher (null = non rendu)
 *
 * @returns {JSX.Element|null}
 */
export default function Bubble({ type, msg }) {
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
            {msg}
        </div>
    );
}

Bubble.propTypes = {
    /** Type de feedback — détermine le style de la bulle */
    type: PropTypes.oneOf(["ok", "err", "hint"]).isRequired,
    /** Message affiché ; null ou undefined supprime le rendu */
    msg: PropTypes.string,
};

Bubble.defaultProps = {
    msg: null,
};
