/**
 * @file NavActions.jsx — zone droite de la barre de navigation.
 *
 * @description
 * Groupe de boutons d'action alignés à droite dans la Navbar.
 *
 * ── Mode atelier (`isAtelier` true) ──────────────────────────────────
 *   [📊 Tableau de bord]  [? Aide]
 *   PayPal et email sont masqués pour ne pas perturber l'élève.
 *
 * ── Mode sélection (`isAtelier` false) ────────────────────────────────
 *   [? Aide]  [♥ Don PayPal]  [✉ Email]
 *
 * Le sujet de l'email est construit dynamiquement à partir de
 * `window.location.pathname`, encodé via `encodeURIComponent`.
 *
 * @module navbar/NavActions
 */

import { useState } from "react";
import PropTypes from "prop-types";
import HelpModal from "../ui/HelpModal.jsx";

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

/** Icône cœur (don PayPal) */
const IconHeart = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="h-4 w-4 inline"
        fill="#f8f9fa"
    >
        <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z" />
    </svg>
);

/** Icône enveloppe (email) */
const IconMail = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="h-4 w-4 inline"
        fill="#f8f9fa"
    >
        <path d="M18 2a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
    </svg>
);

// ─── Sous-composant : bouton Dashboard ────────────────────────────────────────

/**
 * Bouton d'accès au tableau de bord — affiché uniquement en mode atelier.
 *
 * @param {{ onClick: Function, hasSitDone: boolean }} props
 */
function DashButton({ onClick, hasSitDone }) {
    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg
                           text-white text-xs font-bold transition-colors hover:bg-white/20
                           touch-manipulation"
                style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                }}
                aria-label="Ouvrir le tableau de bord"
            >
                <span>📊</span>
                <span className="hidden sm:inline">Tableau de bord</span>

                {/* Point vert si au moins une situation terminée */}
                {hasSitDone && (
                    <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2
                                   rounded-full bg-emerald-400"
                        aria-hidden="true"
                    />
                )}
            </button>
        </li>
    );
}

DashButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    hasSitDone: PropTypes.bool.isRequired,
};

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Zone droite de la Navbar — boutons d'action contextuels.
 *
 * @param {boolean}       props.isAtelier   - Vrai si un atelier est actif
 * @param {Function|null} props.onOpenDash  - Ouvre le Dashboard
 * @param {boolean}       props.hasSitDone  - Point vert sur le bouton 📊
 * @returns {JSX.Element}
 */
export default function NavActions({ isAtelier, onOpenDash, hasSitDone }) {
    const [helpOpen, setHelpOpen] = useState(false);

    /** Sujet de l'email basé sur le chemin courant */
    const mailSubject = encodeURIComponent(
        `À propos de ${window.location.pathname}`
    );
    const mailHref = `mailto:webmaster@micetf.fr?subject=${mailSubject}`;

    return (
        <>
            <ul className="flex items-center space-x-1">
                {/* ── Tableau de bord — mode atelier uniquement ── */}
                {isAtelier && onOpenDash && (
                    <DashButton onClick={onOpenDash} hasSitDone={hasSitDone} />
                )}

                {/* ── Aide ── */}
                <li>
                    <button
                        type="button"
                        onClick={() => setHelpOpen(true)}
                        className="w-10 h-10 bg-blue-600 text-white rounded-full
                                   hover:bg-blue-700 transition font-bold text-lg
                                   touch-manipulation"
                        title="Aide"
                        aria-label="Ouvrir l'aide"
                    >
                        ?
                    </button>
                </li>

                {/* ── Don PayPal — mode sélection uniquement ── */}
                {!isAtelier && (
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
                                           hover:bg-yellow-600 transition my-1 mx-1
                                           touch-manipulation"
                                title="Si vous pensez que ces outils le méritent… Merci !"
                            >
                                <IconHeart />
                            </button>
                            <input type="hidden" name="cmd" value="_s-xclick" />
                            <input
                                type="hidden"
                                name="hosted_button_id"
                                value="Q2XYVFP4EEX2J"
                            />
                        </form>
                    </li>
                )}

                {/* ── Email — mode sélection uniquement ── */}
                {!isAtelier && (
                    <li>
                        <a
                            href={mailHref}
                            className="px-3 py-2 bg-gray-600 text-white rounded
                                       hover:bg-gray-700 transition my-1 mx-1
                                       inline-block touch-manipulation"
                            title="Pour contacter le webmaster…"
                        >
                            <IconMail />
                        </a>
                    </li>
                )}
            </ul>

            {/* Modal d'aide */}
            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </>
    );
}

NavActions.propTypes = {
    /** Vrai si un atelier est actif (masque PayPal et email) */
    isAtelier: PropTypes.bool.isRequired,
    /** Ouvre le Dashboard — requis en mode atelier */
    onOpenDash: PropTypes.func,
    /** Affiche un point vert sur le bouton 📊 */
    hasSitDone: PropTypes.bool,
};

NavActions.defaultProps = {
    onOpenDash: null,
    hasSitDone: false,
};
