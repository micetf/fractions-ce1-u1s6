/**
 * @file App.jsx — composant racine de l'application Fractions CE1.
 *
 * @description
 * Orchestre les quatre couches de l'application :
 *
 * 1. **Sélection atelier** (`SetupScreen`)        — l'enseignant·e choisit l'atelier
 * 2. **Sélection élève**   (`StudentSelectScreen`) — l'élève s'identifie
 * 3. **Activité**          (AtelierTangram / AtelierDisques / AtelierCuisenaire)
 * 4. **Suivi**             (`Dashboard` à deux onglets + `TeacherMenu`)
 *
 * ────────────────────────────────────────────────────────────────
 * Persistance des traces — traitement incrémental
 * ────────────────────────────────────────────────────────────────
 * `processedCountRef` mémorise le nombre d'événements déjà traités.
 * Le useEffect traite tous les NOUVEAUX événements depuis le dernier
 * rendu (events.slice(processedCountRef.current)), pas seulement le
 * dernier.
 *
 * Sans ce mécanisme, la dernière situation d'un atelier n'était pas
 * persistée : SIT_DONE et ATELIER_DONE étant émis dans le même appel
 * synchrone (doAdvance), React 18 les batchait en un seul rendu —
 * seul ATELIER_DONE était visible comme "dernier événement".
 *
 * Le curseur est remis à zéro quand events revient à [] (resetLog).
 *
 * ────────────────────────────────────────────────────────────────
 * Accès à la gestion des élèves
 * ────────────────────────────────────────────────────────────────
 * `handleManageRoster` ouvre le Dashboard directement sur l'onglet
 * "Classe". Il est accessible depuis `StudentSelectScreen` avant
 * toute session (startTs peut être null).
 *
 * ────────────────────────────────────────────────────────────────
 * Ouverture directe via URL
 * ────────────────────────────────────────────────────────────────
 * `?atelier=tg|dq|cu` bypasse SetupScreen et ouvre StudentSelectScreen.
 * `TeacherMenu → Changer d'atelier` remet l'URL à son état initial.
 *
 * @module App
 */

import { useState, useRef, useCallback, useEffect } from "react";

import { useEventLog } from "./hooks/useEventLog.js";
import { useRoster } from "./hooks/useRoster.js";
import { useStudentTraces } from "./hooks/useStudentTraces.js";
import Navbar from "./components/Navbar.jsx";
import SetupScreen from "./components/SetupScreen.jsx";
import TeacherMenu from "./components/TeacherMenu.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import StudentSelectScreen from "./components/roster/StudentSelectScreen.jsx";
import AtelierTangram from "./components/ateliers/AtelierTangram.jsx";
import AtelierDisques from "./components/ateliers/AtelierDisques.jsx";
import AtelierCuisenaire from "./components/ateliers/AtelierCuisenaire.jsx";
import { ATELIERS } from "./data/ateliers.js";

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Durée de l'appui long déclenchant le TeacherMenu (ms). */
const LONG_PRESS_DELAY = 2000;

/** Identifiants d'ateliers valides pour la lecture du paramètre URL. */
const VALID_ATELIERS = ["tg", "dq", "cu"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** @returns {string|null} Identifiant d'atelier valide ou null. */
function readUrlAtelier() {
    const p = new URLSearchParams(window.location.search).get("atelier");
    return VALID_ATELIERS.includes(p) ? p : null;
}

/**
 * Reconstruit un SituationSnapshot persistable depuis le journal d'événements.
 *
 * @param {Array}  events      - Journal complet (pour retrouver SIT_START et NAME_ERR)
 * @param {Object} sitDoneData - Payload de l'événement SIT_DONE
 * @returns {import('./utils/tracesHelpers.js').SituationSnapshot}
 */
function buildSnapshot(events, sitDoneData) {
    const {
        idx,
        label,
        predictCorrect,
        countErrors,
        nameErrors,
        durationMs,
        fullScore,
    } = sitDoneData;
    const start = events.find(
        (e) => e.type === "SIT_START" && e.data.idx === idx
    );
    const distractors = events
        .filter((e) => e.type === "NAME_ERR" && e.data.idx === idx)
        .map((e) => ({ chosen: e.data.chosen, answer: e.data.answer }));
    const status = fullScore
        ? "perfect"
        : nameErrors <= 2
          ? "good"
          : "struggled";
    return {
        idx,
        id: start?.data.id ?? `sit${idx}`,
        label,
        status,
        predictCorrect: predictCorrect ?? null,
        countErrors: countErrors ?? 0,
        nameErrors: nameErrors ?? 0,
        durationMs,
        fullScore,
        distractors,
    };
}

// ─── Composant ─────────────────────────────────────────────────────────────────

/**
 * Composant racine — gère le routage entre les vues et le journal d'événements.
 *
 * @returns {JSX.Element}
 */
export default function App() {
    // ── État de navigation ──────────────────────────────────────────────────────

    const urlAtelier = readUrlAtelier();
    const [atelier, setAtelier] = useState(urlAtelier);
    const [totalSits, setTotalSits] = useState(
        urlAtelier ? ATELIERS[urlAtelier].total : 0
    );
    const [showMenu, setShowMenu] = useState(false);
    const [showDash, setShowDash] = useState(false);

    /**
     * Onglet cible à l'ouverture du Dashboard.
     * "session" par défaut, "classe" depuis StudentSelectScreen.
     */
    const [dashDefaultTab, setDashDefaultTab] = useState("session");

    /** Élève actif en session. null = StudentSelectScreen affiché. */
    const [activeStudent, setActiveStudent] = useState(null);
    const [showStudentSelect, setShowStudentSelect] = useState(!!urlAtelier);

    // ── Hooks ───────────────────────────────────────────────────────────────────

    const { events, log, resetLog } = useEventLog();
    const [startTs, setStartTs] = useState(null);
    const holdRef = useRef(null);

    /**
     * Curseur de traitement incrémental des événements.
     * Pointe vers le nombre d'événements déjà persistés.
     * Remis à 0 à chaque resetLog (events → []).
     */
    const processedCountRef = useRef(0);

    const { students, addStudent, removeStudent } = useRoster();
    const {
        traces,
        openSession,
        appendSituation,
        markCompleted,
        resetStudent,
        resetAtelier,
        resetAll,
    } = useStudentTraces();

    // ── Persistance incrémentale des traces ─────────────────────────────────────

    useEffect(() => {
        // Remise à zéro du curseur quand le journal est vidé (resetLog)
        if (events.length === 0) {
            processedCountRef.current = 0;
            return;
        }

        if (!activeStudent || !atelier) return;

        // Traitement de tous les événements non encore persistés
        const newEvents = events.slice(processedCountRef.current);
        newEvents.forEach((event) => {
            if (event.type === "SIT_DONE") {
                appendSituation(
                    atelier,
                    activeStudent.id,
                    buildSnapshot(events, event.data)
                );
            } else if (event.type === "ATELIER_DONE") {
                markCompleted(atelier, activeStudent.id);
            }
        });

        processedCountRef.current = events.length;
    }, [events, activeStudent, atelier, appendSituation, markCompleted]);

    // ── Sélection de l'atelier (enseignant·e) ───────────────────────────────────

    const selectAtelier = useCallback(
        (id, total) => {
            resetLog();
            setAtelier(id);
            setTotalSits(total);
            setActiveStudent(null);
            setShowStudentSelect(true);
            history.replaceState(null, "", `?atelier=${id}`);
        },
        [resetLog]
    );

    // ── Sélection de l'élève ────────────────────────────────────────────────────

    const handleSelectStudent = useCallback(
        (student) => {
            resetLog();
            setStartTs(Date.now());
            openSession(atelier, student.id);
            setActiveStudent(student);
            setShowStudentSelect(false);
        },
        [atelier, openSession, resetLog]
    );

    const handleChangeStudent = useCallback(() => {
        setActiveStudent(null);
        setShowStudentSelect(true);
        setShowMenu(false);
        resetLog();
    }, [resetLog]);

    // ── Gestion du registre — accès direct depuis StudentSelectScreen ────────────

    const handleManageRoster = useCallback(() => {
        setDashDefaultTab("classe");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    // ── Appui long — accès menu enseignant·e ────────────────────────────────────

    const startHold = useCallback(() => {
        holdRef.current = setTimeout(() => setShowMenu(true), LONG_PRESS_DELAY);
    }, []);

    const endHold = useCallback(() => clearTimeout(holdRef.current), []);

    // ── Handlers TeacherMenu ────────────────────────────────────────────────────

    const handleOpenDash = useCallback(() => {
        setDashDefaultTab("session");
        setShowDash(true);
        setShowMenu(false);
    }, []);

    const handleChangeAtel = useCallback(() => {
        resetLog();
        setAtelier(null);
        setActiveStudent(null);
        setShowStudentSelect(false);
        setShowMenu(false);
        history.replaceState(null, "", window.location.pathname);
    }, [resetLog]);

    const handleCloseMenu = useCallback(() => setShowMenu(false), []);

    // ── Fermeture du Dashboard ──────────────────────────────────────────────────

    const handleCloseDash = useCallback(() => {
        setShowDash(false);
        setDashDefaultTab("session");
    }, []);

    // ── Écran de sélection d'atelier ────────────────────────────────────────────

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

    const m = ATELIERS[atelier];
    const hasSitDone = events.some((e) => e.type === "SIT_DONE");

    return (
        <div className="min-h-screen pt-14" style={{ background: "#F1EDE4" }}>
            <Navbar
                atelierMeta={m}
                activeStudent={activeStudent}
                onLongPressStart={startHold}
                onLongPressEnd={endHold}
                onOpenDash={handleOpenDash}
                hasSitDone={hasSitDone}
            />

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

            {/* Sélection de l'élève — overlay z-40, sous Navbar z-50 */}
            {showStudentSelect && (
                <StudentSelectScreen
                    students={students}
                    atelierMeta={m}
                    onSelect={handleSelectStudent}
                    onManage={handleManageRoster}
                />
            )}

            {/* Menu enseignant·e */}
            {showMenu && (
                <TeacherMenu
                    onDash={handleOpenDash}
                    onChange={handleChangeAtel}
                    onChangeStudent={handleChangeStudent}
                    onClose={handleCloseMenu}
                />
            )}

            {/* Dashboard — startTs nullable, onglet ciblé via defaultTab */}
            {showDash && (
                <Dashboard
                    events={events}
                    atelierMeta={{ ...m, total: totalSits }}
                    startTs={startTs}
                    defaultTab={dashDefaultTab}
                    onClose={handleCloseDash}
                    students={students}
                    traces={traces}
                    atelierID={atelier}
                    addStudent={addStudent}
                    removeStudent={removeStudent}
                    resetStudent={resetStudent}
                    resetAtelier={resetAtelier}
                    resetAll={resetAll}
                />
            )}
        </div>
    );
}
