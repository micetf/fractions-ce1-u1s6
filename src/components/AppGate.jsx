/**
 * @file AppGate.jsx — écran d'attente affiché quand aucune session n'est active.
 *
 * @description
 * Point d'entrée de l'application quand `session.active === false`.
 * Deux situations possibles :
 * - Première utilisation : le roster est vide, l'enseignant doit configurer la classe.
 * - Entre deux séances : l'enseignant doit lancer une nouvelle session.
 *
 * L'accès enseignant est déclenché par un appui long (1 500 ms) sur la zone centrale.
 * Aucun bouton ni indication visuelle ne signale cette interaction aux élèves.
 *
 * Conformité specs :
 * - `teacherAuthed` n'est jamais écrit dans localStorage
 * - Le long press n'est pas documenté dans l'UI élève
 * - Un élève arrivant sur cet écran voit uniquement le message d'attente
 *
 * @module AppGate
 */

import { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Durée de l'appui long pour déclencher l'accès enseignant (ms). */
const LONG_PRESS_DELAY = 1500;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {Function} props.onEnterTeacher - Déclenché après un long press valide
 */
export default function AppGate({ onEnterTeacher }) {
    const holdRef = useRef(null);
    const [pressing, setPressing] = useState(false);

    const handlePressStart = useCallback(() => {
        setPressing(true);
        holdRef.current = setTimeout(() => {
            setPressing(false);
            onEnterTeacher();
        }, LONG_PRESS_DELAY);
    }, [onEnterTeacher]);

    const handlePressEnd = useCallback(() => {
        clearTimeout(holdRef.current);
        setPressing(false);
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center
                       select-none"
            style={{ background: "#F1EDE4" }}
        >
            {/* Zone centrale — seul élément interactif, non documenté UI élève */}
            <div
                role="presentation"
                onPointerDown={handlePressStart}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onContextMenu={(e) => e.preventDefault()}
                className="flex flex-col items-center gap-6 p-12 rounded-3xl
                           cursor-default touch-manipulation"
                style={{
                    /* Feedback visuel discret pendant l'appui — imperceptible
                       pour un élève qui ne cherche pas */
                    opacity: pressing ? 0.7 : 1,
                    transition: "opacity 0.15s ease",
                }}
            >
                {/* Logo / titre */}
                <div className="text-center pointer-events-none">
                    <p className="text-5xl mb-3" aria-hidden="true">
                        🧮
                    </p>
                    <h1
                        className="text-3xl font-bold text-slate-700"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                        Fractions CE1
                    </h1>
                </div>

                {/* Message d'attente — affiché aux élèves */}
                <div
                    className="px-5 py-3 rounded-2xl text-center border-2
                               border-dashed border-slate-300"
                >
                    <p className="text-slate-400 font-bold text-sm">
                        ⏳ En attente d'une session
                    </p>
                    <p className="text-slate-400 text-xs font-semibold mt-1">
                        Demande à ton enseignant·e de lancer l'activité
                    </p>
                </div>
            </div>
        </div>
    );
}

AppGate.propTypes = {
    onEnterTeacher: PropTypes.func.isRequired,
};
