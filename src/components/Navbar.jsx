/**
 * @file Navbar — barre de navigation MiCetF, contextuelle selon la vue active.
 *
 * @description
 * Barre fixe `h-14` (56 px), `z-50`, remplaçant l'ancien `<header>` dédié
 * aux ateliers. Elle est la **seule** barre présente dans toute l'application.
 *
 * ────────────────────────────────────────────────────────────────
 * Trois modes
 * ────────────────────────────────────────────────────────────────
 * **Mode sélection** (`atelierMeta` absent) :
 *   Gauche : lien MiCetF  |  Centre : titre fixe  |  Droite : actions
 *
 * **Mode atelier sans élève** (`atelierMeta` présent, `activeStudent` null) :
 *   Centre : zone d'appui long — titre + badge atelier
 *
 * **Mode atelier avec élève** (`atelierMeta` + `activeStudent` présents) :
 *   Centre : titre + badge atelier + badge 👤 prénom
 *
 * ────────────────────────────────────────────────────────────────
 * Appui long
 * ────────────────────────────────────────────────────────────────
 * En mode atelier, la zone centrale déclenche le TeacherMenu après
 * 2 s via onLongPressStart / onLongPressEnd.
 *
 * @module Navbar
 */

import { useState } from "react";
import PropTypes from "prop-types";
import HelpModal from "./ui/HelpModal.jsx";

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Barre de navigation MiCetF — fixe, z-50, h-14 (56 px).
 *
 * @param {Object|null}   [props.atelierMeta]        - Métadonnées de l'atelier actif
 * @param {string}        props.atelierMeta.icon     - Emoji de l'atelier
 * @param {string}        props.atelierMeta.label    - Nom de l'atelier
 * @param {string}        props.atelierMeta.color    - Couleur thématique (hex)
 * @param {string}        props.atelierMeta.light    - Couleur de fond claire (hex)
 * @param {string}        props.atelierMeta.border   - Couleur de bordure (hex)
 * @param {string}        props.atelierMeta.sub      - Sous-titre de l'atelier
 * @param {Object|null}   [props.activeStudent]      - Élève actif (null = sélection en cours)
 * @param {string}        props.activeStudent.pseudo - Pseudo affiché
 * @param {Function|null} [props.onLongPressStart]   - Début d'appui long
 * @param {Function|null} [props.onLongPressEnd]     - Fin / annulation d'appui long
 * @param {Function|null} [props.onOpenDash]         - Ouvre le Dashboard
 * @param {boolean}       [props.hasSitDone]         - Point vert sur 📊
 *
 * @returns {JSX.Element}
 */
export default function Navbar({
    atelierMeta = null,
    activeStudent = null,
    onLongPressStart = null,
    onLongPressEnd = null,
    onOpenDash = null,
    hasSitDone = false,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const isAtelier = atelierMeta !== null;

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-800 no-print"
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                <div className="h-full flex items-center justify-between px-3">
                    {/* ── Gauche : lien MiCetF ── */}
                    <a
                        href="https://micetf.fr"
                        className="flex items-center gap-1.5 text-white/80 hover:text-white
                                   text-sm font-bold transition-colors shrink-0"
                        title="Retour à MiCetF"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            className="h-4 w-4 shrink-0"
                            fill="currentColor"
                        >
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span className="hidden sm:inline">MiCetF</span>
                    </a>

                    {/* ── Centre : zone contextuelle ── */}
                    <div className="flex-1 flex items-center justify-center min-w-0 px-2">
                        {isAtelier ? (
                            /* Zone d'appui long — titre + badges */
                            <div
                                className="flex items-center gap-2 cursor-pointer select-none
                                           rounded-xl px-2 py-1 hover:bg-white/10
                                           transition-colors min-w-0"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                }}
                                onPointerDown={onLongPressStart}
                                onPointerUp={onLongPressEnd}
                                onPointerLeave={onLongPressEnd}
                                title="Appui long : menu enseignant·e"
                            >
                                {/* Titre */}
                                <span
                                    className="text-white font-semibold text-base shrink-0"
                                    style={{
                                        fontFamily: "'Fredoka', sans-serif",
                                    }}
                                >
                                    Fractions CE1
                                </span>

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

                                {/* Badge élève actif — affiché uniquement quand identifié */}
                                {activeStudent && (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5
                                                   rounded-lg text-xs font-bold text-white shrink-0
                                                   max-w-[120px] truncate"
                                        style={{
                                            background:
                                                "rgba(255,255,255,0.18)",
                                        }}
                                        title={activeStudent.pseudo}
                                    >
                                        <span>👤</span>
                                        <span className="truncate">
                                            {activeStudent.pseudo}
                                        </span>
                                    </span>
                                )}
                            </div>
                        ) : (
                            /* Mode sélection — titre fixe */
                            <span
                                className="text-white font-semibold text-base"
                                style={{ fontFamily: "'Fredoka', sans-serif" }}
                            >
                                🧮 Fractions CE1
                            </span>
                        )}
                    </div>

                    {/* ── Droite : boutons d'action ── */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Bouton 📊 — mode atelier uniquement */}
                        {isAtelier && (
                            <button
                                type="button"
                                onClick={() => onOpenDash?.()}
                                className="relative p-2 text-white/70 hover:text-white
                                           rounded-lg hover:bg-white/10 transition-colors
                                           touch-manipulation"
                                title="Tableau de bord"
                                aria-label="Ouvrir le tableau de bord"
                            >
                                📊
                                {/* Point vert si au moins une situation terminée */}
                                {hasSitDone && (
                                    <span
                                        className="absolute top-1.5 right-1.5 w-2 h-2
                                                   rounded-full bg-emerald-400"
                                    />
                                )}
                            </button>
                        )}

                        {/* Bouton aide */}
                        <button
                            type="button"
                            onClick={() => setHelpOpen(true)}
                            className="p-2 text-white/70 hover:text-white rounded-lg
                                       hover:bg-white/10 transition-colors touch-manipulation"
                            title="Aide"
                            aria-label="Ouvrir l'aide"
                        >
                            ❓
                        </button>

                        {/* Bouton menu hamburger — mobile uniquement */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="md:hidden p-2 text-white/70 hover:text-white
                                       rounded-lg hover:bg-white/10 transition-colors
                                       touch-manipulation"
                            aria-label={
                                menuOpen ? "Fermer le menu" : "Ouvrir le menu"
                            }
                        >
                            {menuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* ── Menu déroulant mobile ── */}
                {menuOpen && (
                    <div className="md:hidden bg-gray-800 border-t border-white/10 px-4 py-3">
                        <a
                            href="https://micetf.fr"
                            className="block py-2 text-white/80 hover:text-white text-sm font-bold"
                        >
                            ← Retour à MiCetF
                        </a>
                    </div>
                )}
            </nav>

            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </>
    );
}

Navbar.propTypes = {
    /** Métadonnées de l'atelier actif — null sur SetupScreen */
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
        sub: PropTypes.string.isRequired,
    }),
    /** Élève actif — null si aucun sélectionné */
    activeStudent: PropTypes.shape({
        id: PropTypes.string.isRequired,
        pseudo: PropTypes.string.isRequired,
    }),
    /** Handlers d'appui long pour TeacherMenu */
    onLongPressStart: PropTypes.func,
    onLongPressEnd: PropTypes.func,
    /** Ouvre le Dashboard */
    onOpenDash: PropTypes.func,
    /** Affiche un point vert sur le bouton 📊 */
    hasSitDone: PropTypes.bool,
};
