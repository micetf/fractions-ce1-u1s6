/**
 * @file Navbar — barre de navigation MiCetF, contextuelle selon la vue active.
 *
 * @description
 * Barre fixe `h-14` (56 px), `z-50`, remplaçant l'ancien `<header>` dédié
 * aux ateliers. Elle est la **seule** barre présente dans toute l'application.
 *
 * ────────────────────────────────────────────────────────────────
 * Deux modes
 * ────────────────────────────────────────────────────────────────
 * **Mode sélection** (props atelier absentes) :
 *   Gauche : lien MiCetF  |  Centre : titre fixe  |  Droite : actions
 *
 * **Mode atelier** (props atelier présentes) :
 *   Gauche : lien MiCetF  |  Centre : zone d'appui long (titre + badge)
 *   Droite : bouton 📊 + actions
 *
 * ────────────────────────────────────────────────────────────────
 * Appui long
 * ────────────────────────────────────────────────────────────────
 * En mode atelier, la zone centrale (🧮 Fractions CE1 · badge) déclenche
 * le TeacherMenu après 2 s via onLongPressStart / onLongPressEnd.
 * Ce geste discret est documenté dans la modale d'aide.
 *
 * ────────────────────────────────────────────────────────────────
 * Modale d'aide — deux onglets
 * ────────────────────────────────────────────────────────────────
 * Onglet Enseignant·e :
 *   - Navigation et gestes (fonctionnel)
 *   - Objectif pédagogique de la séance
 *   - Les trois ateliers et leurs fractions
 *   - Lire le tableau de bord
 *   - Situation non-unitaire (Cuisenaire)
 *
 * Onglet Élève :
 *   - Les trois gestes (ajouter / valider / nommer / continuer)
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
 * @param {Object|null}   [props.atelierMeta]       - Métadonnées de l'atelier actif (null = SetupScreen)
 * @param {string}        props.atelierMeta.icon    - Emoji de l'atelier
 * @param {string}        props.atelierMeta.label   - Nom de l'atelier
 * @param {string}        props.atelierMeta.color   - Couleur thématique (hex)
 * @param {string}        props.atelierMeta.light   - Couleur de fond claire (hex)
 * @param {string}        props.atelierMeta.border  - Couleur de bordure (hex)
 * @param {string}        props.atelierMeta.sub     - Sous-titre de l'atelier
 * @param {Function|null} [props.onLongPressStart]  - Début d'appui long
 * @param {Function|null} [props.onLongPressEnd]    - Fin / annulation d'appui long
 * @param {Function|null} [props.onOpenDash]        - Ouvre le Dashboard
 * @param {boolean}       [props.hasSitDone]        - Point vert sur 📊
 *
 * @returns {JSX.Element}
 */
export default function Navbar({
    atelierMeta = null,
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
                className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50 no-print"
                aria-label="Barre de navigation principale"
            >
                <div className="max-w-full px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Lien MiCetF */}
                        <a
                            href="https://micetf.fr"
                            className="text-white font-semibold text-lg hover:text-gray-300 transition shrink-0"
                        >
                            MiCetF
                        </a>

                        {/* Burger mobile */}
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center p-2
                         text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                            aria-controls="navbarMenu"
                            aria-expanded={menuOpen}
                            aria-label="Ouvrir le menu"
                            onClick={() => setMenuOpen((o) => !o)}
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* Barre desktop */}
                        <div
                            id="navbarMenu"
                            className={`${menuOpen ? "flex" : "hidden"} md:flex md:items-center md:flex-1
                          flex-col md:flex-row absolute md:static top-14 left-0 right-0
                          bg-gray-800 md:bg-transparent px-4 md:px-0 pb-3 md:pb-0`}
                        >
                            {/* Centre */}
                            <div className="flex items-center ml-0 md:ml-4 py-2 md:py-0">
                                {isAtelier ? (
                                    <div
                                        className="flex items-center gap-2 cursor-pointer select-none
                               rounded-xl px-2 py-1 hover:bg-white/10 transition-colors"
                                        style={{
                                            WebkitTapHighlightColor:
                                                "transparent",
                                        }}
                                        onPointerDown={onLongPressStart}
                                        onPointerUp={onLongPressEnd}
                                        onPointerLeave={onLongPressEnd}
                                        title="Appui long : menu enseignant·e"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4 shrink-0"
                                            fill="#f8f9fa"
                                        >
                                            <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
                                        </svg>
                                        <span
                                            className="text-white font-semibold text-base"
                                            style={{
                                                fontFamily:
                                                    "'Fredoka', sans-serif",
                                            }}
                                        >
                                            Fractions CE1
                                        </span>
                                        <span className="text-gray-500 mx-1 hidden sm:inline">
                                            ·
                                        </span>
                                        <span
                                            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5
                                 rounded-lg text-xs font-bold"
                                            style={{
                                                background: atelierMeta.light,
                                                border: `1.5px solid ${atelierMeta.border}`,
                                                color: atelierMeta.color,
                                            }}
                                        >
                                            <span>{atelierMeta.icon}</span>
                                            <span>{atelierMeta.label}</span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4 shrink-0"
                                            fill="#f8f9fa"
                                        >
                                            <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
                                        </svg>
                                        <span
                                            className="text-white font-semibold text-lg"
                                            style={{
                                                fontFamily:
                                                    "'Fredoka', sans-serif",
                                            }}
                                        >
                                            Fractions CE1
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1" />

                            {/* Actions droite */}
                            <ul className="flex items-center space-x-1 mt-2 md:mt-0">
                                {/* Bouton 📊 — mode atelier uniquement */}
                                {isAtelier && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onOpenDash?.();
                                                setMenuOpen(false);
                                            }}
                                            aria-label="Ouvrir le tableau de bord"
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white
                                 text-xs font-bold transition-colors hover:bg-white/20"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,.12)",
                                                border: "1px solid rgba(255,255,255,.2)",
                                            }}
                                        >
                                            <span>📊</span>
                                            <span className="hidden sm:inline">
                                                Tableau de bord
                                            </span>
                                            {hasSitDone && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                )}

                                {/* Aide */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHelpOpen(true);
                                            setMenuOpen(false);
                                        }}
                                        className="w-10 h-10 bg-blue-600 text-white rounded-full
                               hover:bg-blue-700 transition font-bold text-lg"
                                        title="Aide"
                                    >
                                        ?
                                    </button>
                                </li>

                                {/* Don PayPal */}
                                <li>
                                    <form
                                        action="https://www.paypal.com/cgi-bin/webscr"
                                        method="post"
                                        target="_top"
                                        className="inline-block"
                                    >
                                        <button
                                            type="submit"
                                            className="px-3 py-2 bg-yellow-500 text-white rounded
                                 hover:bg-yellow-600 transition my-1 mx-1"
                                            title="Si vous pensez que ces outils le méritent... Merci !"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                className="h-4 w-4 inline"
                                                fill="#f8f9fa"
                                            >
                                                <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z" />
                                            </svg>
                                        </button>
                                        <input
                                            type="hidden"
                                            name="cmd"
                                            value="_s-xclick"
                                        />
                                        <input
                                            type="hidden"
                                            name="hosted_button_id"
                                            value="Q2XYVFP4EEX2J"
                                        />
                                    </form>
                                </li>

                                {/* Contact */}
                                <li>
                                    <a
                                        href="mailto:webmaster@micetf.fr?subject=À propos de /fractions-ce1-u1s6"
                                        className="px-3 py-2 bg-gray-600 text-white rounded
                               hover:bg-gray-700 transition my-1 mx-1 inline-block"
                                        title="Pour contacter le webmaster..."
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4 inline"
                                            fill="#f8f9fa"
                                        >
                                            <path d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </>
    );
}

Navbar.propTypes = {
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
        sub: PropTypes.string.isRequired,
    }),
    onLongPressStart: PropTypes.func,
    onLongPressEnd: PropTypes.func,
    onOpenDash: PropTypes.func,
    hasSitDone: PropTypes.bool,
};
