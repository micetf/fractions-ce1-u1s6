/**
 * @file Navbar.jsx — barre de navigation MiCetF, contextuelle selon la vue active.
 *
 * @description
 * Barre fixe `h-14` (56 px), `z-50`, seule barre présente dans toute
 * l'application. Elle délègue le rendu à deux sous-composants :
 *
 * - **NavCenter** — zone centrale (titre fixe ou zone d'appui long + badges)
 * - **NavActions** — zone droite (Dashboard, Aide, PayPal*, Email*)
 *                    * PayPal et Email masqués en mode atelier
 *
 * ────────────────────────────────────────────────────────────────
 * Trois modes
 * ────────────────────────────────────────────────────────────────
 * **Mode sélection** (`atelierMeta` absent) :
 *   Gauche : lien MiCetF  |  Centre : titre fixe  |  Droite : Aide + PayPal + Email
 *
 * **Mode atelier sans élève** (`atelierMeta` présent, `activeStudent` null) :
 *   Centre : zone d'appui long — titre + badge atelier
 *   Droite : Dashboard + Aide
 *
 * **Mode atelier avec élève** (`atelierMeta` + `activeStudent` présents) :
 *   Centre : titre + badge atelier + badge 👤 prénom
 *   Droite : Dashboard + Aide
 *
 * ────────────────────────────────────────────────────────────────
 * Appui long
 * ────────────────────────────────────────────────────────────────
 * En mode atelier, la zone centrale déclenche le TeacherMenu après
 * 2 s via `onLongPressStart` / `onLongPressEnd` (gérés dans App.jsx).
 *
 * @module Navbar
 */

import { useState } from "react";
import PropTypes from "prop-types";
import NavCenter from "./navbar/NavCenter.jsx";
import NavActions from "./navbar/NavActions.jsx";

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Barre de navigation MiCetF — fixe, z-50, h-14 (56 px).
 *
 * @param {Object|null}   [props.atelierMeta]           - Métadonnées de l'atelier actif
 * @param {string}         props.atelierMeta.icon        - Emoji de l'atelier
 * @param {string}         props.atelierMeta.label       - Nom de l'atelier
 * @param {string}         props.atelierMeta.color       - Couleur thématique (hex)
 * @param {string}         props.atelierMeta.light       - Couleur de fond claire (hex)
 * @param {string}         props.atelierMeta.border      - Couleur de bordure (hex)
 * @param {string}         props.atelierMeta.sub         - Sous-titre de l'atelier
 * @param {Object|null}   [props.activeStudent]          - Élève actif (null = sélection en cours)
 * @param {string}         props.activeStudent.pseudo    - Pseudo affiché
 * @param {Function|null} [props.onLongPressStart]       - Début d'appui long
 * @param {Function|null} [props.onLongPressEnd]         - Fin / annulation d'appui long
 * @param {Function|null} [props.onOpenDash]             - Ouvre le Dashboard
 * @param {boolean}       [props.hasSitDone]             - Point vert sur le bouton 📊
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
    const isAtelier = atelierMeta !== null;

    return (
        <nav
            className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50 no-print"
            aria-label="Barre de navigation principale"
            style={{ fontFamily: "'Nunito', sans-serif" }}
        >
            <div className="max-w-full px-4">
                <div className="flex items-center justify-between h-14">
                    {/* ── Gauche : lien MiCetF ── */}
                    <a
                        href="https://micetf.fr"
                        className="text-white font-semibold text-lg
                                   hover:text-gray-300 transition shrink-0"
                        title="Retour à MiCetF"
                    >
                        MiCetF
                    </a>

                    {/* ── Bouton hamburger — mobile uniquement ── */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="md:hidden inline-flex items-center justify-center p-2
                                   text-gray-400 hover:text-white hover:bg-gray-700
                                   rounded transition touch-manipulation"
                        aria-controls="navbarMenu"
                        aria-expanded={menuOpen}
                        aria-label={
                            menuOpen ? "Fermer le menu" : "Ouvrir le menu"
                        }
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                    menuOpen
                                        ? "M6 18L18 6M6 6l12 12"
                                        : "M4 6h16M4 12h16M4 18h16"
                                }
                            />
                        </svg>
                    </button>

                    {/* ── Menu principal (desktop toujours visible, mobile déroulant) ── */}
                    <div
                        id="navbarMenu"
                        className={`${menuOpen ? "flex" : "hidden"} md:flex md:items-center md:flex-1
                                    flex-col md:flex-row absolute md:static top-14 left-0 right-0
                                    bg-gray-800 md:bg-transparent px-4 md:px-0 pb-3 md:pb-0`}
                    >
                        {/* Centre */}
                        <div className="flex items-center ml-0 md:ml-4 py-2 md:py-0">
                            <NavCenter
                                isAtelier={isAtelier}
                                atelierMeta={atelierMeta}
                                activeStudent={activeStudent}
                                onLongPressStart={onLongPressStart}
                                onLongPressEnd={onLongPressEnd}
                            />
                        </div>

                        <div className="flex-1" />

                        {/* Droite */}
                        <div className="mt-2 md:mt-0">
                            <NavActions
                                isAtelier={isAtelier}
                                onOpenDash={onOpenDash}
                                hasSitDone={hasSitDone}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
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
