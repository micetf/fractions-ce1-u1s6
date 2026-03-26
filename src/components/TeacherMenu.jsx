/**
 * @file TeacherMenu — menu contextuel enseignant déclenché par appui long.
 *
 * @description
 * Panneau modal surgissant depuis le bas (bottom sheet) proposant quatre
 * actions réservées à l'enseignant·e, accessibles via un appui long (≥ 2 s).
 *
 * Actions disponibles :
 * - **Tableau de bord**   — ouvre le Dashboard onglet Session
 * - **Gérer les élèves**  — ouvre le Dashboard onglet Classe (CRUD registre)
 * - **Changer d'élève**   — réinitialise la session, garde l'atelier
 * - **Changer d'atelier** — réinitialise et revient à SetupScreen
 *
 * L'accès à la gestion des élèves est ici le seul point d'entrée
 * disponible pour l'élève — toutes les actions sont protégées par
 * le geste d'appui long.
 *
 * @module TeacherMenu
 */

import PropTypes from "prop-types";

// ─── Sous-composant : bouton d'action ──────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {string}   props.icon       - Emoji de l'action
 * @param {string}   props.label      - Titre principal
 * @param {string}   props.sub        - Sous-titre descriptif
 * @param {string}   props.bg         - Couleur de fond (hex)
 * @param {string}   props.border     - Couleur de bordure (hex)
 * @param {string}   props.labelColor - Classe Tailwind du titre
 * @param {string}   props.subColor   - Classe Tailwind du sous-titre
 * @param {string}   props.hoverBg    - Classe Tailwind de survol
 * @param {Function} props.onClick    - Callback au clic
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
 * @param {Function} props.onDash          - Ouvre le Dashboard (onglet Session)
 * @param {Function} props.onManage        - Ouvre le Dashboard (onglet Classe)
 * @param {Function} props.onChangeStudent - Réinitialise la session élève
 * @param {Function} props.onChange        - Revient à la sélection d'atelier
 * @param {Function} props.onClose         - Ferme le menu sans action
 */
export default function TeacherMenu({
    onDash,
    onManage,
    onChangeStudent,
    onChange,
    onClose,
}) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-end justify-center p-4 no-print"
            style={{ background: "rgba(0,0,0,.5)" }}
            onClick={onClose}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu enseignant"
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-4 kf-up"
                onClick={(e) => e.stopPropagation()}
            >
                <p
                    className="text-center text-xs font-bold text-slate-400
                              uppercase tracking-widest mb-3"
                >
                    Menu enseignant·e
                </p>

                <div className="flex flex-col gap-2">
                    {/* Tableau de bord — session en cours */}
                    <MenuAction
                        icon="📊"
                        label="Tableau de bord"
                        sub="Suivi de la session en cours"
                        bg="#EFF6FF"
                        border="#BFDBFE"
                        labelColor="text-blue-800"
                        subColor="text-blue-500"
                        hoverBg="hover:bg-blue-50"
                        onClick={onDash}
                    />

                    {/* Gérer les élèves — CRUD registre, unique point d'accès */}
                    <MenuAction
                        icon="👥"
                        label="Gérer les élèves"
                        sub="Ajouter, supprimer, suivre la classe"
                        bg="#F0FDF4"
                        border="#BBF7D0"
                        labelColor="text-emerald-800"
                        subColor="text-emerald-600"
                        hoverBg="hover:bg-emerald-50"
                        onClick={onManage}
                    />

                    {/* Changer d'élève */}
                    <MenuAction
                        icon="👤"
                        label="Changer d'élève"
                        sub="Réinitialise la session, garde l'atelier"
                        bg="#F5F3FF"
                        border="#DDD6FE"
                        labelColor="text-violet-800"
                        subColor="text-violet-600"
                        hoverBg="hover:bg-violet-50"
                        onClick={onChangeStudent}
                    />

                    {/* Changer d'atelier */}
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
    onDash: PropTypes.func.isRequired,
    onManage: PropTypes.func.isRequired,
    onChangeStudent: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
