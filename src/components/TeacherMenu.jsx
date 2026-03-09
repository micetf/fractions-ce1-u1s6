/**
 * @file TeacherMenu — menu contextuel enseignant déclenché par appui long.
 *
 * @description
 * Panneau modal surgissant depuis le bas (bottom sheet) proposant deux actions
 * réservées à l'enseignant·e, accessibles via un appui long (≥ 2 s) sur le header.
 *
 * Ce mécanisme de déclenchement discret évite que les élèves n'accèdent
 * accidentellement aux fonctions de pilotage de la séance.
 *
 * Actions disponibles :
 * - **Tableau de bord** — ouvre le Dashboard de suivi en temps réel
 * - **Changer d'atelier** — réinitialise l'état et revient à SetupScreen
 *
 * ────────────────────────────────────────────────────────────────
 * Accessibilité
 * ────────────────────────────────────────────────────────────────
 * - `role="dialog"` + `aria-modal="true"` sur le panneau
 * - `aria-label` sur chaque bouton d'action
 * - Fond semi-transparent cliquable pour fermer (équivalent "Annuler")
 */

import PropTypes from "prop-types";

// ─── Sous-composant : bouton d'action du menu ──────────────────────────────────

/**
 * Bouton d'action stylisé pour le menu enseignant.
 *
 * @param {Object}  props
 * @param {string}  props.icon       - Emoji de l'action
 * @param {string}  props.label      - Titre principal
 * @param {string}  props.sub        - Sous-titre descriptif
 * @param {string}  props.bg         - Couleur de fond (hex)
 * @param {string}  props.border     - Couleur de bordure (hex)
 * @param {string}  props.labelColor - Couleur du titre (classe Tailwind)
 * @param {string}  props.subColor   - Couleur du sous-titre (classe Tailwind)
 * @param {string}  props.hoverBg    - Classe Tailwind de survol
 * @param {Function} props.onClick   - Callback au clic
 *
 * @returns {JSX.Element}
 */
function MenuAction({
    icon,
    label,
    sub,
    bg,
    border,
    labelColor,
    subColor,
    hoverBg,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={`flex items-center gap-3 p-4 rounded-2xl text-left
                  font-bold text-slate-800 transition-colors touch-manipulation
                  ${hoverBg}`}
            style={{ background: bg, border: `2px solid ${border}` }}
        >
            <span
                className="text-2xl flex-shrink-0"
                role="img"
                aria-hidden="true"
            >
                {icon}
            </span>
            <div>
                <p className={`font-bold ${labelColor}`}>{label}</p>
                <p className={`text-xs font-semibold ${subColor}`}>{sub}</p>
            </div>
        </button>
    );
}

MenuAction.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sub: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
    labelColor: PropTypes.string.isRequired,
    subColor: PropTypes.string.isRequired,
    hoverBg: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Menu enseignant affiché en bottom sheet modal.
 *
 * @param {Object}   props
 * @param {Function} props.onDash   - Ouvre le tableau de bord
 * @param {Function} props.onChange - Revient à la sélection d'atelier
 * @param {Function} props.onClose  - Ferme le menu sans action
 *
 * @returns {JSX.Element}
 */
export default function TeacherMenu({ onDash, onChange, onClose }) {
    return (
        /* Fond semi-transparent — clic = fermeture */
        <div
            className="fixed inset-0 z-40 flex items-end justify-center p-4 no-print"
            style={{ background: "rgba(0,0,0,.5)" }}
            onClick={onClose}
            role="presentation"
        >
            {/* Panneau — stoppe la propagation pour éviter la fermeture au clic interne */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu enseignant"
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-4 kf-up"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Menu enseignant·e
                </p>

                <div className="flex flex-col gap-2">
                    {/* Action : Tableau de bord */}
                    <MenuAction
                        icon="📊"
                        label="Tableau de bord"
                        sub="Suivi du groupe en temps réel"
                        bg="#EFF6FF"
                        border="#BFDBFE"
                        labelColor="text-blue-800"
                        subColor="text-blue-500"
                        hoverBg="hover:bg-blue-50"
                        onClick={onDash}
                    />

                    {/* Action : Changer d'atelier */}
                    <MenuAction
                        icon="🔄"
                        label="Changer d'atelier"
                        sub="Réinitialise et revient à la sélection"
                        bg="#FEF2F2"
                        border="#FECACA"
                        labelColor="text-red-800"
                        subColor="text-red-500"
                        hoverBg="hover:bg-red-50"
                        onClick={onChange}
                    />

                    {/* Bouton Annuler */}
                    <button
                        onClick={onClose}
                        className="py-3 rounded-2xl text-slate-400 font-bold text-sm
                       hover:bg-slate-50 transition-colors touch-manipulation"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

TeacherMenu.propTypes = {
    /** Ouvre le tableau de bord enseignant */
    onDash: PropTypes.func.isRequired,
    /** Revient à l'écran de sélection d'atelier (réinitialisation) */
    onChange: PropTypes.func.isRequired,
    /** Ferme le menu sans déclencher d'action */
    onClose: PropTypes.func.isRequired,
};
