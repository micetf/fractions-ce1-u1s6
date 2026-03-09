/**
 * @file Composant Btn — bouton de sélection de fraction.
 *
 * @description
 * Bouton multi-état utilisé pour les choix de nommage des fractions.
 * Les états visuels encodent la correction pédagogique immédiatement.
 *
 * États possibles :
 * - `idle`     : bouton interactif (blanc, bordure slate)
 * - `ok`       : réponse correcte (vert émeraude + animation pop)
 * - `err`      : réponse incorrecte (rouge clair + animation shake)
 * - `off`      : désactivé après validation (gris pâle, non cliquable)
 */

import PropTypes from "prop-types";

/** @type {Object.<string, string>} Classes Tailwind par état */
const STATE_CLASSES = {
    idle: [
        "bg-white text-slate-800",
        "border-2 border-slate-200",
        "hover:border-blue-300 hover:shadow-md",
        "active:scale-95 cursor-pointer",
    ].join(" "),
    ok: [
        "bg-emerald-500 text-white",
        "border-2 border-emerald-400",
        "kf-pop cursor-default",
    ].join(" "),
    err: [
        "bg-red-50 text-red-600",
        "border-2 border-red-300",
        "kf-shake cursor-default",
    ].join(" "),
    off: [
        "bg-slate-50 text-slate-300",
        "border-2 border-slate-100",
        "cursor-default",
    ].join(" "),
};

/**
 * Bouton de choix de fraction avec feedback visuel intégré.
 *
 * @param {Object}   props
 * @param {string}   props.label   - Texte affiché (ex : "un demi")
 * @param {Function} props.onClick - Callback déclenché seulement en état `idle`
 * @param {'idle'|'ok'|'err'|'off'} [props.v='idle'] - État visuel du bouton
 * @param {string}   [props.cls=''] - Classes Tailwind additionnelles
 *
 * @returns {JSX.Element}
 */
export default function Btn({ label, onClick, v = "idle", cls = "" }) {
    return (
        <button
            onClick={v === "idle" ? onClick : undefined}
            aria-disabled={v !== "idle"}
            className={[
                "py-3 px-4 rounded-2xl text-base font-bold",
                "transition-all duration-150",
                "min-w-[110px] touch-manipulation select-none",
                STATE_CLASSES[v] ?? STATE_CLASSES.idle,
                cls,
            ].join(" ")}
        >
            {label}
        </button>
    );
}

Btn.propTypes = {
    /** Texte du bouton */
    label: PropTypes.string.isRequired,
    /** Appelé au clic uniquement quand v === 'idle' */
    onClick: PropTypes.func.isRequired,
    /** État visuel */
    v: PropTypes.oneOf(["idle", "ok", "err", "off"]),
    /** Classes Tailwind supplémentaires */
    cls: PropTypes.string,
};
