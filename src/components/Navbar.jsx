/**
 * @file Navbar.jsx — barre de navigation contextuelle selon le mode.
 *
 * @description
 * Trois comportements selon `mode` :
 *
 * ── Mode `visitor` ──────────────────────────────────────────────────
 *   Gauche : lien MiCetF
 *   Centre : titre « Fractions CE1 »
 *   Droite : Aide + PayPal + Email
 *
 * ── Mode `teacher` ──────────────────────────────────────────────────
 *   Gauche : bouton ← retour (onBack)
 *   Centre : titre + badge atelier si atelierMeta fourni
 *   Droite : Aide uniquement
 *
 * ── Mode `student` ──────────────────────────────────────────────────
 *   Gauche : MiCetF (lien externe neutre)
 *   Centre : zone d'appui long — titre + badge atelier + badge élève
 *   Droite : bouton 📊 (résultats propres) + Aide
 *   Pas de PayPal, pas de gestion classe
 *
 * @module Navbar
 */

import { useState } from "react";
import PropTypes from "prop-types";
import HelpModal from "./ui/HelpModal.jsx";
import NavCenter from "./navbar/NavCenter.jsx";
import NavActions from "./navbar/NavActions.jsx";

// ─── Composant principal ────────────────────────────────────────────────────────

/**
 * Barre de navigation MiCetF — fixe, z-50, h-14 (56 px).
 *
 * @param {'visitor'|'teacher'|'student'} [props.mode='visitor']
 * @param {Object|null}   [props.atelierMeta]       - Métadonnées atelier
 * @param {Object|null}   [props.activeStudent]     - Élève actif (mode student)
 * @param {Function|null} [props.onBack]            - Retour (mode teacher)
 * @param {Function|null} [props.onLongPressStart]  - Appui long début (mode student)
 * @param {Function|null} [props.onLongPressEnd]    - Appui long fin  (mode student)
 * @param {Function|null} [props.onOpenDash]        - Ouvre Dashboard élève (mode student)
 * @param {boolean}       [props.hasSitDone]        - Point vert sur 📊
 * @returns {JSX.Element}
 */
export default function Navbar({
    mode = "visitor",
    atelierMeta = null,
    activeStudent = null,
    onBack = null,
    onLongPressStart = null,
    onLongPressEnd = null,
    onOpenDash = null,
    hasSitDone = false,
}) {
    const [helpOpen, setHelpOpen] = useState(false);

    const isTeacher = mode === "teacher";
    const isStudent = mode === "student";

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50 h-14 no-print"
                aria-label="Barre de navigation principale"
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                <div className="h-full max-w-full px-3 flex items-center justify-between">
                    {/* ── Gauche ── */}
                    {isTeacher && onBack ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-1 text-white/80
                                       hover:text-white text-sm font-bold
                                       transition-colors shrink-0 touch-manipulation
                                       py-2 pr-2"
                            aria-label="Retour"
                        >
                            ← <span className="hidden sm:inline">Retour</span>
                        </button>
                    ) : (
                        <a
                            href="https://micetf.fr"
                            className="text-white font-semibold text-lg
                                       hover:text-gray-300 transition shrink-0"
                            title="Retour à MiCetF"
                        >
                            MiCetF
                        </a>
                    )}

                    {/* ── Centre ── */}
                    <div className="flex-1 flex items-center justify-center min-w-0 px-2">
                        {isStudent && atelierMeta ? (
                            <NavCenter
                                isAtelier={true}
                                atelierMeta={atelierMeta}
                                activeStudent={activeStudent}
                                onLongPressStart={onLongPressStart}
                                onLongPressEnd={onLongPressEnd}
                            />
                        ) : isTeacher && atelierMeta ? (
                            /* Teacher — badge atelier sans appui long */
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="text-white font-semibold text-base shrink-0"
                                    style={{
                                        fontFamily: "'Fredoka', sans-serif",
                                    }}
                                >
                                    {atelierMeta.icon} {atelierMeta.label}
                                </span>
                            </div>
                        ) : (
                            /* Visitor ou teacher home */
                            <span
                                className="text-white font-semibold text-base"
                                style={{ fontFamily: "'Fredoka', sans-serif" }}
                            >
                                {isTeacher
                                    ? "🎓 Espace enseignant·e"
                                    : "🧮 Fractions CE1"}
                            </span>
                        )}
                    </div>

                    {/* ── Droite ── */}
                    <NavActions
                        isAtelier={isStudent}
                        showPaypal={!isTeacher && !isStudent}
                        onOpenDash={isStudent ? onOpenDash : null}
                        hasSitDone={hasSitDone}
                        onHelp={() => setHelpOpen(true)}
                    />
                </div>
            </nav>

            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </>
    );
}

Navbar.propTypes = {
    mode: PropTypes.oneOf(["visitor", "teacher", "student"]),
    atelierMeta: PropTypes.shape({
        icon: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        light: PropTypes.string.isRequired,
        border: PropTypes.string.isRequired,
    }),
    activeStudent: PropTypes.shape({
        id: PropTypes.string.isRequired,
        pseudo: PropTypes.string.isRequired,
    }),
    onBack: PropTypes.func,
    onLongPressStart: PropTypes.func,
    onLongPressEnd: PropTypes.func,
    onOpenDash: PropTypes.func,
    hasSitDone: PropTypes.bool,
};
