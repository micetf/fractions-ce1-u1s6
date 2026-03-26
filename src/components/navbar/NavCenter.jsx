/**
 * @file NavCenter.jsx — zone centrale contextuelle de la barre de navigation.
 *
 * @description
 * Rend trois états selon le contexte :
 *
 * 1. **Mode sélection** (`isAtelier` false) : titre fixe « 🧮 Fractions CE1 »
 * 2. **Mode atelier sans élève** : zone d'appui long — titre + badge atelier
 * 3. **Mode atelier avec élève** : idem + badge 👤 prénom
 *
 * @module navbar/NavCenter
 */

import PropTypes from "prop-types";

// ─── Constantes ────────────────────────────────────────────────────────────────

const FREDOKA = { fontFamily: "'Fredoka', sans-serif" };

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Zone centrale contextuelle de la Navbar.
 *
 * @param {boolean}      props.isAtelier        - Vrai si un atelier est actif
 * @param {Object|null}  props.atelierMeta       - Métadonnées de l'atelier
 * @param {string}       props.atelierMeta.icon  - Emoji de l'atelier
 * @param {string}       props.atelierMeta.label - Nom de l'atelier
 * @param {string}       props.atelierMeta.color - Couleur thématique (hex)
 * @param {string}       props.atelierMeta.light - Fond clair (hex)
 * @param {string}       props.atelierMeta.border - Bordure (hex)
 * @param {Object|null}  props.activeStudent      - Élève actif ou null
 * @param {string}       props.activeStudent.pseudo - Pseudo affiché
 * @param {Function|null} props.onLongPressStart  - Début d'appui long
 * @param {Function|null} props.onLongPressEnd    - Fin / annulation d'appui long
 * @returns {JSX.Element}
 */
export default function NavCenter({
    isAtelier,
    atelierMeta,
    activeStudent,
    onLongPressStart,
    onLongPressEnd,
}) {
    if (!isAtelier) {
        return (
            <span
                className="text-white font-semibold text-base"
                style={FREDOKA}
            >
                🧮 Fractions CE1
            </span>
        );
    }

    return (
        <div
            className="flex items-center gap-2 cursor-pointer select-none
                       rounded-xl px-2 py-1 hover:bg-white/10 transition-colors min-w-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
            onPointerDown={onLongPressStart}
            onPointerUp={onLongPressEnd}
            onPointerLeave={onLongPressEnd}
            title="Appui long : menu enseignant·e"
        >
            {/* Titre application */}
            <span
                className="text-white font-semibold text-base shrink-0"
                style={FREDOKA}
            >
                Fractions CE1
            </span>

            {/* Séparateur · */}
            <span className="text-gray-500 mx-0.5 hidden sm:inline">·</span>

            {/* Badge atelier — masqué sur très petits écrans */}
            <span
                className="hidden sm:inline-flex items-center gap-1.5
                           px-2 py-0.5 rounded-lg text-xs font-bold shrink-0"
                style={{
                    background: atelierMeta.light,
                    border: `1.5px solid ${atelierMeta.border}`,
                    color: atelierMeta.color,
                }}
            >
                <span>{atelierMeta.icon}</span>
                <span>{atelierMeta.label}</span>
            </span>

            {/* Badge élève actif */}
            {activeStudent && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5
                               rounded-lg text-xs font-bold text-white
                               shrink-0 max-w-[120px] truncate"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                    title={activeStudent.pseudo}
                >
                    <span>👤</span>
                    <span className="truncate">{activeStudent.pseudo}</span>
                </span>
            )}
        </div>
    );
}

NavCenter.propTypes = {
    isAtelier: PropTypes.bool.isRequired,
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
    }),
    activeStudent: PropTypes.shape({
        pseudo: PropTypes.string.isRequired,
    }),
    onLongPressStart: PropTypes.func,
    onLongPressEnd: PropTypes.func,
};
