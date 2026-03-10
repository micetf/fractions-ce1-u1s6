/**
 * @file App.jsx — composant racine de l'application Fractions CE1.
 *
 * @description
 * Orchestre les trois couches de l'application :
 *
 * 1. **Sélection** (`SetupScreen`)   — l'enseignant·e choisit l'atelier
 * 2. **Activité**  (AtelierTangram / AtelierDisques / AtelierCuisenaire)
 * 3. **Suivi**     (`Dashboard` + `TeacherMenu`)
 *
 * ────────────────────────────────────────────────────────────────
 * Navbar unifiée
 * ────────────────────────────────────────────────────────────────
 * L'ancien <header> dédié aux ateliers a été supprimé.
 * `Navbar` reçoit des props contextuelles :
 * - Sur SetupScreen : atelierMeta=null → titre fixe uniquement
 * - Sur un atelier  : atelierMeta + handlers → zone d'appui long
 *   (titre + badge) et bouton 📊 intégrés dans la même barre.
 *
 * ────────────────────────────────────────────────────────────────
 * Accès enseignant·e — appui long (≥ 2 s) sur la zone centrale
 * ────────────────────────────────────────────────────────────────
 * Un setTimeout de 2 000 ms déclenché sur pointerdown ouvre le
 * TeacherMenu. Le timer est annulé si le pointeur quitte la zone.
 *
 * ────────────────────────────────────────────────────────────────
 * État global minimal
 * ────────────────────────────────────────────────────────────────
 * - atelier    : identifiant de l'atelier sélectionné ou null
 * - totalSits  : nombre de situations (pour le Dashboard)
 * - events     : journal géré par useEventLog
 * - showMenu   : TeacherMenu visible
 * - showDash   : Dashboard visible
 *
 * Pas de Context API : prop drilling limité à deux niveaux.
 */

import { useState, useRef, useCallback } from "react";

import { useEventLog } from "./hooks/useEventLog.js";
import Navbar from "./components/Navbar.jsx";
import SetupScreen from "./components/SetupScreen.jsx";
import TeacherMenu from "./components/TeacherMenu.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import AtelierTangram from "./components/ateliers/AtelierTangram.jsx";
import AtelierDisques from "./components/ateliers/AtelierDisques.jsx";
import AtelierCuisenaire from "./components/ateliers/AtelierCuisenaire.jsx";

// ─── Métadonnées des ateliers ───────────────────────────────────────────────────

/**
 * @typedef {Object} AtelierMeta
 * @property {string} icon   - Emoji représentatif
 * @property {string} label  - Nom affiché
 * @property {string} color  - Couleur thématique (hex)
 * @property {string} light  - Couleur de fond claire (hex)
 * @property {string} border - Couleur de bordure (hex)
 * @property {string} sub    - Sous-titre
 */

/** @type {Object.<string, AtelierMeta>} */
const META = {
    tg: {
        icon: "🔷",
        label: "Tangram",
        color: "#2563EB",
        light: "#EFF6FF",
        border: "#BFDBFE",
        sub: "Fractions du carré",
    },
    dq: {
        icon: "⭕",
        label: "Disques",
        color: "#7C3AED",
        light: "#F5F3FF",
        border: "#DDD6FE",
        sub: "Fractions du disque",
    },
    cu: {
        icon: "📏",
        label: "Cuisenaire",
        color: "#B45309",
        light: "#FFFBEB",
        border: "#FDE68A",
        sub: "Fractions des réglettes",
    },
};

/** Durée de l'appui long déclenchant le TeacherMenu (ms) */
const LONG_PRESS_DELAY = 2000;

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Composant racine — gère le routage entre les vues et le journal d'événements.
 *
 * @returns {JSX.Element}
 */
export default function App() {
    const [atelier, setAtelier] = useState(null);
    const [totalSits, setTotalSits] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [showDash, setShowDash] = useState(false);

    const { events, log, resetLog } = useEventLog();
    /**
     * startTs est un état (et non une ref) car il est lu pendant le rendu
     * pour être passé en prop à Dashboard. Accéder à ref.current pendant
     * le rendu provoque l'erreur react-hooks/refs.
     */
    const [startTs, setStartTs] = useState(null);
    const holdRef = useRef(null);

    // ── Sélection de l'atelier ──────────────────────────────────────────────────
    const selectAtelier = useCallback(
        (id, total) => {
            resetLog();
            setAtelier(id);
            setTotalSits(total);
            setStartTs(Date.now());
        },
        [resetLog]
    );

    // ── Appui long — accès menu enseignant·e ────────────────────────────────────
    const startHold = useCallback(() => {
        holdRef.current = setTimeout(() => setShowMenu(true), LONG_PRESS_DELAY);
    }, []);

    const endHold = useCallback(() => {
        clearTimeout(holdRef.current);
    }, []);

    // ── Handlers TeacherMenu ────────────────────────────────────────────────────
    const handleOpenDash = useCallback(() => {
        setShowDash(true);
        setShowMenu(false);
    }, []);
    const handleChangeAtel = useCallback(() => {
        setAtelier(null);
        setShowMenu(false);
    }, []);
    const handleCloseMenu = useCallback(() => {
        setShowMenu(false);
    }, []);

    // ── Écran de sélection ──────────────────────────────────────────────────────
    if (!atelier) {
        return (
            <div
                className="min-h-screen pt-14"
                style={{ background: "#F1EDE4" }}
            >
                <Navbar />
                <SetupScreen onSelect={selectAtelier} />
            </div>
        );
    }

    // ── Vue atelier ─────────────────────────────────────────────────────────────
    const m = META[atelier];
    const hasSitDone = events.some((e) => e.type === "SIT_DONE");

    return (
        <div className="min-h-screen pt-14" style={{ background: "#F1EDE4" }}>
            {/* Navbar contextuelle — porte le badge atelier, le 📊 et l'appui long */}
            <Navbar
                atelierMeta={m}
                onLongPressStart={startHold}
                onLongPressEnd={endHold}
                onOpenDash={handleOpenDash}
                hasSitDone={hasSitDone}
            />

            {/* Contenu principal */}
            <main
                style={{ maxWidth: "680px", margin: "0 auto", padding: "16px" }}
            >
                <div className="bg-white rounded-3xl shadow-lg p-5">
                    {atelier === "tg" && <AtelierTangram key="tg" log={log} />}
                    {atelier === "dq" && <AtelierDisques key="dq" log={log} />}
                    {atelier === "cu" && (
                        <AtelierCuisenaire key="cu" log={log} />
                    )}
                </div>
                <p className="text-center text-xs text-slate-300 font-semibold mt-4 no-print">
                    Séquence fractions CE1 · Séance 6/6 · CAREC Grenoble · A.
                    Tricot
                </p>
            </main>

            {/* Menu enseignant·e */}
            {showMenu && (
                <TeacherMenu
                    onDash={handleOpenDash}
                    onChange={handleChangeAtel}
                    onClose={handleCloseMenu}
                />
            )}

            {/* Dashboard */}
            {showDash && (
                <Dashboard
                    events={events}
                    atelierMeta={{ ...m, total: totalSits }}
                    startTs={startTs}
                    onClose={() => setShowDash(false)}
                />
            )}
        </div>
    );
}
